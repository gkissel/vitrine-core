import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import { WHATSAPP_MODULE } from "../../../../modules/whatsapp";
import type WhatsAppModuleService from "../../../../modules/whatsapp/service";
import { createOrderFromCartWorkflow } from "../../../../workflows/create-order-from-cart";

function formatMoney(amount: number | string, currencyCode: string): string {
  const numericAmount = Number(amount ?? 0);
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
    }).format(numericAmount);
  } catch {
    return `${currencyCode.toUpperCase()} ${numericAmount.toFixed(2)}`;
  }
}

const DEFAULT_MESSAGE_TEMPLATE = `Olá! Gostaria de fazer um pedido: Pedido #{{id_do_pedido}} Itens: {{linhas_de_itens}} Subtotal: {{subtotal}}{{desconto}} Total: {{total}} Dados de entrega: Nome: {{nome_do_cliente}} Endereço: {{endereco}} Aguardo confirmação e forma de pagamento. Obrigado!`;

const DEFAULT_WHATSAPP_NUMBER = "";

function applyTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (msg, [key, value]) =>
      msg.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value),
    template,
  );
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { cart_id, customer_name, delivery_address } = req.body as {
    cart_id: string;
    customer_name?: string;
    delivery_address?: string;
  };

  if (!cart_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "cart_id é obrigatório",
    );
  }

  const { result } = await createOrderFromCartWorkflow(req.scope).run({
    input: { cart_id },
  });

  const order = result.order;
  const query = req.scope.resolve("query");
  const {
    data: [fullOrder],
  } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "currency_code",
      "total",
      "subtotal",
      "tax_total",
      "discount_total",
      "discount_tax_total",
      "original_total",
      "original_subtotal",
      "original_tax_total",
      "item_total",
      "item_subtotal",
      "item_tax_total",
      "original_item_total",
      "original_item_subtotal",
      "original_item_tax_total",
      "shipping_total",
      "shipping_subtotal",
      "shipping_tax_total",
      "original_shipping_total",
      "original_shipping_subtotal",
      "original_shipping_tax_total",
      "items.*",
      "shipping_methods.*",
      "summary.*",
    ],
    filters: {
      id: order.id,
    },
  });

  if (!fullOrder) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Pedido criado, mas não foi possível recarregar os totais",
    );
  }

  const whatsappService: WhatsAppModuleService =
    req.scope.resolve(WHATSAPP_MODULE);
  const configs = await whatsappService.listWhatsAppConfigs();
  const config = configs[0];

  const whatsappNumber = config?.whatsapp_number || DEFAULT_WHATSAPP_NUMBER;
  const template = config?.message_template || DEFAULT_MESSAGE_TEMPLATE;

  const currency = fullOrder.currency_code ?? "brl";

  interface OrderLineItem {
    variant_title?: string | null;
    product_title?: string | null;
    quantity?: number;
    total?: number | string | null;
  }

  const itemLines = ((fullOrder.items ?? []) as unknown as OrderLineItem[])
    .map((item) => {
      const productName =
        item.product_title ||
        (item as { title?: string | null }).title ||
        "Produto sem nome";
      const variantName =
        item.variant_title && item.variant_title !== "Default Variant"
          ? item.variant_title
          : null;
      const quantity = Number(item.quantity ?? 0) || 0;
      const lineTotal =
        Number(item.total ?? 0) ||
        (Number((item as { unit_price?: number | string }).unit_price ?? 0) ||
          0) * quantity;
      return `\u2022 ${quantity}x ${productName}${variantName ? ` | Variante: ${variantName}` : ""} \u2014 ${formatMoney(lineTotal, currency)}`;
    })
    .join("\n");

  const discountTotal = Number(fullOrder.discount_total ?? 0);
  const discount =
    discountTotal > 0
      ? `\nDesconto: -${formatMoney(discountTotal, currency)}`
      : "";

  const message = applyTemplate(template, {
    id_do_pedido: order.id,
    linhas_de_itens: itemLines,
    subtotal: formatMoney(
      Number(fullOrder.item_subtotal ?? fullOrder.subtotal ?? 0),
      currency,
    ),
    desconto: discount,
    total: formatMoney(
      Number(fullOrder.total ?? fullOrder.raw_total ?? 0),
      currency,
    ),
    nome_do_cliente: customer_name || "",
    endereco: delivery_address || "",
  });

  res.json({
    order_id: order.id,
    whatsapp_number: whatsappNumber,
    message,
  });
}

import type { Metadata } from "next";
import { siteBrand } from "@repo/site-config";
import { FaqSection } from "components/faq/faq-section";
import {
  buildFaqPageJsonLd,
  JsonLdScript,
  type FaqEntry,
} from "lib/structured-data";

const FAQ_ENTRIES_BY_LOCALE: Record<string, FaqEntry[]> = {
  en: [
    {
      question: "How long does standard shipping take?",
      answer:
        "Standard shipping takes 3–5 business days within the continental US. Expedited (1–2 business day) and overnight options are available at checkout.",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Yes — we ship to 42 countries. International orders typically arrive in 7–14 business days. Duties and import taxes are the customer's responsibility and may apply at delivery.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer free returns within 30 days of delivery — no questions asked. Items must be unused and in their original packaging. Start a return from your account dashboard or contact our support team.",
    },
    {
      question: "How long does a refund take to process?",
      answer:
        "Refunds are issued within 2 business days of us receiving your return. Depending on your bank, the funds will appear in your account within 3–10 business days after that.",
    },
    {
      question: "Are your product photos accurate?",
      answer:
        "We use only natural light and unedited images so what you see matches what you get. Colors may vary slightly across different screen calibrations.",
    },
    {
      question: "Do you restock sold-out items?",
      answer:
        "Most products are restocked on a regular cycle. Use the 'Notify me' button on any sold-out product page and we'll email you the moment it's back in stock.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit and debit cards (Visa, Mastercard, Amex, Discover), Apple Pay, Google Pay, and Shop Pay. All transactions are processed securely via Stripe.",
    },
    {
      question: "Is my payment information stored?",
      answer:
        "We never store raw card numbers. When you save a card for future purchases, it is tokenized by Stripe and stored on their PCI-compliant servers — your details never touch ours.",
    },
  ],
  "pt-BR": [
    {
      question: "Quanto tempo leva o frete padrão?",
      answer:
        "O frete padrão leva de 3 a 5 dias úteis dentro dos EUA continentais. Opções expressas (1 a 2 dias úteis) e overnight estão disponíveis no checkout.",
    },
    {
      question: "Vocês fazem envios internacionais?",
      answer:
        "Sim — enviamos para 42 países. Os pedidos internacionais normalmente chegam em 7 a 14 dias úteis. Impostos e taxas de importação são de responsabilidade do cliente e podem ser cobrados na entrega.",
    },
    {
      question: "Qual é a política de devolução?",
      answer:
        "Oferecemos devoluções gratuitas em até 30 dias após a entrega, sem perguntas. Os itens devem estar sem uso e na embalagem original. Inicie a devolução pelo painel da sua conta ou entre em contato com nosso time de suporte.",
    },
    {
      question: "Quanto tempo leva para processar um reembolso?",
      answer:
        "Os reembolsos são emitidos em até 2 dias úteis após o recebimento da devolução. Dependendo do seu banco, o valor pode aparecer na sua conta em 3 a 10 dias úteis depois disso.",
    },
    {
      question: "As fotos dos produtos são fiéis?",
      answer:
        "Usamos apenas luz natural e imagens sem edição para que o que você vê seja o que você recebe. As cores podem variar levemente entre diferentes telas.",
    },
    {
      question: "Vocês repõem itens esgotados?",
      answer:
        "A maioria dos produtos é reabastecida regularmente. Use o botão 'Avise-me' em qualquer página de produto esgotado e enviaremos um e-mail quando ele voltar ao estoque.",
    },
    {
      question: "Quais formas de pagamento vocês aceitam?",
      answer:
        "Aceitamos os principais cartões de crédito e débito (Visa, Mastercard, Amex, Discover), Apple Pay, Google Pay e Shop Pay. Todas as transações são processadas com segurança via Stripe.",
    },
    {
      question: "As informações de pagamento ficam armazenadas?",
      answer:
        "Nunca armazenamos números brutos de cartão. Quando você salva um cartão para compras futuras, ele é tokenizado pela Stripe e armazenado em servidores compatíveis com PCI — seus dados não passam pelos nossos sistemas.",
    },
  ],
};

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about shipping, returns, products, and payments.",
  alternates: {
    canonical: "/faq",
  },
};

export default function FaqPage() {
  const faqEntries = FAQ_ENTRIES_BY_LOCALE[siteBrand.locale] ?? FAQ_ENTRIES_BY_LOCALE["pt-BR"];
  const faqJsonLd = buildFaqPageJsonLd(faqEntries);

  return (
    <>
      <JsonLdScript data={faqJsonLd} />
      <FaqSection />
    </>
  );
}

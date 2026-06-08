import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "@medusajs/framework/zod";
import { WHATSAPP_MODULE } from "../../../modules/whatsapp";
import type WhatsAppModuleService from "../../../modules/whatsapp/service";

export const PostAdminWhatsAppConfigSchema = z.object({
	whatsapp_number: z.string().min(1, "Número do WhatsApp é obrigatório"),
	message_template: z.string().min(1, "Modelo de mensagem é obrigatório"),
});

export type PostAdminWhatsAppConfigReq = z.infer<typeof PostAdminWhatsAppConfigSchema>;

export const GET = async (_req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
	const whatsappService: WhatsAppModuleService = _req.scope.resolve(WHATSAPP_MODULE);
	const configs = await whatsappService.listWhatsAppConfigs();

	res.json({ whatsapp_config: configs[0] || null });
};

export const POST = async (req: AuthenticatedMedusaRequest<PostAdminWhatsAppConfigReq>, res: MedusaResponse) => {
	const whatsappService: WhatsAppModuleService = req.scope.resolve(WHATSAPP_MODULE);
	const body = req.validatedBody;

	// Upsert: update existing or create new (singleton pattern)
	const existing = await whatsappService.listWhatsAppConfigs();

	let config: Record<string, unknown> | undefined;
	if (existing[0]) {
		config = await whatsappService.updateWhatsAppConfigs({
			id: existing[0].id,
			...body,
		});
	} else {
		config = await whatsappService.createWhatsAppConfigs(body);
	}

	res.json({ whatsapp_config: config });
};

import { MedusaService } from "@medusajs/framework/utils";
import WhatsAppConfig from "./models/whatsapp-config";

class WhatsAppModuleService extends MedusaService({
	WhatsAppConfig,
}) {}

export default WhatsAppModuleService;

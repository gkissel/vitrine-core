import { model } from "@medusajs/framework/utils";

const WhatsAppConfig = model.define("whatsapp_config", {
	id: model.id().primaryKey(),
	whatsapp_number: model.text(),
	message_template: model.text(),
});

export default WhatsAppConfig;

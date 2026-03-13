import {
	defineMiddlewares,
	validateAndTransformBody,
} from "@medusajs/framework/http";
import { completeWhatsAppOrderRequestSchema } from "./whatsapp-checkout/route";

export default defineMiddlewares({
	routes: [
		{
			matcher: "/store/whatsapp-checkout/complete",
			method: ["POST"],
			middlewares: [
				validateAndTransformBody(completeWhatsAppOrderRequestSchema),
			],
		},
	],
});

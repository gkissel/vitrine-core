import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { trackShipmentCreatedWorkflow } from "../workflows/analytics/track-shipment-created";

type ShipmentCreatedPayload = {
  id: string;
  no_notification: boolean;
};

export default async function shipmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<ShipmentCreatedPayload>) {
  const logger = container.resolve("logger");

  try {
    await trackShipmentCreatedWorkflow(container).run({
      input: { fulfillment_id: data.id },
    });
  } catch (error) {
    logger.warn(
      `[analytics] Failed to track shipment_created for ${data.id}: ${error}`,
    );
  }
}

export const config: SubscriberConfig = {
  event: "shipment.created",
};

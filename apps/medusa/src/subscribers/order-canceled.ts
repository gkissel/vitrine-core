import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { trackOrderCanceledWorkflow } from "../workflows/analytics/track-order-canceled";

export default async function orderCanceledHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");

  try {
    await trackOrderCanceledWorkflow(container).run({
      input: { order_id: data.id },
    });
  } catch (error) {
    logger.warn(
      `[analytics] Failed to track order_canceled for ${data.id}: ${error}`,
    );
  }
}

export const config: SubscriberConfig = {
  event: "order.canceled",
};

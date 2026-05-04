import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { trackOrderPlacedWorkflow } from "../workflows/analytics/track-order-placed";

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");

  try {
    await trackOrderPlacedWorkflow(container).run({
      input: { order_id: data.id },
    });
  } catch (error) {
    logger.warn(
      `[analytics] Failed to track order_placed for ${data.id}: ${error}`,
    );
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};

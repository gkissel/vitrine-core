import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { trackCustomerCreatedWorkflow } from "../workflows/analytics/track-customer-created";

export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");

  try {
    await trackCustomerCreatedWorkflow(container).run({
      input: { customer_id: data.id },
    });
  } catch (error) {
    logger.warn(
      `[analytics] Failed to track customer_created for ${data.id}: ${error}`,
    );
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
};

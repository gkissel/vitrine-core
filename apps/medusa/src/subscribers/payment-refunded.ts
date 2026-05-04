import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { trackPaymentRefundedWorkflow } from "../workflows/analytics/track-payment-refunded";

export default async function paymentRefundedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");

  try {
    await trackPaymentRefundedWorkflow(container).run({
      input: { payment_id: data.id },
    });
  } catch (error) {
    logger.warn(
      `[analytics] Failed to track payment_refunded for ${data.id}: ${error}`,
    );
  }
}

export const config: SubscriberConfig = {
  event: "payment.refunded",
};

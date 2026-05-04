import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { revalidationTags } from "@repo/revalidation";
import { sendRevalidationWebhook } from "../lib/revalidation/webhook";

type OrderEventData = {
    id?: string;
};

export default async function revalidateOrders({ event }: SubscriberArgs<OrderEventData>) {
    const orderId = event.data?.id;

    await sendRevalidationWebhook({
        reason: "order changed",
        tags: orderId
            ? [revalidationTags.orders.all, revalidationTags.orders.order(orderId)]
            : [revalidationTags.orders.all],
    });
}

export const config: SubscriberConfig = {
    event: ["order.created", "order.updated", "order.canceled"],
};
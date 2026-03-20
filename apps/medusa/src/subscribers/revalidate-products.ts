import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { revalidationTags } from "@repo/revalidation";
import { sendRevalidationWebhook } from "../lib/revalidation/webhook";

type ProductEventData = {
    id?: string;
};

export default async function revalidateProducts({ event }: SubscriberArgs<ProductEventData>) {
    const productId = event.data?.id;

    await sendRevalidationWebhook({
        reason: "product changed",
        tags: productId
            ? [revalidationTags.catalog.products, revalidationTags.catalog.product(productId)]
            : [revalidationTags.catalog.products],
    });
}

export const config: SubscriberConfig = {
    event: ["product.created", "product.updated", "product.deleted"],
};
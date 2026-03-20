import {
    isRevalidationWebhookPayload,
    revalidationTags,
} from "@repo/revalidation";

describe("revalidation contract", () => {
    it("accepts a typed payload", () => {
        expect(
            isRevalidationWebhookPayload({
                tags: [revalidationTags.catalog.products, revalidationTags.orders.order("order_123")],
                source: "medusa",
            }),
        ).toBe(true);
    });

    it("rejects unknown tags", () => {
        expect(
            isRevalidationWebhookPayload({
                tags: ["not-a-real-tag"],
            }),
        ).toBe(false);
    });
});
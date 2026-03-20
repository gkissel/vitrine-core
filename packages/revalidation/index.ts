export const REVALIDATION_WEBHOOK_SECRET_HEADER = "x-revalidation-secret" as const;

export const revalidationTags = {
    catalog: {
        products: "catalog.products",
        product: (productId: string) => `catalog.product.${productId}` as const,
    },
    reviews: {
        all: "reviews.all",
        product: (productId: string) => `reviews.product.${productId}` as const,
    },
    wishlist: {
        all: "wishlist.all",
        customer: (customerId: string) => `wishlist.customer.${customerId}` as const,
    },
    orders: {
        all: "orders.all",
        order: (orderId: string) => `orders.order.${orderId}` as const,
    },
} as const;

export type CatalogStaticTag = typeof revalidationTags.catalog.products;
export type ReviewsStaticTag = typeof revalidationTags.reviews.all;
export type WishlistStaticTag = typeof revalidationTags.wishlist.all;
export type OrdersStaticTag = typeof revalidationTags.orders.all;

export type RevalidationTag =
    | CatalogStaticTag
    | ReviewsStaticTag
    | WishlistStaticTag
    | OrdersStaticTag
    | `catalog.product.${string}`
    | `reviews.product.${string}`
    | `wishlist.customer.${string}`
    | `orders.order.${string}`;

export type RevalidationWebhookPayload = {
    tags: RevalidationTag[];
    source?: "medusa";
    reason?: string;
};

const staticTags = new Set<string>([
    revalidationTags.catalog.products,
    revalidationTags.reviews.all,
    revalidationTags.wishlist.all,
    revalidationTags.orders.all,
]);

const dynamicPrefixes = [
    "catalog.product.",
    "reviews.product.",
    "wishlist.customer.",
    "orders.order.",
] as const;

export function isRevalidationTag(value: string): value is RevalidationTag {
    return staticTags.has(value) || dynamicPrefixes.some((prefix) => value.startsWith(prefix));
}

export function isRevalidationWebhookPayload(value: unknown): value is RevalidationWebhookPayload {
    if (!value || typeof value !== "object") {
        return false;
    }

    const payload = value as Record<string, unknown>;

    if (!Array.isArray(payload.tags) || payload.tags.length === 0) {
        return false;
    }

    return payload.tags.every((tag) => typeof tag === "string" && isRevalidationTag(tag));
}
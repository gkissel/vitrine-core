import { env } from "@repo/env";
import {
    REVALIDATION_WEBHOOK_SECRET_HEADER,
    type RevalidationTag,
    type RevalidationWebhookPayload,
} from "@repo/revalidation";

type SendRevalidationWebhookInput = {
    tags: RevalidationTag[];
    reason: string;
};

export async function sendRevalidationWebhook({
    tags,
    reason,
}: SendRevalidationWebhookInput) {
    if (!env.REVALIDATION_WEBHOOK_URL || !env.REVALIDATION_WEBHOOK_SECRET) {
        return;
    }

    const payload: RevalidationWebhookPayload = {
        tags,
        reason,
        source: "medusa",
    };

    const response = await fetch(env.REVALIDATION_WEBHOOK_URL, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            [REVALIDATION_WEBHOOK_SECRET_HEADER]: env.REVALIDATION_WEBHOOK_SECRET,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const responseText = await response.text().catch(() => "");
        throw new Error(
            `Failed to revalidate frontend cache tags (${response.status}): ${responseText}`,
        );
    }
}
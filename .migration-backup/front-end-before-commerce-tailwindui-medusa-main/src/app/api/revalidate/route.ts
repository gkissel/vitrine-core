import {
    isRevalidationWebhookPayload,
    REVALIDATION_WEBHOOK_SECRET_HEADER,
    type RevalidationWebhookPayload,
} from "@repo/revalidation";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function hasValidSecret(request: NextRequest) {
    const expectedSecret = process.env.REVALIDATION_WEBHOOK_SECRET ?? "";

    if (!expectedSecret) {
        return false;
    }

    return request.headers.get(REVALIDATION_WEBHOOK_SECRET_HEADER) === expectedSecret;
}

export async function POST(request: NextRequest) {
    if (!hasValidSecret(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!isRevalidationWebhookPayload(body)) {
        return NextResponse.json({ error: "Invalid revalidation payload" }, { status: 400 });
    }

    const payload = body as RevalidationWebhookPayload;

    for (const tag of payload.tags) {
        revalidateTag(tag, "max");
    }

    return NextResponse.json({
        ok: true,
        revalidatedTags: payload.tags,
    });
}

import { createHash } from "node:crypto";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import type { PostStoreContactSchema } from "./validators";

type AnalyticsTrackPayload = {
  event: string;
  actor_id: string;
  properties: Record<string, unknown>;
};

type AnalyticsLike = {
  track: (payload: AnalyticsTrackPayload) => Promise<void>;
};

export async function POST(
  req: MedusaRequest<PostStoreContactSchema>,
  res: MedusaResponse,
) {
  const { company: _company, ...input } = req.validatedBody;
  const analyticsActorId = `contact_${createHash("sha256")
    .update(input.email)
    .digest("hex")
    .slice(0, 24)}`;
  let analytics: AnalyticsLike | null = null;

  try {
    analytics = req.scope.resolve(Modules.ANALYTICS) as AnalyticsLike;
  } catch {
    analytics = null;
  }

  if (analytics) {
    await analytics.track({
      event: "contact_form_failed",
      actor_id: analyticsActorId,
      properties: {
        source: "store_contact_api",
        error_type: "contact_disabled",
      },
    });
  }

  res.status(503).json({
    message: "Contact form delivery is currently unavailable.",
    type: "contact_disabled",
  });
}

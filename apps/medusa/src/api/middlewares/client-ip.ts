import type { MedusaRequest } from "@medusajs/framework/http";

function getForwardedHeaderValue(
  value: string | string[] | undefined,
): string | undefined {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return undefined;
  }

  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) {
    return undefined;
  }

  return candidate
    .split(",")
    .map((entry) => entry.trim())
    .find(Boolean);
}

export function getClientIp(req: MedusaRequest): string | undefined {
  return (
    req.ip ||
    getForwardedHeaderValue(req.headers["cf-connecting-ip"]) ||
    getForwardedHeaderValue(req.headers["true-client-ip"]) ||
    getForwardedHeaderValue(req.headers["x-real-ip"]) ||
    getForwardedHeaderValue(req.headers["x-forwarded-for"]) ||
    req.socket.remoteAddress ||
    undefined
  );
}

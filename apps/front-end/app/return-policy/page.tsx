import type { Metadata } from "next";
import { siteBrand } from "@repo/site-config";
import { PolicyPage } from "components/legal/policy-page";
import { getReturnPolicy } from "lib/constants/legal-content";

export const metadata: Metadata = {
  title: "Return Policy",
  description: "Understand our return and refund process.",
  robots: { index: true },
};

export default function ReturnPolicyPage() {
  return <PolicyPage {...getReturnPolicy(siteBrand.locale)} />;
}

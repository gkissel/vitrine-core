import { siteBrand } from "@repo/site-config";
import OpengraphImage from "components/template-opengraph-image";

export const alt = `Prévia social de ${siteBrand.siteName}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return await OpengraphImage();
}

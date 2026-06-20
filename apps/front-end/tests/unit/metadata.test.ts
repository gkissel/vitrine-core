import { rootMetadata } from "lib/metadata";
import { describe, expect, it } from "vitest";

describe("root metadata", () => {
  it("provides default open graph metadata for non-product pages", () => {
    expect(rootMetadata.openGraph).toMatchObject({
      type: "website",
      title: "Erva Mate para o Brasil",
      description:
        "Loja brasileira de erva-mate, cuias, bombas e acessórios para preparar um mate de verdade.",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
        },
      ],
    });
  });

  it("provides a default summary large image twitter card", () => {
    expect(rootMetadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Erva Mate para o Brasil",
      description:
        "Loja brasileira de erva-mate, cuias, bombas e acessórios para preparar um mate de verdade.",
      images: ["/opengraph-image"],
    });
  });
});

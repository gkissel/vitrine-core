import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typedRoutes: true,
  cacheComponents: true,
  transpilePackages: ["@repo/revalidation"],
};

export default nextConfig;

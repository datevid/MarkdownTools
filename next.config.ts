import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  turbopack: {
    resolveAlias: {
      "decode-named-character-reference":
        "./node_modules/decode-named-character-reference/index.js",
      "hast-util-from-html-isomorphic":
        "./node_modules/hast-util-from-html-isomorphic/index.js",
    },
  },
};

export default nextConfig;

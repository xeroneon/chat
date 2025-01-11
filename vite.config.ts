import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      external: [
        "bcrypt",
        "nock",
        "aws-sdk",
        "mock-aws-s3",
        "@mapbox/node-pre-gyp",
        /node-pre-gyp/,
        /\.node$/,
      ],
    },
  },
  optimizeDeps: {
    exclude: ["bcrypt", "@mapbox/node-pre-gyp"],
  },
  ssr: {
    external: ["bcrypt", "@mapbox/node-pre-gyp"],
  },
});

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";

// Prod deploy (the `/wrapped/` build published by the GitHub Action) is signalled
// via WRAPPED=1. Local `pnpm build` keeps the root base, console.debug, and no
// analyzer so it still builds and stays debuggable.
const isProd = process.env.WRAPPED === "1";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
	base: isProd ? "/wrapped/" : "/",
	esbuild: command === "build" && isProd ? { pure: ["console.debug"] } : {},
	// Bundle analyzer is opt-in (ANALYZE=1) — its default server mode blocks the
	// build from exiting, which would hang CI/Docker `pnpm build`.
	plugins: [
		...(process.env.ANALYZE ? [analyzer()] : []),
		vanillaExtractPlugin(),
		react(),
	],
	optimizeDeps: {
		// esbuild pre-bundling breaks duckdb-wasm's wasm/worker URL resolution.
		exclude: ["@duckdb/duckdb-wasm"],
	},
}));

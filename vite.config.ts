import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	base: "./",
	plugins: [vanillaExtractPlugin(), react()],
	optimizeDeps: {
		// esbuild pre-bundling breaks duckdb-wasm's wasm/worker URL resolution.
		exclude: ["@duckdb/duckdb-wasm"],
	},
});

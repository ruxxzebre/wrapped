import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
	// Production (`vite build`, what the GitHub Action runs) deploys under
	// github.io/wrapped/, so emit absolute /wrapped/... asset URLs — correct from
	// the first byte, with no runtime <base> tag racing the favicon preload. Dev
	// (`vite serve`) stays at root "/". BASE_URL follows, so asset() resolves
	// public files correctly in both.
	base: command === "build" ? "/wrapped/" : "/",
	plugins: [vanillaExtractPlugin(), react()],
	optimizeDeps: {
		// esbuild pre-bundling breaks duckdb-wasm's wasm/worker URL resolution.
		exclude: ["@duckdb/duckdb-wasm"],
	},
}));

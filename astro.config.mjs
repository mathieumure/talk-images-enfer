import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
	site: process.env.ASTRO_SITE || "https://jsulpis.github.io",
	base: process.env.ASTRO_BASE || "/",
	integrations: [react()],
});

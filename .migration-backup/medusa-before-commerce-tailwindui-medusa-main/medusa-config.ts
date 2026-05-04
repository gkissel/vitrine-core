import { defineConfig, loadEnv } from "@medusajs/framework/utils";
import { z } from "@medusajs/framework/zod";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

const envSchema = z.object({
	STORE_CORS: z
		.string()
		.default("http://localhost:8000,https://docs.medusajs.com"),
	ADMIN_CORS: z
		.string()
		.default(
			"http://localhost:5173,http://localhost:9000,https://docs.medusajs.com",
		),
	AUTH_CORS: z
		.string()
		.default(
			"http://localhost:5173,http://localhost:9000,http://localhost:8000,https://docs.medusajs.com",
		),
	JWT_SECRET: z.string().default("supersecret"),
	COOKIE_SECRET: z.string().default("supersecret"),
	DATABASE_URL: z
		.string()
		.default("postgresql://postgres:docker@localhost:5435/medusa"),
});

const runtimeEnv = {
	STORE_CORS: process.env.STORE_CORS,
	ADMIN_CORS: process.env.ADMIN_CORS,
	AUTH_CORS: process.env.AUTH_CORS,
	JWT_SECRET: process.env.JWT_SECRET,
	COOKIE_SECRET: process.env.COOKIE_SECRET,
	DATABASE_URL: process.env.DATABASE_URL,
};

const env = envSchema.parse({ runtimeEnv });

// biome-ignore lint/style/noCommonJs: Medusa
module.exports = defineConfig({
	projectConfig: {
		databaseUrl: env.DATABASE_URL,
		http: {
			storeCors: env.STORE_CORS,
			adminCors: env.ADMIN_CORS,
			authCors: env.AUTH_CORS,
			jwtSecret: env.JWT_SECRET || "supersecret",
			cookieSecret: env.COOKIE_SECRET || "supersecret",
		},
	},
});

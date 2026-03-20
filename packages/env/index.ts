import { z } from "zod";

const envSchema = z.object({
	MEDUSA_ADMIN_ONBOARDING_TYPE: z.string().default("nextjs"),
	STORE_CORS: z.string().default("http://localhost:8000,https://docs.medusajs.com"),
	ADMIN_CORS: z.string().default("http://localhost:5173,http://localhost:9000,https://docs.medusajs.com"),
	AUTH_CORS: z
		.string()
		.default("http://localhost:5173,http://localhost:9000,http://localhost:8000,https://docs.medusajs.com"),
	REDIS_URL: z.string().default("redis://localhost:6379"),
	JWT_SECRET: z.string().default("supersecret"),
	COOKIE_SECRET: z.string().default("supersecret"),
	DATABASE_URL: z.string().default("postgresql://postgres:docker@localhost:5435/medusa"),
	MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY: z.string().default("front-end"),
	REVALIDATION_WEBHOOK_URL: z.string().default(""),
	REVALIDATION_WEBHOOK_SECRET: z.string().default(""),
	NODE_ENV: z.string().optional(),
});

const runtimeEnv = {
	MEDUSA_ADMIN_ONBOARDING_TYPE: process.env.MEDUSA_ADMIN_ONBOARDING_TYPE,
	STORE_CORS: process.env.STORE_CORS,
	ADMIN_CORS: process.env.ADMIN_CORS,
	AUTH_CORS: process.env.AUTH_CORS,
	REDIS_URL: process.env.REDIS_URL,
	JWT_SECRET: process.env.JWT_SECRET,
	COOKIE_SECRET: process.env.COOKIE_SECRET,
	DATABASE_URL: process.env.DATABASE_URL,
	MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY: process.env.MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY,
	REVALIDATION_WEBHOOK_URL: process.env.REVALIDATION_WEBHOOK_URL,
	REVALIDATION_WEBHOOK_SECRET: process.env.REVALIDATION_WEBHOOK_SECRET,
	NODE_ENV: process.env.NODE_ENV,
};

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(runtimeEnv);

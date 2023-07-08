import { PrismaClient } from "@prisma/client";

export declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "development" | "production";
			DISCORD_TOKEN: string;
			DATABASE_URL: string;
		}
	}
}

declare module "@sapphire/framework" {
	interface Preconditions {
		DeveloperOnlyPrecondition: never;
	}
}

declare module "@sapphire/pieces" {
	interface Container {
		database: PrismaClient;
	}
}

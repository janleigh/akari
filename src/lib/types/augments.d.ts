export declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "development" | "production";
			DISCORD_TOKEN: string;
		}
	}
}

declare module "@sapphire/framework" {
	interface Preconditions {
		DeveloperOnlyPrecondition: never;
	}
}

import { PrismaClient } from "@prisma/client";
import { ListenMoeWebSocket } from "../structures/ws/ListenMoeWebSocket";

export declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "development" | "production";
			API_URL: string;
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
		players: Map<string, string>;
		listenmoeJPOP: ListenMoeWebSocket;
		listenmoeKPOP: ListenMoeWebSocket;
	}
}

declare namespace ListenMoe {
	type ListenMoeResponse = {
		op: number;
		d: SongResponse & HeartBeatResponse & ListenerResponse;
		t?: string;
	};

	type HeartBeatResponse = {
		message: string;
		heartbeat: number;
	};

	type ArtistData = {
		id: number;
		name: string;
		nameRomaji: string;
	};

	type SongResponse = {
		song: {
			id: number;
			title: string;
			sources: array;
			artists: ArtistData[];
			characters: array;
			albums: array;
			duration: number;
		};
	};

	type ListenerResponse = {
		listeners: number;
	};
}

import { SapphireClient, container } from "@sapphire/framework";
import { CLIENT_OPTIONS } from "../../config";
import { PrismaClient } from "@prisma/client";
import { ListenMoeWebSocket } from "./ws/ListenMoeWebSocket";

export class BaseClient extends SapphireClient {
	/**
	 * @constructor
	 * @description The client constructor.
	 */
	public constructor() {
		super(CLIENT_OPTIONS);

		container.database = new PrismaClient();
		container.players = new Map();
		container.listenmoeJPOP = new ListenMoeWebSocket(this, "gateway_v2");
		container.listenmoeKPOP = new ListenMoeWebSocket(this, "kpop/gateway_v2");
	}

	/**
	 * @description Initializes the client.
	 * @param {string} [token] - The token to be used by the client.
	 * @returns {Promise<string>}
	 */
	public async initialize(token?: string): Promise<void> {
		await super.login(token ?? process.env.DISCORD_TOKEN);
		await container.database.$connect().then(() => {
			container.logger.info("Connected to Prisma");
		});
	}
}

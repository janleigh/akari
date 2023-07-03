import { SapphireClient } from "@sapphire/framework";
import { CLIENT_OPTIONS } from "../../config";

export class BaseClient extends SapphireClient {
	/**
	 * @constructor
	 * @description The client constructor.
	 */
	public constructor() {
		super(CLIENT_OPTIONS);
	}

	/**
	 * @description Initializes the client.
	 * @param {string} [token] - The token to be used by the client.
	 * @returns {Promise<string>}
	 */
	public async initialize(token?: string): Promise<string> {
		return super.login(token ?? process.env.DISCORD_TOKEN);
	}
}

/**
 *  Copyright (C) 2026 Jan Leigh Muñoz
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published
 *  by the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { SapphireClient } from "@sapphire/framework";
import { Riffy } from "riffy";

import { CLIENT_OPTIONS, LAVALINK_NODES } from "../config";

export class BaseClient extends SapphireClient {
	/**
	 * @description The lavalink client to be used by the bot.
	 * @type {Riffy}
	 */
	public riffy: Riffy;

	public constructor() {
		super(CLIENT_OPTIONS);

		this.riffy = new Riffy(this, LAVALINK_NODES, {
			send: (pl) => {
				const g = this.guilds.cache.get(pl.d.guild_id);
				if (g) g.shard.send(pl);
			},
			defaultSearchPlatform: "ytsearch",
			restVersion: "v4",
			bypassChecks: {
				nodeFetchInfo: true,
			},
		});
	}

	/**
	 * @override
	 * @description Logs in the client.
	 * @param {string} [token] The bot token.
	 */
	public override login(token?: string) {
		return super.login(token);
	}

	/**
	 * @override
	 * @description Destroys the client.
	 */
	public override destroy() {
		return super.destroy();
	}
}

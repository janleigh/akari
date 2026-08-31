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

import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, type ListenerOptions } from "@sapphire/framework";
import type { Client } from "discord.js";

import { PRESENCE_OPTIONS } from "../config.ts";

@ApplyOptions<ListenerOptions>({
	once: true,
	event: Events.ClientReady,
})
export class ReadyListener extends Listener<typeof Events.ClientReady> {
	public run(client: Client<true>) {
		const { id, tag } = client.user;

		// Init riffy
		this.container.client.riffy.init(id);
		this.container.logger.info(`Successfully logged in as ${tag} (${id})`);

		this.container.client.user?.setPresence(PRESENCE_OPTIONS);
	}
}

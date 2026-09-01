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
import { Listener, container } from "@sapphire/framework";
import type { TextChannel } from "discord.js";
import { Player, Track } from "riffy";

import type { BaseClient } from "../../lib/BaseClient.ts";

@ApplyOptions<Listener.Options>({
	emitter: (container.client as BaseClient).riffy,
	event: "trackStart",
})
export class TrackStartListener extends Listener {
	public async run(player: Player, track: Track) {
		const client = this.container.client as BaseClient;
		const channel = client.channels.cache.get(player.textChannel) as
			| TextChannel
			| undefined;

		if (channel) {
			await channel.send(
				`Now playing: \`${track.info.title}\` by \`${track.info.author}\`.`,
			);
		}
	}
}

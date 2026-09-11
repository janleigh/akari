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

import { EmbedBuilder } from "@components/EmbedBuilder";
import type { BaseClient } from "@lib/BaseClient";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener, container } from "@sapphire/framework";
import { TextChannel } from "discord.js";
import { Player } from "riffy";

import { LAVALINK_EVENTS } from "@/config";

@ApplyOptions<Listener.Options>({
	emitter: (container.client as BaseClient).riffy,
	event: "queueEnd",
})
export class QueueEndListener extends Listener {
	public async run(player: Player) {
		const client = this.container.client as BaseClient;
		const channel = client.channels.cache.get(player.textChannel) as
			| TextChannel
			| undefined;

		player.destroy();

		if (!LAVALINK_EVENTS.queueEnd) return;

		if (channel) {
			const embed = new EmbedBuilder()
				.setTitle("🎵  Queue Ended")
				.setDescription("The queue has ended. Leaving the voice channel.")
				.isSuccessEmbed(true)
				.setTimestamp();

			await channel.send({ embeds: [embed] });
		}
	}
}

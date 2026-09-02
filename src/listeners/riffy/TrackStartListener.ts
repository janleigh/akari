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

import type { BaseClient } from "@lib/BaseClient.ts";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener, container } from "@sapphire/framework";
import { parsers } from "@utils/index.js";
import type { TextChannel } from "discord.js";
import { Player, Track } from "riffy";

import { EmbedBuilder } from "@/lib/components/EmbedBuilder";

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
			const embed = new EmbedBuilder()
				.setTitle("🎵  Now Playing")
				.setColor("Random")
				.setDescription(
					`[${track.info.title}](${track.info.uri}) by \`${track.info.author}\``,
				)
				.addFields(
					{
						name: "Duration",
						value: parsers.formatDuration(track.info.length),
						inline: true,
					},
					{
						name: "Requested by",
						value: `${track.info.requester}`,
						inline: true,
					},
				)
				.setTimestamp()
				.setFooter({ text: `Songs in queue: ${player.queue.length}` })
				.setThumbnail(track.info.thumbnail);

			await channel.send({ embeds: [embed] });
			this.container.logger.debug(
				`Lavalink[trackStart] Now playing: ${track.info.title} by ${track.info.author} at guild: ${player.guildId}`,
			);
		}
	}
}

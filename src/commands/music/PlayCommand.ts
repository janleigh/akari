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
import {
	type ChatInputCommand,
	Command,
	RegisterBehavior,
} from "@sapphire/framework";
import { parsers } from "@utils/index";
import { AutocompleteInteraction } from "discord.js";

@ApplyOptions<Command.Options>({
	name: "play",
	fullCategory: ["Music"],
	preconditions: ["InVoiceChannelPrecondition", "SameVoiceChannelPrecondition"],
})
export class PlayCommand extends Command {
	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry,
	) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("play")
					.setDescription("Play a song from YouTube/YT Music/Spotify")
					.addStringOption((option) =>
						option
							.setName("query")
							.setDescription("The song to play")
							.setRequired(true)
							.setAutocomplete(true),
					),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite },
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const { riffy } = this.container.client;
		const member = await interaction.guild!.members.fetch(interaction.user.id);

		await interaction.deferReply();
		const query = interaction.options.getString("query", true);

		const player = riffy.createConnection({
			guildId: interaction.guild!.id,
			voiceChannel: member.voice.channelId!,
			textChannel: interaction.channelId,
			deaf: true,
		});

		const resolve = await riffy.resolve({
			query: query,
			requester: interaction.user,
		});

		const { loadType, tracks, playlistInfo } = resolve;

		if (loadType === "playlist") {
			for (const track of tracks) {
				player.queue.add(track);
			}

			await interaction.editReply({
				content: `${parsers.getEmoji("checkmark")} Added \`${tracks.length}\` tracks from the playlist \`${playlistInfo?.name}\` to the queue by **${interaction.user.tag}**.`,
			});

			if (!player.playing && !player.paused) return player.play();
		} else if (loadType === "track" || loadType === "search") {
			const track = tracks.shift()!;
			track.info.requester = interaction.user;

			player.queue.add(track!);

			await interaction.editReply({
				content: `${parsers.getEmoji("checkmark")} Track \`${track?.info.title}\` added to the queue by **${interaction.user.tag}**.`,
			});

			if (!player.playing && !player.paused) return player.play();
		} else {
			return interaction.editReply({
				content: "No results found.",
			});
		}
	}

	public override async autocompleteRun(
		interaction: AutocompleteInteraction,
	): Promise<void> {
		const query = interaction.options.getFocused();

		if (!query || query.length < 3) return interaction.respond([]);
		if (query.startsWith("http")) return interaction.respond([]);

		try {
			const resolve = await this.container.client.riffy.resolve({
				query: query,
				requester: interaction.user,
			});

			const { loadType, tracks } = resolve;
			if (loadType === "track" || loadType === "search") {
				const results = tracks.slice(0, 10).map((track) => ({
					name:
						track.info.title.length > 80
							? track.info.title.slice(0, 80) + "..."
							: track.info.title,
					value: track.info.uri,
				}));
				return interaction.respond(results);
			}
		} catch (error) {
			console.error(error);
		}
	}
}

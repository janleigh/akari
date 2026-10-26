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

import {
	createMusicStatusContainer,
	removeTracks,
} from "@commandUtils/music/queue";
import { ApplyOptions } from "@sapphire/decorators";
import {
	type ChatInputCommand,
	Command,
	RegisterBehavior,
} from "@sapphire/framework";
import { MessageFlags } from "discord.js";
import type { Track } from "riffy";

@ApplyOptions<Command.Options>({
	name: "remove",
	description: "Remove a track or range of tracks from the queue",
	aliases: ["rm"],
	fullCategory: ["Music"],
	preconditions: [
		"HasActivePlayerPrecondition",
		"InVoiceChannelPrecondition",
		"SameVoiceChannelPrecondition",
	],
})
export class RemoveCommand extends Command {
	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry,
	) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("remove")
					.setDescription(
						"Remove a track or range of tracks from the queue",
					)
					.addIntegerOption((option) =>
						option
							.setName("position")
							.setDescription(
								"The position of the track in the queue (1-based)",
							)
							.setMinValue(1)
							.setRequired(true),
					)
					.addIntegerOption((option) =>
						option
							.setName("count")
							.setDescription(
								"Number of tracks to remove starting from position",
							)
							.setMinValue(1)
							.setRequired(false),
					),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite },
		);
	}

	public async chatInputRun(
		interaction: Command.ChatInputCommandInteraction,
	) {
		const player = this.container.client.riffy.players.get(
			interaction.guildId!,
		)!;

		const queueItems = Array.from(player.queue) as Track[];
		if (queueItems.length === 0) {
			return interaction.reply({
				components: [
					createMusicStatusContainer(
						"Queue Empty",
						"There are no tracks in the queue to remove.",
						"⚠️",
					),
				],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		const position = interaction.options.getInteger("position", true);
		const count = interaction.options.getInteger("count") ?? 1;

		if (position > queueItems.length) {
			return interaction.reply({
				components: [
					createMusicStatusContainer(
						"Invalid Position",
						`Position **#${position}** is out of bounds. The queue currently has **${queueItems.length}** track(s).`,
						"⚠️",
					),
				],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		const removed = removeTracks(
			player.queue as unknown as Track[],
			position,
			count,
		);

		if (removed.length === 0) {
			return interaction.reply({
				components: [
					createMusicStatusContainer(
						"Remove Failed",
						"Failed to remove any tracks.",
						"⚠️",
					),
				],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		const description =
			removed.length === 1
				? `Removed **[${removed[0].info.title}](${removed[0].info.uri})** at position **#${position}** from the queue.`
				: `Removed **${removed.length}** tracks from the queue starting at position **#${position}**.`;

		return interaction.reply({
			components: [
				createMusicStatusContainer("Track Removed", description, "🗑️"),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

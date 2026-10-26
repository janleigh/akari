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
	moveTrack,
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
	name: "move",
	description: "Move a track to a different position in the queue",
	aliases: ["mv"],
	fullCategory: ["Music"],
	preconditions: [
		"HasActivePlayerPrecondition",
		"InVoiceChannelPrecondition",
		"SameVoiceChannelPrecondition",
	],
})
export class MoveCommand extends Command {
	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry,
	) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("move")
					.setDescription(
						"Move a track to a different position in the queue",
					)
					.addIntegerOption((option) =>
						option
							.setName("from")
							.setDescription(
								"The current position of the track (1-based)",
							)
							.setMinValue(1)
							.setRequired(true),
					)
					.addIntegerOption((option) =>
						option
							.setName("to")
							.setDescription(
								"The new position to move the track to (defaults to 1)",
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
		if (queueItems.length < 2) {
			return interaction.reply({
				components: [
					createMusicStatusContainer(
						"Queue Too Short",
						"At least 2 tracks must be in the queue to reorder them.",
						"⚠️",
					),
				],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		const from = interaction.options.getInteger("from", true);
		const to = interaction.options.getInteger("to") ?? 1;

		if (from > queueItems.length) {
			return interaction.reply({
				components: [
					createMusicStatusContainer(
						"Invalid Source Position",
						`Source position **#${from}** is out of bounds. The queue currently has **${queueItems.length}** track(s).`,
						"⚠️",
					),
				],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		if (to > queueItems.length) {
			return interaction.reply({
				components: [
					createMusicStatusContainer(
						"Invalid Target Position",
						`Target position **#${to}** is out of bounds. The queue currently has **${queueItems.length}** track(s).`,
						"⚠️",
					),
				],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		if (from === to) {
			return interaction.reply({
				components: [
					createMusicStatusContainer(
						"Track Not Moved",
						`Track is already at position **#${from}**.`,
						"ℹ️",
					),
				],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		const movedTrack = moveTrack(
			player.queue as unknown as Track[],
			from,
			to,
		);

		if (!movedTrack) {
			return interaction.reply({
				components: [
					createMusicStatusContainer(
						"Move Failed",
						"Failed to move the track.",
						"⚠️",
					),
				],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		return interaction.reply({
			components: [
				createMusicStatusContainer(
					"Track Reordered",
					`Moved **[${movedTrack.info.title}](${movedTrack.info.uri})** from position **#${from}** to **#${to}**.`,
					"🔀",
				),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

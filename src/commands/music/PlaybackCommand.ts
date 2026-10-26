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

import { createMusicStatusContainer } from "@commandUtils/music/status";
import { ApplyOptions } from "@sapphire/decorators";
import {
	type ChatInputCommand,
	Command,
	RegisterBehavior,
} from "@sapphire/framework";
import { MessageFlags } from "discord.js";

@ApplyOptions<Command.Options>({
	name: "playback",
	description: "Control audio playback with pause, resume, or toggle",
	fullCategory: ["Music"],
	preconditions: [
		"HasActivePlayerPrecondition",
		"InVoiceChannelPrecondition",
		"SameVoiceChannelPrecondition",
	],
})
export class PlaybackCommand extends Command {
	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry,
	) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("playback")
					.setDescription("Control audio playback")
					.addSubcommand((subcommand) =>
						subcommand
							.setName("pause")
							.setDescription("Pause the current playback"),
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("resume")
							.setDescription("Resume the current playback"),
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("toggle")
							.setDescription(
								"Toggle playback between play and pause",
							),
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

		if (!player.current) {
			return interaction.reply({
				components: [
					createMusicStatusContainer(
						"Playback",
						"There is no active track to control.",
						"⚠️",
					),
				],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		const subcommand = interaction.options.getSubcommand(true);
		const track = player.current;
		const trackTitle = track.info.title;
		const trackLink = track.info.uri
			? `[${trackTitle}](${track.info.uri})`
			: `**${trackTitle}**`;

		if (subcommand === "pause") {
			if (player.paused) {
				return interaction.reply({
					components: [
						createMusicStatusContainer(
							"Playback",
							"The player is already paused.",
							"⏸️",
						),
					],
					flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
				});
			}

			player.pause(true);
			player.playing = false;

			return interaction.reply({
				components: [
					createMusicStatusContainer(
						"Paused",
						`Paused ${trackLink}`,
						"⏸️",
					),
				],
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (subcommand === "resume") {
			if (!player.paused) {
				return interaction.reply({
					components: [
						createMusicStatusContainer(
							"Playback",
							"The player is not paused.",
							"▶️",
						),
					],
					flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
				});
			}

			player.pause(false);
			player.playing = true;

			return interaction.reply({
				components: [
					createMusicStatusContainer(
						"Resumed",
						`Resumed ${trackLink}`,
						"▶️",
					),
				],
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (subcommand === "toggle") {
			const willPause = !player.paused;
			player.pause(willPause);
			player.playing = !willPause;

			const actionTitle = willPause ? "Paused" : "Resumed";
			const actionEmoji = willPause ? "⏸️" : "▶️";

			return interaction.reply({
				components: [
					createMusicStatusContainer(
						actionTitle,
						`${actionTitle} ${trackLink}`,
						actionEmoji,
					),
				],
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

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
	name: "pause",
	description: "[Deprecated] Pause playback. Use /playback pause instead",
	fullCategory: ["Music"],
	preconditions: [
		"HasActivePlayerPrecondition",
		"HasPlayingTrackPrecondition",
		"InVoiceChannelPrecondition",
		"SameVoiceChannelPrecondition",
	],
})
export class PauseCommand extends Command {
	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry,
	) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("pause")
					.setDescription(
						"[Deprecated] Pause playback. Use /playback pause instead",
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

		if (player.paused) {
			return interaction.reply({
				components: [
					createMusicStatusContainer(
						"Playback",
						"The player is already paused.\n\n> ⚠️ **Note:** `/pause` is deprecated. Please use `/playback pause` instead.",
						"⏸️",
					),
				],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		player.pause(true);
		player.playing = false;

		const trackTitle = player.current?.info.title ?? "Unknown track";
		const trackUri = player.current?.info.uri;
		const trackDesc = trackUri
			? `Paused [${trackTitle}](${trackUri})\n\n> ⚠️ **Note:** \`/pause\` is deprecated. Please use \`/playback pause\` instead.`
			: `Paused **${trackTitle}**\n\n> ⚠️ **Note:** \`/pause\` is deprecated. Please use \`/playback pause\` instead.`;

		return interaction.reply({
			components: [createMusicStatusContainer("Paused", trackDesc, "⏸️")],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

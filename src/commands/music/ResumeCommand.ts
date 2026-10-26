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
	name: "resume",
	description: "[Deprecated] Resume playback. Use /playback resume instead",
	fullCategory: ["Music"],
	preconditions: [
		"HasActivePlayerPrecondition",
		"InVoiceChannelPrecondition",
		"SameVoiceChannelPrecondition",
	],
})
export class ResumeCommand extends Command {
	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry,
	) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("resume")
					.setDescription(
						"[Deprecated] Resume playback. Use /playback resume instead",
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
						"There is no track to resume.\n\n> ⚠️ **Note:** `/resume` is deprecated. Please use `/playback resume` instead.",
						"▶️",
					),
				],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		if (!player.paused) {
			return interaction.reply({
				components: [
					createMusicStatusContainer(
						"Playback",
						"The player is not paused.\n\n> ⚠️ **Note:** `/resume` is deprecated. Please use `/playback resume` instead.",
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
					`Resumed [${player.current.info.title}](${player.current.info.uri})\n\n> ⚠️ **Note:** \`/resume\` is deprecated. Please use \`/playback resume\` instead.`,
					"▶️",
				),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

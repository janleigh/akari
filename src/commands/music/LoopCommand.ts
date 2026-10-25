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
import { createMusicStatusContainer } from "@utils/commands/music";
import { MessageFlags } from "discord.js";
import type { LoopOption } from "riffy";

@ApplyOptions<Command.Options>({
	name: "loop",
	fullCategory: ["Music"],
	preconditions: [
		"HasActivePlayerPrecondition",
		"InVoiceChannelPrecondition",
		"SameVoiceChannelPrecondition",
	],
})
export class LoopCommand extends Command {
	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry,
	) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("loop")
					.setDescription("Set or cycle the playback loop mode")
					.addStringOption((option) =>
						option
							.setName("mode")
							.setDescription("The loop mode to apply")
							.setRequired(false)
							.addChoices(
								{ name: "Off", value: "none" },
								{ name: "Track", value: "track" },
								{ name: "Queue", value: "queue" },
							),
					),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite },
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const player = this.container.client.riffy.players.get(
			interaction.guildId!,
		)!;

		const selectedMode = interaction.options.getString(
			"mode",
		) as LoopOption | null;

		let nextMode: LoopOption;
		if (selectedMode) {
			nextMode = selectedMode;
		} else {
			nextMode =
				player.loop === "none"
					? "track"
					: player.loop === "track"
						? "queue"
						: "none";
		}

		player.setLoop(nextMode);

		const modeInfo: Record<LoopOption, { label: string; emoji: string }> = {
			none: { label: "Off", emoji: "➡️" },
			track: { label: "Track", emoji: "🔂" },
			queue: { label: "Queue", emoji: "🔁" },
		};

		const info = modeInfo[nextMode] ?? { label: nextMode, emoji: "🔁" };

		return interaction.reply({
			components: [
				createMusicStatusContainer(
					"Loop Mode",
					`Loop mode set to **${info.label}**.`,
					info.emoji,
				),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

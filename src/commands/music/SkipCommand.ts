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

@ApplyOptions<Command.Options>({
	name: "skip",
	fullCategory: ["Music"],
	preconditions: [
		"HasActivePlayerPrecondition",
		"HasPlayingTrackPrecondition",
		"InVoiceChannelPrecondition",
		"SameVoiceChannelPrecondition",
	],
})
export class SkipCommand extends Command {
	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry,
	) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("skip")
					.setDescription("Skip the currently playing track"),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite },
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const player = this.container.client.riffy.players.get(
			interaction.guildId!,
		)!;
		const track = player.current!;

		player.stop();

		return interaction.reply({
			components: [
				createMusicStatusContainer(
					"Skipped",
					`Skipped [${track.info.title}](${track.info.uri})`,
					"⏭️",
				),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

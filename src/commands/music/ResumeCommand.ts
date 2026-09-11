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
import { ApplyOptions } from "@sapphire/decorators";
import {
	type ChatInputCommand,
	Command,
	RegisterBehavior,
} from "@sapphire/framework";

@ApplyOptions<Command.Options>({
	name: "resume",
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
				builder.setName("resume").setDescription("Resume the current playback"),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite },
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const player = this.container.client.riffy.players.get(
			interaction.guildId!,
		)!;

		if (!player.current) {
			return interaction.reply({
				content: "There is no track to resume.",
				ephemeral: true,
			});
		}

		if (!player.paused) {
			return interaction.reply({
				content: "The player is not paused.",
				ephemeral: true,
			});
		}

		player.pause(false);
		player.playing = true;

		const embed = new EmbedBuilder()
			.setTitle("▶️  Resumed")
			.setDescription(
				`Resumed [${player.current.info.title}](${player.current.info.uri})`,
			)
			.isSuccessEmbed(true)
			.setTimestamp();

		return interaction.reply({ embeds: [embed] });
	}
}

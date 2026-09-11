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
import { parsers } from "@utils/index";

@ApplyOptions<Command.Options>({
	name: "volume",
	aliases: ["vol"],
	fullCategory: ["Music"],
	preconditions: [
		"HasActivePlayerPrecondition",
		"InVoiceChannelPrecondition",
		"SameVoiceChannelPrecondition",
	],
})
export class VolumeCommand extends Command {
	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry,
	) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("volume")
					.setDescription("Check or adjust the playback volume")
					.addIntegerOption((option) =>
						option
							.setName("level")
							.setDescription("The volume percentage to set (0 - 150%)")
							.setMinValue(0)
							.setMaxValue(150)
							.setRequired(false),
					),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite },
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const player = this.container.client.riffy.players.get(
			interaction.guildId!,
		)!;

		const level = interaction.options.getInteger("level");

		if (level === null) {
			const volumeEmoji =
				player.volume === 0 ? "🔇" : player.volume < 50 ? "🔉" : "🔊";
			const embed = new EmbedBuilder()
				.setTitle(`${volumeEmoji}  Playback Volume`)
				.setDescription(
					`The current playback volume is **${player.volume}%**.\n\n${parsers.createProgressBar(player.volume, 150, 12)}`,
				)
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}

		const oldVolume = player.volume;
		player.setVolume(level);

		const volumeEmoji = level === 0 ? "🔇" : level < 50 ? "🔉" : "🔊";

		const embed = new EmbedBuilder()
			.setTitle(`${volumeEmoji}  Volume Adjusted`)
			.setDescription(
				`Volume changed from **${oldVolume}%** to **${level}%**.\n\n${parsers.createProgressBar(level, 150, 12)}`,
			)
			.isSuccessEmbed(true)
			.setTimestamp();

		return interaction.reply({ embeds: [embed] });
	}
}

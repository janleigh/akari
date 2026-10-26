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
	createNowPlayingContainer,
	createNowPlayingDisabledRow,
	createNowPlayingRow,
} from "@commandUtils/music/nowplaying";
import { ApplyOptions } from "@sapphire/decorators";
import {
	type ChatInputCommand,
	Command,
	RegisterBehavior,
} from "@sapphire/framework";
import { ComponentType, MessageFlags } from "discord.js";

@ApplyOptions<Command.Options>({
	name: "nowplaying",
	description:
		"Display detailed information and playback controls for the current track",
	aliases: ["np"],
	fullCategory: ["Music"],
	preconditions: [
		"HasActivePlayerPrecondition",
		"HasPlayingTrackPrecondition",
	],
})
export class NowPlayingCommand extends Command {
	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry,
	) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("nowplaying")
					.setDescription(
						"Display detailed information and playback controls for the current track",
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

		const message = await interaction.reply({
			components: [
				createNowPlayingContainer(player, interaction.user),
				createNowPlayingRow(player),
			],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 120_000,
		});

		collector.on("collect", async (i) => {
			const member =
				i.guild?.members.cache.get(i.user.id) ??
				(await i.guild?.members.fetch(i.user.id).catch(() => null));
			const botVoiceId =
				(
					i.guild?.members.me ??
					(await i.guild?.members.fetchMe().catch(() => null))
				)?.voice.channelId ?? player.voiceChannel;

			if (
				!member?.voice.channelId ||
				(botVoiceId && member.voice.channelId !== botVoiceId)
			) {
				await i.reply({
					components: [
						createMusicStatusContainer(
							"You must be in the same voice channel as the bot to use these controls.",
							"⚠️",
						),
					],
					flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
				});
				return;
			}

			if (i.customId === "np_play_pause") {
				const shouldPause = !player.paused;
				player.pause(shouldPause);
				player.playing = !shouldPause;

				await i.update({
					components: [
						createNowPlayingContainer(player, interaction.user),
						createNowPlayingRow(player),
					],
					flags: MessageFlags.IsComponentsV2,
				});
			} else if (i.customId === "np_skip") {
				const currentTitle =
					player.current?.info.title ?? "Current track";
				player.stop();

				await i.reply({
					components: [
						createMusicStatusContainer(
							`Skipped **${currentTitle}** by ${i.user}.`,
							"⏭️",
						),
					],
					flags: MessageFlags.IsComponentsV2,
				});
				collector.stop();
			} else if (i.customId === "np_stop") {
				player.destroy();

				await i.update({
					components: [
						createMusicStatusContainer(
							`The music player was stopped and disconnected by ${i.user}.`,
							"⏹️",
						),
					],
					flags: MessageFlags.IsComponentsV2,
				});
				collector.stop();
			}
		});

		collector.on("end", async () => {
			await interaction
				.editReply({
					components: [
						createNowPlayingContainer(player, interaction.user),
						createNowPlayingDisabledRow(player),
					],
					flags: MessageFlags.IsComponentsV2,
				})
				.catch(() => {});
		});
	}
}

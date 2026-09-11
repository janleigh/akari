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
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
} from "discord.js";
import type { Player } from "riffy";

@ApplyOptions<Command.Options>({
	name: "nowplaying",
	aliases: ["np"],
	fullCategory: ["Music"],
	preconditions: ["HasActivePlayerPrecondition", "HasPlayingTrackPrecondition"],
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

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const player = this.container.client.riffy.players.get(
			interaction.guildId!,
		)!;

		const generateEmbed = (p: Player) => {
			const track = p.current;
			if (!track) {
				return new EmbedBuilder()
					.setTitle("🎵  Now Playing")
					.setDescription("No track is currently playing.")
					.setTimestamp();
			}

			const isStream = track.info.stream;
			const currentPos = p.position;
			const totalDuration = track.info.length;
			const progressBar = isStream
				? "🔴 **LIVE STREAM**"
				: `${parsers.createProgressBar(currentPos, totalDuration, 16)} \`[${parsers.formatDuration(currentPos)} / ${parsers.formatDuration(totalDuration)}]\` (${Math.round((currentPos / totalDuration) * 100)}%)`;

			const statusText = p.paused ? "⏸️ Paused" : "▶️ Playing";
			const loopText =
				p.loop === "track" ? "Track" : p.loop === "queue" ? "Queue" : "Off";
			const sourceName = track.info.sourceName
				? track.info.sourceName.toUpperCase()
				: "UNKNOWN";

			const upNextText =
				p.queue.length > 0
					? `[${p.queue[0].info.title}](${p.queue[0].info.uri}) (\`${parsers.formatDuration(p.queue[0].info.length)}\`)${p.queue.length > 1 ? `\n*+ ${p.queue.length - 1} more in queue*` : ""}`
					: "*End of queue — no more tracks.*";

			const embed = new EmbedBuilder()
				.setTitle("🎵  Now Playing")
				.setDescription(
					`### [${track.info.title}](${track.info.uri})\nby **${track.info.author}**`,
				)
				.addFields(
					{
						name: "Progress",
						value: progressBar,
						inline: false,
					},
					{
						name: "Playback",
						value: `• **Status:** ${statusText}\n• **Volume:** 🔊 ${p.volume}%\n• **Loop:** 🔁 ${loopText}`,
						inline: true,
					},
					{
						name: "Details",
						value: `• **Source:** \`${sourceName}\`\n• **Requester:** ${track.info.requester ?? interaction.user}`,
						inline: true,
					},
					{
						name: "Up Next",
						value: upNextText,
						inline: false,
					},
				)
				.setTimestamp();

			if (track.info.thumbnail) {
				embed.setThumbnail(track.info.thumbnail);
			}

			return embed;
		};

		const generateRow = (p: Player) => {
			const track = p.current;
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId("np_play_pause")
					.setLabel(p.paused ? "Resume" : "Pause")
					.setStyle(p.paused ? ButtonStyle.Success : ButtonStyle.Secondary)
					.setEmoji(p.paused ? "▶️" : "⏸️"),
				new ButtonBuilder()
					.setCustomId("np_skip")
					.setLabel("Skip")
					.setStyle(ButtonStyle.Primary)
					.setEmoji("⏭️"),
				new ButtonBuilder()
					.setCustomId("np_stop")
					.setLabel("Stop")
					.setStyle(ButtonStyle.Danger)
					.setEmoji("⏹️"),
			);

			if (track?.info.uri) {
				row.addComponents(
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel("Link")
						.setURL(track.info.uri)
						.setEmoji("🔗"),
				);
			}

			return row;
		};

		const message = await interaction.reply({
			embeds: [generateEmbed(player)],
			components: [generateRow(player)],
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
					content:
						"You must be in the same voice channel as the bot to use these controls.",
					ephemeral: true,
				});
				return;
			}

			if (i.customId === "np_play_pause") {
				const shouldPause = !player.paused;
				player.pause(shouldPause);
				player.playing = !shouldPause;

				await i.update({
					embeds: [generateEmbed(player)],
					components: [generateRow(player)],
				});
			} else if (i.customId === "np_skip") {
				const currentTitle = player.current?.info.title ?? "Current track";
				player.stop();

				await i.reply({
					content: `⏭️ Skipped **${currentTitle}** by ${i.user}.`,
				});
				collector.stop();
			} else if (i.customId === "np_stop") {
				player.destroy();

				const stoppedEmbed = new EmbedBuilder()
					.setTitle("⏹️  Playback Stopped")
					.setDescription(
						`The music player was stopped and disconnected by ${i.user}.`,
					)
					.isSuccessEmbed(true)
					.setTimestamp();

				await i.update({
					embeds: [stoppedEmbed],
					components: [],
				});
				collector.stop();
			}
		});

		collector.on("end", async () => {
			const track = player.current;
			const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId("np_play_pause")
					.setLabel(player.paused ? "Resume" : "Pause")
					.setStyle(player.paused ? ButtonStyle.Success : ButtonStyle.Secondary)
					.setEmoji(player.paused ? "▶️" : "⏸️")
					.setDisabled(true),
				new ButtonBuilder()
					.setCustomId("np_skip")
					.setLabel("Skip")
					.setStyle(ButtonStyle.Primary)
					.setEmoji("⏭️")
					.setDisabled(true),
				new ButtonBuilder()
					.setCustomId("np_stop")
					.setLabel("Stop")
					.setStyle(ButtonStyle.Danger)
					.setEmoji("⏹️")
					.setDisabled(true),
			);

			if (track?.info.uri) {
				disabledRow.addComponents(
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel("Link")
						.setURL(track.info.uri)
						.setEmoji("🔗"),
				);
			}

			await interaction
				.editReply({
					components: [disabledRow],
				})
				.catch(() => {});
		});
	}
}

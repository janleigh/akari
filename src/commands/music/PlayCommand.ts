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
	createSourceSelectRow,
	createTrackEnqueuedContainer,
	createTrackSelectContainer,
	createTrackSelectRow,
	getSourceName,
	SUPPORTED_SOURCES,
} from "@commandUtils/music/play";
import { ApplyOptions } from "@sapphire/decorators";
import {
	type ChatInputCommand,
	Command,
	RegisterBehavior,
} from "@sapphire/framework";
import { ComponentType, MessageFlags } from "discord.js";
import type { Track } from "riffy";

@ApplyOptions<Command.Options>({
	name: "play",
	description: "Play a track or search with a selection menu",
	fullCategory: ["Music"],
	preconditions: [
		"InVoiceChannelPrecondition",
		"SameVoiceChannelPrecondition",
	],
})
export class PlayCommand extends Command {
	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry,
	) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("play")
					.setDescription(
						"Play a track or search with a selection menu",
					)
					.addStringOption((option) =>
						option
							.setName("query")
							.setDescription("The song title or URL to play")
							.setRequired(true),
					)
					.addStringOption((option) =>
						option
							.setName("source")
							.setDescription("The music platform to search on")
							.setRequired(false)
							.addChoices(
								SUPPORTED_SOURCES.map((src) => ({
									name: src.label,
									value: src.value,
								})),
							),
					),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite },
		);
	}

	public async chatInputRun(
		interaction: Command.ChatInputCommandInteraction,
	) {
		const { riffy } = this.container.client;
		const member = await interaction.guild!.members.fetch(
			interaction.user.id,
		);

		await interaction.deferReply();
		const query = interaction.options.getString("query", true);
		let currentSource =
			interaction.options.getString("source") ?? "ytmsearch";

		const player = riffy.createConnection({
			guildId: interaction.guild!.id,
			voiceChannel: member.voice.channelId!,
			textChannel: interaction.channelId,
			deaf: true,
		});

		const isDirectUrl =
			query.startsWith("http://") || query.startsWith("https://");

		if (isDirectUrl) {
			const resolve = await riffy.resolve({
				query,
				requester: interaction.user,
			});

			const { loadType, tracks, playlistInfo } = resolve;

			if (loadType === "playlist") {
				for (const track of tracks) {
					player.queue.add(track);
				}

				await interaction.editReply({
					components: [
						createTrackEnqueuedContainer({
							type: "playlist",
							title: playlistInfo?.name ?? "Playlist",
							userTag: interaction.user.tag,
							count: tracks.length,
						}),
					],
					flags: MessageFlags.IsComponentsV2,
				});

				if (!player.playing && !player.paused) return player.play();
				return;
			}

			if (loadType === "track" || loadType === "search") {
				const track = tracks[0];
				if (track) {
					track.info.requester = interaction.user;
					player.queue.add(track);

					await interaction.editReply({
						components: [
							createTrackEnqueuedContainer({
								type: "track",
								title: track.info.title,
								userTag: interaction.user.tag,
								uri: track.info.uri,
							}),
						],
						flags: MessageFlags.IsComponentsV2,
					});

					if (!player.playing && !player.paused) return player.play();
					return;
				}
			}

			return interaction.editReply({
				components: [
					createMusicStatusContainer(
						"Playback",
						"No results found for the provided URL.",
						"🔍",
					),
				],
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Search with selection menu
		let resolve = await riffy.resolve({
			query,
			source: currentSource,
			requester: interaction.user,
		});

		let currentTracks: Track[] = resolve.tracks ?? [];

		if (currentTracks.length === 0) {
			return interaction.editReply({
				components: [
					createMusicStatusContainer(
						"Search Results",
						`No tracks found for **"${query}"** on **${getSourceName(currentSource)}**.`,
						"🔍",
					),
				],
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const message = await interaction.editReply({
			components: [
				createTrackSelectContainer(
					query,
					currentSource,
					currentTracks.length,
				),
				createTrackSelectRow(currentTracks),
				createSourceSelectRow(currentSource),
			],
			flags: MessageFlags.IsComponentsV2,
		});

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			time: 60_000,
		});

		collector.on("collect", async (i) => {
			if (i.user.id !== interaction.user.id) {
				await i.reply({
					components: [
						createMusicStatusContainer(
							"Permission Denied",
							"Only the person who searched can choose from this menu.",
							"⚠️",
						),
					],
					flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
				});
				return;
			}

			if (i.customId === "play_track_select") {
				const trackIndex = parseInt(i.values[0], 10);
				const selectedTrack = currentTracks[trackIndex];

				if (!selectedTrack) {
					await i.reply({
						components: [
							createMusicStatusContainer(
								"Playback",
								"Selected track is no longer available.",
								"⚠️",
							),
						],
						flags:
							MessageFlags.Ephemeral |
							MessageFlags.IsComponentsV2,
					});
					return;
				}

				selectedTrack.info.requester = interaction.user;
				player.queue.add(selectedTrack);

				await i.update({
					components: [
						createTrackEnqueuedContainer({
							type: "track",
							title: selectedTrack.info.title,
							userTag: interaction.user.tag,
							uri: selectedTrack.info.uri,
						}),
					],
					flags: MessageFlags.IsComponentsV2,
				});

				collector.stop("selected");

				if (!player.playing && !player.paused) {
					await player.play();
				}
			} else if (i.customId === "play_source_select") {
				currentSource = i.values[0];
				await i.deferUpdate();

				const newResolve = await riffy.resolve({
					query,
					source: currentSource,
					requester: interaction.user,
				});

				currentTracks = newResolve.tracks ?? [];

				if (currentTracks.length === 0) {
					await interaction.editReply({
						components: [
							createMusicStatusContainer(
								"Search Results",
								`No tracks found for **"${query}"** on **${getSourceName(currentSource)}**. Try another source.`,
								"🔍",
							),
							createSourceSelectRow(currentSource),
						],
						flags: MessageFlags.IsComponentsV2,
					});
				} else {
					await interaction.editReply({
						components: [
							createTrackSelectContainer(
								query,
								currentSource,
								currentTracks.length,
							),
							createTrackSelectRow(currentTracks),
							createSourceSelectRow(currentSource),
						],
						flags: MessageFlags.IsComponentsV2,
					});
				}
			}
		});

		collector.on("end", async (_, reason) => {
			if (reason !== "selected") {
				await interaction
					.editReply({
						components: [
							createMusicStatusContainer(
								"Search Expired",
								`Selection menu for **"${query}"** timed out.`,
								"⏱️",
							),
						],
						flags: MessageFlags.IsComponentsV2,
					})
					.catch(() => {});
			}
		});
	}
}

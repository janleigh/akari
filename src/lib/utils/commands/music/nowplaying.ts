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
	ActionRowBuilder,
	ButtonBuilder,
	ContainerBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
} from "@discordjs/builders";
import { parsers } from "@utils/index";
import { ButtonStyle, type User } from "discord.js";
import type { Player, Track } from "riffy";

import { createMusicStatusContainer } from "./status";

export { createMusicStatusContainer };

export function createNowPlayingContainer(
	player: Player,
	requesterFallback?: User,
): ContainerBuilder {
	const track = player.current;
	if (!track) {
		return createMusicStatusContainer(
			"Now Playing",
			"No track is currently playing.",
			"🎵",
		);
	}

	const isStream = track.info.stream;
	const currentPos = player.position;
	const totalDuration = track.info.length;
	const progressBar = isStream
		? "🔴 **LIVE STREAM**"
		: `${parsers.createProgressBar(currentPos, totalDuration, 16)} \`[${parsers.formatDuration(currentPos)} / ${parsers.formatDuration(totalDuration)}]\` (${Math.round((currentPos / totalDuration) * 100)}%)`;

	const statusText = player.paused ? "⏸️ Paused" : "▶️ Playing";
	const loopText =
		player.loop === "track"
			? "Track"
			: player.loop === "queue"
				? "Queue"
				: "Off";
	const sourceName = track.info.sourceName
		? track.info.sourceName.toUpperCase()
		: "UNKNOWN";

	const upNextText =
		player.queue.length > 0
			? `[${player.queue[0].info.title}](${player.queue[0].info.uri}) (\`${parsers.formatDuration(player.queue[0].info.length)}\`)${player.queue.length > 1 ? `\n*+ ${player.queue.length - 1} more in queue*` : ""}`
			: "*End of queue — no more tracks.*";

	const requester = track.info.requester ?? requesterFallback;
	const remainingMs = isStream ? 0 : Math.max(0, totalDuration - currentPos);
	const timeToNext = isStream
		? "Live Stream"
		: `\`${parsers.formatDuration(remainingMs)}\` (<t:${Math.floor((Date.now() + remainingMs) / 1000)}:R>)`;

	const container = new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## 🎵  Now Playing\n### [${track.info.title}](${track.info.uri})\nby **${track.info.author}**`,
			),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`**Progress**\n${progressBar}\n\n` +
					`**Playback**\n• **Status:** ${statusText}\n• **Volume:** 🔊 ${player.volume}%\n• **Loop:** 🔁 ${loopText}\n\n` +
					`**Details**\n• **Source:** \`${sourceName}\`\n• **Requester:** ${requester ?? "Unknown"}\n• **Time to Next:** ⏳ ${timeToNext}\n\n` +
					`**Up Next**\n${upNextText}`,
			),
		);

	// REMOVED!!!
	// if (track.info.thumbnail) {
	// 	container
	// 		.addSeparatorComponents(new SeparatorBuilder())
	// 		.addMediaGalleryComponents(
	// 			new MediaGalleryBuilder().addItems(
	// 				new MediaGalleryItemBuilder().setURL(track.info.thumbnail),
	// 			),
	// 		);
	// }

	return container;
}

export function createNowPlayingRow(
	player: Player,
): ActionRowBuilder<ButtonBuilder> {
	const track = player.current;
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId("np_play_pause")
			.setStyle(
				player.paused ? ButtonStyle.Success : ButtonStyle.Secondary,
			)
			.setEmoji({ name: player.paused ? "▶️" : "⏸️" }),
		new ButtonBuilder()
			.setCustomId("np_skip")
			.setStyle(ButtonStyle.Primary)
			.setEmoji({ name: "⏭️" }),
		new ButtonBuilder()
			.setCustomId("np_stop")
			.setStyle(ButtonStyle.Danger)
			.setEmoji({ name: "⏹️" }),
	);

	if (track?.info.uri) {
		row.addComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setLabel("Track Link")
				.setURL(track.info.uri)
				.setEmoji({ name: "🔗" }),
		);
	}

	return row;
}

export function createNowPlayingDisabledRow(
	player: Player,
): ActionRowBuilder<ButtonBuilder> {
	const track = player.current;
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId("np_play_pause")
			.setLabel(player.paused ? "Resume" : "Pause")
			.setStyle(
				player.paused ? ButtonStyle.Success : ButtonStyle.Secondary,
			)
			.setEmoji({ name: player.paused ? "▶️" : "⏸️" })
			.setDisabled(true),
		new ButtonBuilder()
			.setCustomId("np_skip")
			.setLabel("Skip")
			.setStyle(ButtonStyle.Primary)
			.setEmoji({ name: "⏭️" })
			.setDisabled(true),
		new ButtonBuilder()
			.setCustomId("np_stop")
			.setLabel("Stop")
			.setStyle(ButtonStyle.Danger)
			.setEmoji({ name: "⏹️" })
			.setDisabled(true),
	);

	if (track?.info.uri) {
		row.addComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setLabel("Link")
				.setURL(track.info.uri)
				.setEmoji({ name: "🔗" }),
		);
	}

	return row;
}

export function createTrackStartContainer(
	player: Player,
	track: Track,
): ContainerBuilder {
	const container = new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## 🎵  Now Playing\n### [${track.info.title}](${track.info.uri})\nby \`${track.info.author}\``,
			),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`**Duration:** \`${parsers.formatDuration(track.info.length)}\`\n` +
					`**Requested by:** ${track.info.requester ?? "Unknown"}\n` +
					`**Songs in queue:** ${player.queue.length}`,
			),
		);

	if (track.info.thumbnail) {
		container
			.addSeparatorComponents(new SeparatorBuilder())
			.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems(
					new MediaGalleryItemBuilder().setURL(track.info.thumbnail),
				),
			);
	}

	return container;
}

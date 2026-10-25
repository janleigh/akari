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
	SelectMenuBuilder,
	SelectMenuOptionBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
} from "@discordjs/builders";
import { parsers } from "@utils/index";
import { ButtonStyle, type User } from "discord.js";
import type { Player, Track } from "riffy";

export interface Iterator<T> {
	next(): T;
	hasNext(): boolean;
	prev(): T;
	hasPrev(): boolean;
	current(): T;
}

export class QueueIterator implements Iterator<Track[]> {
	private items: Track[];
	private pageSize: number;
	private currentIndex = 0;

	constructor(items: Track[], pageSize: number = 10) {
		this.items = items;
		this.pageSize = pageSize;
	}

	public next(): Track[] {
		if (this.hasNext()) {
			this.currentIndex += this.pageSize;
		}
		return this.current();
	}

	public hasNext(): boolean {
		return this.currentIndex + this.pageSize < this.items.length;
	}

	public prev(): Track[] {
		if (this.hasPrev()) {
			this.currentIndex -= this.pageSize;
		}
		return this.current();
	}

	public hasPrev(): boolean {
		return this.currentIndex >= this.pageSize;
	}

	public current(): Track[] {
		return this.items.slice(
			this.currentIndex,
			this.currentIndex + this.pageSize,
		);
	}

	public get currentPage(): number {
		return Math.floor(this.currentIndex / this.pageSize) + 1;
	}

	public get totalPages(): number {
		return Math.ceil(this.items.length / this.pageSize);
	}

	public get totalItems(): number {
		return this.items.length;
	}
}

export function createMusicStatusContainer(
	title: string,
	description: string,
	emoji: string = "🎵",
): ContainerBuilder {
	return new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`## ${emoji}  ${title}`),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(description));
}

export function createTrackEnqueuedContainer(options: {
	type: "track" | "playlist";
	title: string;
	userTag: string;
	count?: number;
	uri?: string;
}): ContainerBuilder {
	const checkmark = parsers.getEmoji("checkmark")?.toString() ?? "✅";
	if (options.type === "playlist") {
		return new ContainerBuilder()
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`## ${checkmark}  Playlist Enqueued`,
				),
			)
			.addSeparatorComponents(new SeparatorBuilder())
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`Added **${options.count ?? 0}** tracks from playlist **\`${options.title}\`** by **${options.userTag}**.`,
				),
			);
	}

	const trackLink = options.uri
		? `[${options.title}](${options.uri})`
		: `\`${options.title}\``;

	return new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`## ${checkmark}  Track Enqueued`),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`Added ${trackLink} to the queue by **${options.userTag}**.`,
			),
		);
}

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

export function createNowPlayingRow(
	player: Player,
): ActionRowBuilder<ButtonBuilder> {
	const track = player.current;
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId("np_play_pause")
			.setLabel(player.paused ? "Resume" : "Pause")
			.setStyle(player.paused ? ButtonStyle.Success : ButtonStyle.Secondary)
			.setEmoji({ name: player.paused ? "▶️" : "⏸️" }),
		new ButtonBuilder()
			.setCustomId("np_skip")
			.setLabel("Skip")
			.setStyle(ButtonStyle.Primary)
			.setEmoji({ name: "⏭️" }),
		new ButtonBuilder()
			.setCustomId("np_stop")
			.setLabel("Stop")
			.setStyle(ButtonStyle.Danger)
			.setEmoji({ name: "⏹️" }),
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

export function createNowPlayingDisabledRow(
	player: Player,
): ActionRowBuilder<ButtonBuilder> {
	const track = player.current;
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId("np_play_pause")
			.setLabel(player.paused ? "Resume" : "Pause")
			.setStyle(player.paused ? ButtonStyle.Success : ButtonStyle.Secondary)
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

export function createQueueContainer(
	player: Player,
	iterator: QueueIterator,
): ContainerBuilder {
	const page = iterator.current();
	let content = "";

	if (player.current) {
		content += `**Currently Playing:**\n[${player.current.info.title}](${player.current.info.uri})\n\n`;
	}

	if (page.length > 0) {
		content += "**Up Next:**\n";
		page.forEach((track, index) => {
			const actualIndex = (iterator.currentPage - 1) * 10 + index + 1;
			content += `${actualIndex}. [${track.info.title}](${track.info.uri})\n`;
		});
	} else {
		content += "*No more tracks in queue.*";
	}

	return new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## 📻  Music Queue\nPage ${iterator.currentPage} of ${Math.max(iterator.totalPages, 1)} • ${iterator.totalItems} total tracks`,
			),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
}

export function createQueueRow(
	iterator: QueueIterator,
	disabled: boolean = false,
): ActionRowBuilder<ButtonBuilder> {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId("queue_prev")
			.setLabel("Prev")
			.setStyle(ButtonStyle.Primary)
			.setEmoji({ name: "⏮️" })
			.setDisabled(disabled || !iterator.hasPrev()),
		new ButtonBuilder()
			.setCustomId("queue_next")
			.setLabel("Next")
			.setStyle(ButtonStyle.Primary)
			.setEmoji({ name: "⏭️" })
			.setDisabled(disabled || !iterator.hasNext()),
	);
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

export function createQueueEndContainer(): ContainerBuilder {
	return new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent("## 🎵  Queue Ended"),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				"The queue has ended. Leaving the voice channel.",
			),
		);
}

export const SUPPORTED_SOURCES = [
	{ label: "YouTube Music", value: "ytmsearch", emoji: "🎵" },
	{ label: "YouTube", value: "ytsearch", emoji: "▶️" },
	{ label: "Spotify", value: "spsearch", emoji: "🟢" },
	{ label: "SoundCloud", value: "scsearch", emoji: "☁️" },
] as const;

export type MusicSearchSource = (typeof SUPPORTED_SOURCES)[number]["value"];

export function getSourceName(source: string): string {
	const found = SUPPORTED_SOURCES.find((s) => s.value === source);
	return found ? found.label : source;
}

export function createTrackSelectContainer(
	query: string,
	source: string,
	trackCount: number,
): ContainerBuilder {
	return new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## 🔍  Search Results\nFound **${trackCount}** results for **"${query}"** on **${getSourceName(source)}**.\nSelect a track from the menu below to add it to the queue.`,
			),
		)
		.addSeparatorComponents(new SeparatorBuilder());
}

export function createTrackSelectRow(
	tracks: Track[],
): ActionRowBuilder<SelectMenuBuilder> {
	const selectMenu = new SelectMenuBuilder()
		.setCustomId("play_track_select")
		.setPlaceholder("Choose a track to play...")
		.addOptions(
			tracks.slice(0, 10).map((track, index) => {
				const title =
					track.info.title.length > 95
						? `${track.info.title.slice(0, 95)}...`
						: track.info.title;
				const duration = parsers.formatDuration(track.info.length);
				const description = `${track.info.author} • ${duration}`.slice(0, 100);

				return new SelectMenuOptionBuilder()
					.setLabel(title)
					.setDescription(description)
					.setValue(String(index));
			}),
		);

	return new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu);
}

export function createSourceSelectRow(
	currentSource: string,
): ActionRowBuilder<SelectMenuBuilder> {
	const selectMenu = new SelectMenuBuilder()
		.setCustomId("play_source_select")
		.setPlaceholder("Switch search source...")
		.addOptions(
			SUPPORTED_SOURCES.map((source) =>
				new SelectMenuOptionBuilder()
					.setLabel(source.label)
					.setValue(source.value)
					.setEmoji({ name: source.emoji })
					.setDefault(source.value === currentSource),
			),
		);

	return new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu);
}

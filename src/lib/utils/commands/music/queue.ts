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
	SelectMenuBuilder,
	SelectMenuOptionBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
} from "@discordjs/builders";
import { parsers } from "@utils/index";
import { ButtonStyle } from "discord.js";
import type { Player, Track } from "riffy";

import { createMusicStatusContainer } from "./status";

export { createMusicStatusContainer };

export interface Iterator<T> {
	next(): T;
	hasNext(): boolean;
	prev(): T;
	hasPrev(): boolean;
	current(): T;
	firstPage(): T;
	lastPage(): T;
	currentPage: number;
	totalPages: number;
	totalItems: number;
	updateItems(items: T): void;
}

export class QueueIterator implements Iterator<Track[]> {
	private items: Track[];
	public readonly pageSize: number;
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

	public firstPage(): Track[] {
		this.currentIndex = 0;
		return this.current();
	}

	public lastPage(): Track[] {
		this.currentIndex =
			Math.floor((this.items.length - 1) / this.pageSize) * this.pageSize;
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
		return Math.max(1, Math.ceil(this.items.length / this.pageSize));
	}

	public get totalItems(): number {
		return this.items.length;
	}

	public updateItems(items: Track[]): void {
		this.items = items;
		if (this.currentIndex >= this.items.length && this.currentIndex > 0) {
			this.currentIndex = Math.max(
				0,
				(this.totalPages - 1) * this.pageSize,
			);
		}
	}
}

/**
 * Removes one or more tracks from the queue at the specified 1-based position.
 */
export function removeTracks(
	queue: Track[],
	position: number,
	count: number = 1,
): Track[] {
	if (position < 1 || position > queue.length || count < 1) {
		return [];
	}

	const maxCount = queue.length - position + 1;
	const actualCount = Math.min(count, maxCount);
	return queue.splice(position - 1, actualCount);
}

/**
 * Moves a track from one 1-based position to another.
 */
export function moveTrack(
	queue: Track[],
	from: number,
	to: number,
): Track | null {
	if (from < 1 || from > queue.length || to < 1 || to > queue.length) {
		return null;
	}

	if (from === to) {
		return queue[from - 1] ?? null;
	}

	const [track] = queue.splice(from - 1, 1);
	if (!track) return null;

	queue.splice(to - 1, 0, track);
	return track;
}

export function formatRequester(requester: unknown): string {
	if (!requester) return "Unknown";
	if (typeof requester === "string") return requester;
	if (typeof requester === "object") {
		if (
			"displayName" in requester &&
			typeof (requester as { displayName?: unknown }).displayName ===
				"string"
		) {
			return (requester as { displayName: string }).displayName;
		}
		if (
			"username" in requester &&
			typeof (requester as { username?: unknown }).username === "string"
		) {
			return (requester as { username: string }).username;
		}
	}
	return "Unknown";
}

export function formatTrackLength(track: Track): string {
	if (track.info.stream) return "LIVE";
	return parsers.formatDuration(track.info.length || 0);
}

export function formatQueueTable(
	tracks: Track[],
	startPosition: number = 1,
): string {
	if (tracks.length === 0) return "";

	const MAX_TITLE_LENGTH = 30;
	const MAX_REQUESTER_LENGTH = 14;

	const posHeader = "#";
	const titleHeader = "Title";
	const lengthHeader = "Length";
	const requesterHeader = "Requester";

	const rows = tracks.map((track, index) => {
		const pos = String(startPosition + index);
		const rawTitle = track.info.title.trim() || "Unknown Title";
		const title =
			rawTitle.length > MAX_TITLE_LENGTH
				? `${rawTitle.slice(0, MAX_TITLE_LENGTH - 3)}...`
				: rawTitle;
		const length = formatTrackLength(track);
		const rawRequester =
			formatRequester(track.info.requester).trim() || "Unknown";
		const requester =
			rawRequester.length > MAX_REQUESTER_LENGTH
				? `${rawRequester.slice(0, MAX_REQUESTER_LENGTH - 3)}...`
				: rawRequester;

		return { pos, title, length, requester };
	});

	const posWidth = Math.max(
		posHeader.length,
		...rows.map((r) => r.pos.length),
	);
	const titleWidth = Math.max(
		titleHeader.length,
		...rows.map((r) => r.title.length),
	);
	const lengthWidth = Math.max(
		lengthHeader.length,
		...rows.map((r) => r.length.length),
	);

	const headerPos = posHeader.padEnd(posWidth);
	const headerTitle = titleHeader.padEnd(titleWidth);
	const headerLength = lengthHeader.padEnd(lengthWidth);
	const headerLine = `${headerPos}  ${headerTitle}  ${headerLength}  ${requesterHeader}`;
	const separatorLine = "-".repeat(headerLine.length);

	const dataLines = rows.map((r) => {
		const p = r.pos.padEnd(posWidth);
		const t = r.title.padEnd(titleWidth);
		const l = r.length.padEnd(lengthWidth);
		return `${p}  ${t}  ${l}  ${r.requester}`;
	});

	return [headerLine, separatorLine, ...dataLines].join("\n");
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
		const startPosition =
			(iterator.currentPage - 1) * iterator.pageSize + 1;
		content += `**Up Next:**\n\`\`\`\n${formatQueueTable(page, startPosition)}\n\`\`\``;
	} else {
		content += "*No more tracks in queue.*";
	}

	return new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## 🎶  Music Queue\nPage ${iterator.currentPage} of ${Math.max(iterator.totalPages, 1)} • ${iterator.totalItems} total tracks`,
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
			.setCustomId("queue_first")
			.setLabel("<<")
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(disabled || iterator.currentPage === 1),
		new ButtonBuilder()
			.setCustomId("queue_prev")
			.setLabel("<")
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(disabled || !iterator.hasPrev()),
		new ButtonBuilder()
			.setCustomId("queue_next")
			.setLabel(">")
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(disabled || !iterator.hasNext()),
		new ButtonBuilder()
			.setCustomId("queue_last")
			.setLabel(">>")
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(
				disabled || iterator.currentPage === iterator.totalPages,
			),
	);
}

export function createQueueRemoveSelectRow(
	iterator: QueueIterator,
	disabled: boolean = false,
): ActionRowBuilder<SelectMenuBuilder> {
	const page = iterator.current();
	const selectMenu = new SelectMenuBuilder()
		.setCustomId("queue_remove_track")
		.setPlaceholder("Remove a track from this page...")
		.setDisabled(disabled || page.length === 0);

	if (page.length === 0) {
		selectMenu.addOptions(
			new SelectMenuOptionBuilder()
				.setLabel("No tracks to remove")
				.setValue("none"),
		);
	} else {
		selectMenu.addOptions(
			page.map((track, index) => {
				const actualIndex =
					(iterator.currentPage - 1) * iterator.pageSize + index + 1;
				const title =
					track.info.title.length > 90
						? `${track.info.title.slice(0, 90)}...`
						: track.info.title;
				const author =
					track.info.author.length > 95
						? `${track.info.author.slice(0, 95)}...`
						: track.info.author;

				return new SelectMenuOptionBuilder()
					.setLabel(`#${actualIndex}. ${title}`)
					.setDescription(author || "Unknown artist")
					.setValue(String(actualIndex));
			}),
		);
	}

	return new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu);
}

export function createQueueEndContainer(): ContainerBuilder {
	return createMusicStatusContainer(
		"The queue has ended. Leaving the voice channel.",
		"🎵",
	);
}

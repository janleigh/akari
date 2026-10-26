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
	SeparatorBuilder,
	TextDisplayBuilder,
} from "@discordjs/builders";
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
		return Math.ceil(this.items.length / this.pageSize);
	}

	public get totalItems(): number {
		return this.items.length;
	}
}

export function createQueueContainer(
	player: Player,
	iterator: QueueIterator,
): ContainerBuilder {
	const page = iterator.current();
	let content = "";

	if (player.current) {
		content += `**Currently Playing:**\n[${player.current.info.title}](${player.current.info.uri}) - ${player.current.info.author}\n\n`;
	}

	if (page.length > 0) {
		content += "**Up Next:**\n";
		page.forEach((track, index) => {
			const actualIndex = (iterator.currentPage - 1) * 10 + index + 1;
			content += `\`${actualIndex}.\` [${track.info.title}](${track.info.uri}) - ${track.info.author}\n`;
		});
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

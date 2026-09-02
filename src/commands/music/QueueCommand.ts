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
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
} from "discord.js";
import type { Track } from "riffy";

import { EmbedBuilder } from "@/lib/components/EmbedBuilder";

interface Iterator<T> {
	next(): T;
	hasNext(): boolean;
	prev(): T;
	hasPrev(): boolean;
	current(): T;
}

class QueueIterator implements Iterator<Track[]> {
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
		return Math.max(1, Math.ceil(this.items.length / this.pageSize));
	}
}

@ApplyOptions<Command.Options>({
	name: "queue",
	fullCategory: ["Music"],
})
export class QueueCommand extends Command {
	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry,
	) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("queue")
					.setDescription("Display the current music queue."),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite },
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const player = (this.container.client as any).riffy.players.get(
			interaction.guildId!,
		);

		if (!player) {
			return interaction.reply({
				content: "There is no music playing in this server.",
				ephemeral: true,
			});
		}

		const queueItems = Array.from(player.queue) as Track[];
		if (queueItems.length === 0 && !player.current) {
			return interaction.reply({
				content: "The queue is currently empty.",
				ephemeral: true,
			});
		}

		const iterator = new QueueIterator(queueItems, 10);

		const generateEmbed = (page: Track[], iterator: QueueIterator) => {
			const embed = new EmbedBuilder()
				.setTitle("📻  Music Queue")
				.setThumbnail(player.current?.info.thumbnail ?? "")
				.setFooter({
					text: `Page ${iterator.currentPage} of ${iterator.totalPages}`,
				});

			let description = "";
			if (player.current) {
				description += `**Currently Playing:**\n[${player.current.info.title}](${player.current.info.uri})\n\n`;
			}

			if (page.length > 0) {
				description += "**Up Next:**\n";
				page.forEach((track, index) => {
					const actualIndex = (iterator.currentPage - 1) * 10 + index + 1;
					description += `${actualIndex}. [${track.info.title}](${track.info.uri})\n`;
				});
			} else if (queueItems.length === 0) {
				description += "*No more tracks in queue.*";
			}

			embed.setDescription(description);
			return embed;
		};

		const generateRow = (iterator: QueueIterator) => {
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId("queue_prev")
					.setLabel("⏮️  Prev")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(!iterator.hasPrev()),
				new ButtonBuilder()
					.setCustomId("queue_next")
					.setLabel("⏭️  Next")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(!iterator.hasNext()),
			);
			return row;
		};

		const embed = generateEmbed(iterator.current(), iterator);
		const row = generateRow(iterator);

		const message = await interaction.reply({
			embeds: [embed],
			components: iterator.totalPages > 1 ? [row] : [],
			fetchReply: true,
		});

		if (iterator.totalPages <= 1) return;

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 60000,
		});

		collector.on("collect", async (i) => {
			if (i.user.id !== interaction.user.id) {
				await i.reply({
					content: "You cannot interact with these buttons.",
					ephemeral: true,
				});
				return;
			}

			if (i.customId === "queue_prev") {
				iterator.prev();
			} else if (i.customId === "queue_next") {
				iterator.next();
			}

			await i.update({
				embeds: [generateEmbed(iterator.current(), iterator)],
				components: [generateRow(iterator)],
			});
		});

		collector.on("end", async () => {
			const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId("queue_prev")
					.setLabel("⏮️  Prev")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(true),
				new ButtonBuilder()
					.setCustomId("queue_next")
					.setLabel("⏭️  Next")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(true),
			);
			await interaction
				.editReply({
					components: [disabledRow],
				})
				.catch(() => {});
		});
	}
}

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
	createQueueContainer,
	createQueueRemoveSelectRow,
	createQueueRow,
	QueueIterator,
	removeTracks,
} from "@commandUtils/music/queue";
import { ApplyOptions } from "@sapphire/decorators";
import {
	type ChatInputCommand,
	Command,
	RegisterBehavior,
} from "@sapphire/framework";
import { MessageFlags } from "discord.js";
import type { Track } from "riffy";

@ApplyOptions<Command.Options>({
	name: "queue",
	description: "Display the current music queue",
	aliases: ["q"],
	fullCategory: ["Music"],
	preconditions: ["HasActivePlayerPrecondition"],
})
export class QueueCommand extends Command {
	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry,
	) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("queue")
					.setDescription("Display the current music queue"),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite },
		);
	}

	public async chatInputRun(
		interaction: Command.ChatInputCommandInteraction,
	) {
		const player = this.container.client.riffy.players.get(
			interaction.guildId!,
		)!;

		const queueItems = Array.from(player.queue) as Track[];
		if (queueItems.length === 0 && !player.current) {
			return interaction.reply({
				components: [
					createMusicStatusContainer(
						"Music Queue",
						"The queue is currently empty.",
						"📻",
					),
				],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		const iterator = new QueueIterator(queueItems, 10);
		const initialRows = [];
		if (iterator.totalPages > 1) {
			initialRows.push(createQueueRow(iterator));
		}
		if (queueItems.length > 0) {
			initialRows.push(createQueueRemoveSelectRow(iterator));
		}

		const message = await interaction.reply({
			components: [
				createQueueContainer(player, iterator),
				...initialRows,
			],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});

		if (initialRows.length === 0) return;

		const collector = message.createMessageComponentCollector({
			time: 60_000,
		});

		collector.on("collect", async (i) => {
			if (i.user.id !== interaction.user.id) {
				await i.reply({
					components: [
						createMusicStatusContainer(
							"Queue Navigation",
							"You cannot interact with these controls.",
							"⚠️",
						),
					],
					flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
				});
				return;
			}

			if (i.isButton()) {
				if (i.customId === "queue_prev") {
					iterator.prev();
				} else if (i.customId === "queue_next") {
					iterator.next();
				} else if (i.customId === "queue_first") {
					iterator.firstPage();
				} else if (i.customId === "queue_last") {
					iterator.lastPage();
				}

				const rows = [];
				if (iterator.totalPages > 1) {
					rows.push(createQueueRow(iterator));
				}
				if (iterator.totalItems > 0) {
					rows.push(createQueueRemoveSelectRow(iterator));
				}

				await i.update({
					components: [
						createQueueContainer(player, iterator),
						...rows,
					],
					flags: MessageFlags.IsComponentsV2,
				});
			} else if (
				i.isStringSelectMenu() &&
				i.customId === "queue_remove_track"
			) {
				const trackPosition = parseInt(i.values[0], 10);
				if (isNaN(trackPosition)) return;

				const removed = removeTracks(
					player.queue as unknown as Track[],
					trackPosition,
					1,
				);

				const updatedQueue = Array.from(player.queue) as Track[];
				iterator.updateItems(updatedQueue);

				const rows = [];
				if (iterator.totalPages > 1) {
					rows.push(createQueueRow(iterator));
				}
				if (iterator.totalItems > 0) {
					rows.push(createQueueRemoveSelectRow(iterator));
				}

				await i.update({
					components: [
						createQueueContainer(player, iterator),
						...rows,
					],
					flags: MessageFlags.IsComponentsV2,
				});

				if (removed.length > 0) {
					await i.followUp({
						components: [
							createMusicStatusContainer(
								"Track Removed",
								`Removed **[${removed[0].info.title}](${removed[0].info.uri})** from the queue.`,
								"🗑️",
							),
						],
						flags:
							MessageFlags.Ephemeral |
							MessageFlags.IsComponentsV2,
					});
				}
			}
		});

		collector.on("end", async () => {
			const rows = [];
			if (iterator.totalPages > 1) {
				rows.push(createQueueRow(iterator, true));
			}
			if (iterator.totalItems > 0) {
				rows.push(createQueueRemoveSelectRow(iterator, true));
			}

			await interaction
				.editReply({
					components: [
						createQueueContainer(player, iterator),
						...rows,
					],
					flags: MessageFlags.IsComponentsV2,
				})
				.catch(() => {});
		});
	}
}

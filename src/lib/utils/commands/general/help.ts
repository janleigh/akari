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
import { Command } from "@sapphire/framework";
import { ButtonStyle } from "discord.js";
import type { Client } from "discord.js";

export const HELP_CATEGORY_SELECT_ID = "help:category";

export function createBotInfoContainer(
	client: Client,
	commandCount: number,
	categories: readonly string[],
): ContainerBuilder {
	const uptime =
		client.uptime === null
			? "Unknown"
			: `<t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`;
	const botName = client.user?.username ?? "Homura";

	return new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`\`\`\`Use the select menu below to explore ${botName}\`\`\``,
			),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`[Homura](https://github.com/janleigh/homura) is a (not-so) generic music bot for Discord that plays\nmusic from various sources.\n\n**Servers:** ${client.guilds.cache.size}\n**Commands:** ${commandCount}\n**Uptime:** ${uptime}`,
			),
		)
		.addActionRowComponents(createHelpCategoryRow(categories));
}

export function createHelpContainer(
	commands: Iterable<Command>,
	categories: readonly string[],
	category?: string,
): ContainerBuilder {
	const matchingCommands = Array.from(commands).filter((command) =>
		category
			? command.fullCategory[0]?.toLowerCase() === category.toLowerCase()
			: true,
	);
	const commandList =
		matchingCommands.length === 0
			? "No commands are available in this category."
			: matchingCommands
					.map(
						(command) =>
							`**\`/${command.name}\`** - ${command.description || "No description provided."}`,
					)
					.join("\n");

	return new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## ${category!.charAt(0).toUpperCase() + category!.slice(1) + " Commands"}\nUse the select menu below to explore commands.`,
			),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(commandList),
		)
		.addActionRowComponents(createHelpCategoryRow(categories));
}

export function createHelpCategoryRow(
	categories: readonly string[],
): ActionRowBuilder<SelectMenuBuilder> {
	const categorySelection = new SelectMenuBuilder()
		.setCustomId(HELP_CATEGORY_SELECT_ID)
		.setPlaceholder("Select a category")
		.addOptions(
			categories.map((category) =>
				new SelectMenuOptionBuilder()
					.setLabel(category)
					.setValue(category.toLowerCase()),
			),
		);

	return new ActionRowBuilder<SelectMenuBuilder>().addComponents(
		categorySelection,
	);
}

export function createHelpLinksRow(): ActionRowBuilder<ButtonBuilder> {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setLabel("Source Code")
			.setStyle(ButtonStyle.Link)
			.setURL("https://github.com/janleigh/akari"),
	);
}

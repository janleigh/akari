/**
 *  Copyright (C) 2025 Jan Leigh Muñoz
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
 **/

import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { ButtonInteraction } from "discord.js";
import { ConversationService } from "../lib/services/ConversationService";
import { EmbedBuilder } from "../lib/components/EmbedBuilder";

export class ClearConversationButtonHandler extends InteractionHandler {
	public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.Button
		});
	}

	public override parse(interaction: ButtonInteraction) {
		if (interaction.customId !== "clearConversation") return this.none();

		return this.some();
	}

	public async run(interaction: ButtonInteraction) {
		await interaction.deferUpdate();

		try {
			const conversationData = await ConversationService.getConversationHistory(interaction.user.id);

			if (conversationData.messages.length === 0) {
				const embed = new EmbedBuilder()
					.isErrorEmbed()
					.setDescription("You can only clear your own conversation history.");

				return interaction.editReply({
					content: "",
					embeds: [embed],
					components: []
				});
			}

			await ConversationService.clearConversation(interaction.user.id);

			const embed = new EmbedBuilder()
				.isSuccessEmbed(true)
				.setDescription("Your conversation history has been cleared. You can start a new conversation now!");

			return interaction.editReply({
				content: "",
				embeds: [embed],
				components: []
			});
		} catch (error) {
			this.container.logger.error(`[ClearConversationButtonHandler] Error: ${error}`);

			const embed = new EmbedBuilder()
				.isErrorEmbed()
				.setDescription("An error occurred while clearing your conversation history.");

			return interaction.editReply({
				content: "",
				embeds: [embed],
				components: []
			});
		}
	}
}

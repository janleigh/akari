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
import { getEmoji } from "../lib/utils/common/parsers";

export class ClearConversationButtonHandler extends InteractionHandler {
	public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.Button
		});
	}

	public override parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith("clearConversation")) return this.none();

		return this.some();
	}

	public async run(interaction: ButtonInteraction) {
		await interaction.deferUpdate();

		try {
			const customIdParts = interaction.customId.split("_");
			const targetUserId = customIdParts.length > 1 ? customIdParts[1] : interaction.user.id;

			if (targetUserId !== interaction.user.id) {
				return interaction.editReply({
					content: `${getEmoji("crossmark")} You can only clear your own conversation history.`,
					components: []
				});
			}

			const conversationData = await ConversationService.getConversationHistory(interaction.user.id);

			if (conversationData.messages.length === 0) {
				return interaction.editReply({
					content: `${getEmoji("crossmark")} You don't have any conversation history to clear.`,
					components: []
				});
			}

			await ConversationService.clearConversation(interaction.user.id);

			return interaction.editReply({
				content: `${getEmoji("checkmark")} Your conversation history has been cleared.`,
				components: []
			});
		} catch (error) {
			this.container.logger.error(`[ClearConversationButtonHandler] Error: ${error}`);

			return interaction.editReply({
				content: `${getEmoji("crossmark")} An error occurred while clearing your conversation history. Please try again later.`,
				components: []
			});
		}
	}
}

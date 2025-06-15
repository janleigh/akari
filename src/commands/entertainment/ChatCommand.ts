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

import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import { text } from "../../lib/utils";
import { generateResponse, pingOllamaServer } from "../../lib/utils/ai/fetch";
import { ConversationService } from "../../lib/services/ConversationService";
import { DEV_USER_IDS } from "../../config";
import { splitMessage } from "../../lib/utils/common/text";
import { getEmoji } from "../../lib/utils/common/parsers";

@ApplyOptions<Command.Options>({
	name: "chat",
	fullCategory: ["Entertainment"]
})
export class ChatCommand extends Command {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("chat")
					.setDescription("Chat with the bot.")
					.addStringOption((option) =>
						option.setName("message").setDescription("Your message to the AI.").setRequired(true)
					)
					.addBooleanOption((option) =>
						option
							.setName("ephemeral")
							.setDescription("Whether to send the reply privately. Defaults to true.")
							.setRequired(false)
					)
					.addBooleanOption((option) =>
						option
							.setName("new_conversation")
							.setDescription("Start a new conversation.")
							.setRequired(false)
					),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const startTime = Date.now();
		const userMessage = interaction.options.getString("message", true);
		const ephemeral = interaction.options.getBoolean("ephemeral") ?? true;
		const newConversation = interaction.options.getBoolean("new_conversation") ?? false;
		const isDev = DEV_USER_IDS.includes(interaction.user.id);

		await interaction.deferReply({ flags: ephemeral ? MessageFlags.Ephemeral : undefined });

		try {
			const isServerUp = await pingOllamaServer();
			if (!isServerUp) {
				return interaction.editReply({
					content: `${getEmoji("crossmark")} The AI server is currently unavailable. Please try again later.`
				});
			}

			let conversationData;
			if (newConversation) {
				await ConversationService.clearConversation(interaction.user.id);
				conversationData = await ConversationService.getConversationHistory(
					interaction.user.id,
					interaction.guildId ?? undefined
				);
			} else {
				conversationData = await ConversationService.getConversationHistory(
					interaction.user.id,
					interaction.guildId ?? undefined
				);
			}

			await ConversationService.addMessage(conversationData.conversationId, "user", userMessage);

			const response = await generateResponse(
				userMessage,
				conversationData.messages,
				interaction.user.username,
				conversationData.systemInstructions
			);
			const cleanedResponse = text.clean(response);

			await ConversationService.addMessage(conversationData.conversationId, "assistant", response);

			const clearButton = new ButtonBuilder()
				.setCustomId(`clearConversation_${interaction.user.id}`)
				.setLabel("New Conversation")
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("🔄");
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(clearButton);

			const endTime = Date.now();
			const ms = endTime - startTime;
			const min = (ms / 60000).toFixed(2);
			const sec = (ms / 1000).toFixed(2);
			let responseContent = cleanedResponse;

			if (isDev) {
				responseContent += `\n\nResponse Time: ${min} minutes (${sec} seconds)`;
			}

			if (responseContent.length > 1023) {
				const chunks = splitMessage(responseContent, 926);

				await interaction.editReply({
					content: chunks[0],
					components: chunks.length === 1 ? [row] : []
				});
				for (let i = 1; i < chunks.length; i++) {
					const isLastChunk = i === chunks.length - 1;
					await interaction.followUp({
						content: chunks[i],
						components: isLastChunk ? [row] : [],
						flags: ephemeral ? MessageFlags.Ephemeral : undefined
					});
				}
				return;
			}

			return interaction.editReply({
				content: responseContent,
				components: ephemeral ? [row] : []
			});
		} catch (error) {
			this.container.logger.error(`[ChatCommand] Error: ${error}`);
			return interaction.editReply({
				content: `${getEmoji("crossmark")} An error occurred while processing your request. Please try again later.`
			});
		}
	}
}

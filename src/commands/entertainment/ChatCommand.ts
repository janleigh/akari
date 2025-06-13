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

import axios from "axios";
import fs from "fs";
import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import { EmbedBuilder } from "../../lib/components/EmbedBuilder";
import { text } from "../../lib/utils";
import { pingOllamaServer } from "../../lib/utils/ai/fetch";
import { ConversationService } from "../../lib/services/ConversationService";
import { OLLAMA_OPTIONS } from "../../config";
import { DEV_USER_IDS } from "../../config";

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
		const embed = new EmbedBuilder();
		const isDev = DEV_USER_IDS.includes(interaction.user.id);

		await interaction.deferReply({ flags: ephemeral ? MessageFlags.Ephemeral : undefined });

		try {
			const isServerUp = await pingOllamaServer();
			if (!isServerUp) {
				embed.isErrorEmbed().setDescription("The AI server is currently unavailable. Please try again later.");
				return interaction.editReply({ embeds: [embed] });
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

			const response = await this.generateResponse(
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
			const totalTime = endTime - startTime;
			let responseContent = cleanedResponse;

			if (isDev) {
				responseContent += `\n\n*Developer Info: Response time: ${totalTime}ms*`;
			}

			if (responseContent.length > 1023) {
				const chunks = this.splitMessage(responseContent, 926);

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
				components: [row]
			});
		} catch (error) {
			this.container.logger.error(`[ChatCommand] Error: ${error}`);
			embed.isErrorEmbed().setDescription("An error occurred while processing your request. Please try again.");
			return interaction.editReply({ embeds: [embed] });
		}
	}

	/**
	 * Generates a response from the AI with conversation history
	 */
	private async generateResponse(
		message: string,
		conversationHistory: Array<{ role: string; content: string }>,
		username?: string,
		customSystemInstructions?: string | null
	) {
		let systemPrompt: string;

		if (customSystemInstructions) {
			systemPrompt = customSystemInstructions.replace("{{user}}", username ?? "User");
		} else {
			systemPrompt = fs
				.readFileSync("./public/Modelfile", "utf-8")
				.replace("{{user}}", username ?? "User")
				.replace(/\n/g, " ")
				.trim();
		}

		const messages = [
			{
				role: "system",
				content: systemPrompt
			},
			...conversationHistory,
			{
				role: "user",
				content: message
			}
		];

		const payload = {
			model: OLLAMA_OPTIONS.model,
			messages,
			stream: false,
			options: {
				num_thread: 2,
				temperature: 0.8,
				top_p: 0.9,
				top_k: 40
			}
		};

		const response = await axios.post(`${OLLAMA_OPTIONS.server}/api/chat`, payload, {
			timeout: 250000,
			headers: {
				"Content-Type": "application/json"
			}
		});

		if (response.data?.message?.content) {
			return response.data.message.content;
		}

		throw new Error("Invalid response from Ollama server");
	}

	/**
	 * Splits a message into chunks of specified length while preserving word boundaries
	 */
	private splitMessage(message: string, maxLength: number): string[] {
		if (message.length <= maxLength) {
			return [message];
		}

		const chunks: string[] = [];
		let currentChunk = "";
		const words = message.split(" ");

		for (const word of words) {
			// If adding this word would exceed the limit
			if (currentChunk.length + word.length + 1 > maxLength) {
				if (currentChunk.length > 0) {
					chunks.push(currentChunk.trim());
					currentChunk = "";
				}

				// If a single word is longer than maxLength, split it
				if (word.length > maxLength) {
					let remainingWord = word;
					while (remainingWord.length > maxLength) {
						chunks.push(remainingWord.substring(0, maxLength));
						remainingWord = remainingWord.substring(maxLength);
					}
					currentChunk = remainingWord;
				} else {
					currentChunk = word;
				}
			} else {
				currentChunk += (currentChunk.length > 0 ? " " : "") + word;
			}
		}

		if (currentChunk.length > 0) {
			chunks.push(currentChunk.trim());
		}

		return chunks;
	}
}

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
import { EmbedBuilder } from "../../lib/components/EmbedBuilder";
import { ConversationService } from "../../lib/services/ConversationService";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";

@ApplyOptions<Command.Options>({
	name: "conversation",
	fullCategory: ["Entertainment"]
})
export class ConversationCommand extends Command {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("conversation")
					.setDescription("Manage your conversation history with the AI.")
					.addSubcommand((subcommand) =>
						subcommand
							.setName("view")
							.setDescription("View your recent conversation history.")
							.addBooleanOption((option) =>
								option
									.setName("ephemeral")
									.setDescription("Whether to send the reply privately.")
									.setRequired(false)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("clear")
							.setDescription("Clear your conversation history.")
							.addBooleanOption((option) =>
								option
									.setName("ephemeral")
									.setDescription("Whether to send the reply privately.")
									.setRequired(false)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("system")
							.setDescription("Set custom system instructions for your conversation.")
							.addStringOption((option) =>
								option
									.setName("instructions")
									.setDescription("Custom system instructions (leave empty to reset to default)")
									.setRequired(false)
							)
							.addBooleanOption((option) =>
								option
									.setName("ephemeral")
									.setDescription("Whether to send the reply privately.")
									.setRequired(false)
							)
					),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const ephemeral = interaction.options.getBoolean("ephemeral") ?? true;
		const subcommand = interaction.options.getSubcommand();
		const embed = new EmbedBuilder();

		await interaction.deferReply({ flags: ephemeral ? MessageFlags.Ephemeral : undefined });

		try {
			if (subcommand === "view") {
				const conversationData = await ConversationService.getConversationHistory(
					interaction.user.id,
					interaction.guildId ?? undefined,
					10
				);

				if (conversationData.messages.length === 0) {
					embed.setDescription(
						"You don't have any conversation history yet. Start chatting with the `/chat` command!"
					);
					return interaction.editReply({ embeds: [embed] });
				}

				const formattedHistory = conversationData.messages
					.map((msg) => {
						const speaker = msg.role === "user" ? interaction.user.displayName : "Violetta";
						const content = msg.content;

						return `${speaker}: ${content}`;
					})
					.join("\n");

				const clearButton = new ButtonBuilder()
					.setCustomId("clearConversation")
					.setLabel("Clear Conversation")
					.setStyle(ButtonStyle.Danger)
					.setEmoji("🔄");

				const row = new ActionRowBuilder<ButtonBuilder>().addComponents(clearButton);

				const fullContent = `\`\`\`\n${formattedHistory}\n\`\`\``;

				if (fullContent.length > 1023) {
					const chunks = this.splitMessage(fullContent, 926);
					embed
						.setTitle("Conversation Transcript")
						.setDescription(chunks[0])
						.setFooter({
							text: `Conversation ID: ${conversationData.conversationId} (1/${chunks.length})`
						});

					await interaction.editReply({
						embeds: [embed],
						components: chunks.length === 1 ? [row] : []
					});

					// Send remaining chunks as follow-up messages
					for (let i = 1; i < chunks.length; i++) {
						const isLastChunk = i === chunks.length - 1;
						const chunkEmbed = new EmbedBuilder()
							.setTitle("Conversation Transcript (continued)")
							.setDescription(chunks[i])
							.setFooter({
								text: `Conversation ID: ${conversationData.conversationId} (${i + 1}/${chunks.length})`
							});

						await interaction.followUp({
							embeds: [chunkEmbed],
							components: isLastChunk ? [row] : [],
							flags: ephemeral ? MessageFlags.Ephemeral : undefined
						});
					}

					return;
				}

				embed
					.setTitle("Conversation Transcript")
					.setDescription(fullContent)
					.setFooter({ text: `Conversation ID: ${conversationData.conversationId}` });

				return interaction.editReply({ embeds: [embed], components: [row] });
			} else if (subcommand === "clear") {
				await ConversationService.clearConversation(interaction.user.id);

				embed
					.isSuccessEmbed(true)
					.setDescription(
						"Your conversation history has been cleared. You can start a new conversation now!"
					);

				return interaction.editReply({ embeds: [embed] });
			} else if (subcommand === "system") {
				const instructions = interaction.options.getString("instructions");

				if (!instructions) {
					await ConversationService.setSystemInstructions(interaction.user.id, null);

					embed
						.isSuccessEmbed(true)
						.setDescription(
							"System instructions have been reset to default. Violetta will use her original personality."
						);
				} else {
					await ConversationService.setSystemInstructions(interaction.user.id, instructions);

					const successMessage = `Custom system instructions have been set! Your conversation will now use these instructions:\n\`\`\`\n${instructions.length > 500 ? instructions.substring(0, 500) + "..." : instructions}\n\`\`\``;

					// Handle long system instructions by splitting
					if (successMessage.length > 1023) {
						const chunks = this.splitMessage(successMessage, 926);

						embed.isSuccessEmbed(true).setDescription(chunks[0]);

						await interaction.editReply({ embeds: [embed] });

						// Send remaining chunks as follow-up messages
						for (let i = 1; i < chunks.length; i++) {
							const chunkEmbed = new EmbedBuilder().isSuccessEmbed(true).setDescription(chunks[i]);

							await interaction.followUp({
								embeds: [chunkEmbed],
								flags: ephemeral ? MessageFlags.Ephemeral : undefined
							});
						}

						return;
					}

					embed.isSuccessEmbed(true).setDescription(successMessage);
				}

				return interaction.editReply({ embeds: [embed] });
			}
		} catch (error) {
			this.container.logger.error(`[ConversationCommand] Error: ${error}`);
			embed.isErrorEmbed().setDescription("An error occurred while processing your request. Please try again.");
			return interaction.editReply({ embeds: [embed] });
		}
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

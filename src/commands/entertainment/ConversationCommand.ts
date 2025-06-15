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
import { ConversationService } from "../../lib/services/ConversationService";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import { splitMessage } from "../../lib/utils/common/text";
import { getEmoji } from "../../lib/utils/common/parsers";

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

		await interaction.deferReply({ flags: ephemeral ? MessageFlags.Ephemeral : undefined });

		try {
			if (subcommand === "view") {
				const conversationData = await ConversationService.getConversationHistory(
					interaction.user.id,
					interaction.guildId ?? undefined,
					10
				);

				if (conversationData.messages.length === 0) {
					return interaction.editReply({
						content: "You don't have any conversation history yet. Start chatting with the `/chat` command!"
					});
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

				const fullContent = `**Conversation Transcript**\n\`\`\`\n${formattedHistory}\n\`\`\`\n*Conversation ID: ${conversationData.conversationId}*`;

				if (fullContent.length > 2000) {
					const chunks = splitMessage(fullContent, 1950);

					await interaction.editReply({
						content: chunks[0],
						components: chunks.length === 1 ? [row] : []
					});

					for (let i = 1; i < chunks.length; i++) {
						const isLastChunk = i === chunks.length - 1;
						const chunkContent =
							chunks[i] +
							(isLastChunk
								? `\n*Conversation ID: ${conversationData.conversationId} (${i + 1}/${chunks.length})*`
								: "");

						await interaction.followUp({
							content: chunkContent,
							components: isLastChunk ? [row] : [],
							flags: ephemeral ? MessageFlags.Ephemeral : undefined
						});
					}

					return;
				}

				return interaction.editReply({ content: fullContent, components: [row] });
			} else if (subcommand === "clear") {
				await ConversationService.clearConversation(interaction.user.id);

				return interaction.editReply({
					content: `${getEmoji("success")} Your conversation history has been cleared. You can start a new conversation now!`
				});
			} else if (subcommand === "system") {
				const instructions = interaction.options.getString("instructions");

				if (!instructions) {
					await ConversationService.setSystemInstructions(interaction.user.id, null);

					return interaction.editReply({
						content: `${getEmoji("success")} Your custom system instructions have been reset.`
					});
				} else {
					await ConversationService.setSystemInstructions(interaction.user.id, instructions);

					const successMessage = `✅ **Custom system instructions have been set!**\n\nYour conversation will now use these instructions:\n\`\`\`\n${instructions.length > 500 ? instructions.substring(0, 500) + "..." : instructions}\n\`\`\``;

					if (successMessage.length > 2000) {
						const chunks = splitMessage(successMessage, 1950);

						await interaction.editReply({ content: chunks[0] });

						for (let i = 1; i < chunks.length; i++) {
							await interaction.followUp({
								content: chunks[i],
								flags: ephemeral ? MessageFlags.Ephemeral : undefined
							});
						}

						return;
					}

					return interaction.editReply({ content: successMessage });
				}
			}
		} catch (error) {
			this.container.logger.error(`[ConversationCommand] Error: ${error}`);
			return interaction.editReply({
				content: `${getEmoji("crossmark")} An error occurred while processing your request. Please try again later.`
			});
		}
	}
}

import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { fetchResponseFromAI } from "../../libraries/utils/common/fetch";
import { BaseEmbedBuilder } from "../../libraries/structures/components";
import { resolveKey } from "@sapphire/plugin-i18next";
import { LanguageKeys } from "../../libraries/language";

export class ChatCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: "chat",
			fullCategory: ["Entertainment"]
		});
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("chat")
					.setDescription("Chat to Akari.")
					.addStringOption((option) =>
						option.setName("message").setDescription("The message you want to chat.").setRequired(true)
					)
					.addBooleanOption((option) =>
						option
							.setName("silent")
							.setDescription("Whether to send the reply public or not.")
							.setRequired(false)
					),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const message = interaction.options.getString("message");
		const silent = interaction.options.getBoolean("silent") ?? false;
		const embed = new BaseEmbedBuilder();
		const response: { role: string; content: string } = await fetchResponseFromAI(
			String(message),
			interaction.user.id
		);

		await interaction.deferReply({ ephemeral: silent });

		if (response.content) {
			await new Promise((resolve) => setTimeout(resolve, 2000));
			return interaction.editReply({ content: response.content });
		}

		embed.isErrorEmbed().setDescription(await resolveKey(interaction, LanguageKeys.Commands.Chat.CHAT_FAILED));
		return interaction.editReply({
			embeds: [embed]
		});
	}
}

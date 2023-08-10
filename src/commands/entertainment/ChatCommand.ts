import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { resolveKey } from "@sapphire/plugin-i18next";
import { fetchResponseFromAI, pingServer } from "../../libraries/utils/common/fetch";
import { BaseEmbedBuilder } from "../../libraries/structures/components";
import { LanguageKeys } from "../../libraries/language";
import { removeSymbols } from "../../libraries/utils/common/text";

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
					.setDescription("Chat to the bot.")
					.addStringOption((option) =>
						option.setName("message").setDescription("The message you want to chat.").setRequired(true)
					)
					.addBooleanOption((option) =>
						option
							.setName("ephemeral")
							.setDescription("Whether to send the reply public or not.")
							.setRequired(false)
					),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const message = interaction.options.getString("message");
		const silent = interaction.options.getBoolean("ephemeral") ?? false;
		const serverStatus = await pingServer();
		const embed = new BaseEmbedBuilder();

		await interaction.deferReply({ ephemeral: silent });

		if (serverStatus === true) {
			await fetchResponseFromAI(String(message), removeSymbols(interaction.user.username))
				.then((res) => {
					return interaction.editReply({
						content: res.content
					});
				})
				.catch(async () => {
					embed
						.isErrorEmbed()
						.setDescription(
							await resolveKey(interaction, LanguageKeys.Commands.Entertainment.ChatCommand.CHAT_FAILED)
						);
					return interaction.editReply({
						embeds: [embed]
					});
				});
		} else {
			embed
				.isErrorEmbed()
				.setDescription(
					await resolveKey(interaction, LanguageKeys.Commands.Entertainment.ChatCommand.CHAT_SERVER_DOWN)
				);
			return interaction.editReply({
				embeds: [embed]
			});
		}
	}
}

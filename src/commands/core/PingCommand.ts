import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { ApplyOptions } from "@sapphire/decorators";
import { resolveKey } from "@sapphire/plugin-i18next";
import { BaseEmbedBuilder } from "../../libraries/structures/components";
import { LanguageKeys } from "../../libraries/language";

@ApplyOptions<Command.Options>({
	name: "ping",
	fullCategory: ["Core"]
})
export class PingCommand extends Command {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) => builder.setName("ping").setDescription("Check if the bot is alive."),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const msg = await interaction.reply({
			content: `> ${await resolveKey(interaction, LanguageKeys.Commands.Core.PingCommand.PING_WAITING)}`,
			ephemeral: false,
			fetchReply: true
		});
		const embed = new BaseEmbedBuilder()
			.isErrorEmbed()
			.setDescription(await resolveKey(interaction, LanguageKeys.Commands.Core.PingCommand.PING_FAILED));

		if (isMessageInstance(msg)) {
			const diff = msg.createdTimestamp - interaction.createdTimestamp;
			const ping = Math.round(this.container.client.ws.ping);

			embed.isSuccessEmbed(false);
			embed.setDescription(
				await resolveKey(interaction, LanguageKeys.Commands.Core.PingCommand.PING_SUCCESS_DESCRIPTION, {
					ping: ping,
					diff: diff
				})
			);

			return interaction.editReply({
				content: `${await resolveKey(interaction, LanguageKeys.Commands.Core.PingCommand.PING_SUCCESS)}`,
				embeds: [embed]
			});
		}

		return interaction.editReply({ content: "", embeds: [embed] });
	}
}

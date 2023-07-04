import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { BaseEmbedBuilder } from "../../libraries/structures/components";
import { resolveKey } from "@sapphire/plugin-i18next";
import { LanguageKeys } from "../../libraries/language";

export class PingCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			fullCategory: ["Core"]
		});
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) => builder.setName("ping").setDescription("Check if the bot is alive."),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const msg = await interaction.reply({
			content: `> ${await resolveKey(interaction, LanguageKeys.Commands.Ping.PING_WAITING)}`,
			ephemeral: false,
			fetchReply: true
		});
		const embed = new BaseEmbedBuilder()
			.isErrorEmbed()
			.setDescription(await resolveKey(interaction, LanguageKeys.Commands.Ping.PING_FAILED));

		if (isMessageInstance(msg)) {
			const diff = msg.createdTimestamp - interaction.createdTimestamp;
			const ping = Math.round(this.container.client.ws.ping);

			embed.isSuccessEmbed(false);
			embed.setDescription(
				await resolveKey(interaction, LanguageKeys.Commands.Ping.PING_SUCCESS_DESCRIPTION, { ping, diff })
			);

			return interaction.editReply({
				content: `${await resolveKey(interaction, LanguageKeys.Commands.Ping.PING_SUCCESS)}`,
				embeds: [embed]
			});
		}

		return interaction.editReply({ content: "", embeds: [embed] });
	}
}

import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { resolveKey } from "@sapphire/plugin-i18next";
import { ComponentType } from "discord.js";
import { BaseEmbedBuilder, githubBtn, inviteBtn } from "../../libraries/structures/components";
import { parseEmojiByID } from "../../libraries/utils/common/parsers";
import { LanguageKeys } from "../../libraries/language";

@ApplyOptions<Command.Options>({
	name: "help",
	fullCategory: ["Core"]
})
export class HelpCommand extends Command {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder.setName("help").setDescription("Display the help menu or help for a specific command."),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const embed = new BaseEmbedBuilder();
		const transparent = parseEmojiByID("1126301870210695239");

		embed.setAuthor({
			name: (this.container.client.user?.username ?? "") + " Help Menu",
			iconURL: this.container.client.user?.displayAvatarURL({ size: 1024 })
		});

		embed.addFields(
			{
				name: "—  **CORE**",
				value: `
				${transparent} </help:${this.getCommandID("help")}> - ${await resolveKey(
					interaction,
					LanguageKeys.Commands.Core.HelpCommand.HELP_HELPCMD_DESCRIPTION
				)}
				${transparent} </ping:${this.getCommandID("ping")}> - ${await resolveKey(
					interaction,
					LanguageKeys.Commands.Core.HelpCommand.HELP_PINGCMD_DESCRIPTION
				)}
				`
			},
			{
				name: "—  **ENTERTAINMENT**",
				value: `
				${transparent} </chat:${this.getCommandID("chat")}> - ${await resolveKey(
					interaction,
					LanguageKeys.Commands.Core.HelpCommand.HELP_CHATCMD_DESCRIPTION
				)}
				`
			},
			{
				name: "—  **CONFIGURATION	**",
				value: `
				${transparent} </config:${this.getCommandID("config")}> - ${await resolveKey(
					interaction,
					LanguageKeys.Commands.Core.HelpCommand.HELP_CONFIGCMD_DESCRIPTION
				)}
				${transparent} </language:${this.getCommandID("language")}> - ${await resolveKey(
					interaction,
					LanguageKeys.Commands.Core.HelpCommand.HELP_LANGCMD_DESCRIPTION
				)}
				`
			}
		);

		return interaction.reply({
			embeds: [embed],
			components: [
				{
					type: ComponentType.ActionRow,
					components: [inviteBtn, githubBtn]
				}
			]
		});
	}

	private getCommandID(name: string) {
		return this.container.client.application?.commands.cache.find((cmd) => cmd.name === name)?.id;
	}
}

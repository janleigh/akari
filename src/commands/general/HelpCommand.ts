import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { resolveKey } from "@sapphire/plugin-i18next";
import { ComponentType } from "discord.js";
import { BaseEmbedBuilder, githubBtn, inviteBtn } from "../../libraries/structures/components";
import { parseEmojiByID } from "../../libraries/utils/common/parsers";
import { LanguageKeys } from "../../libraries/language";

@ApplyOptions<Command.Options>({
	name: "help",
	fullCategory: ["General"]
})
export class HelpCommand extends Command {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) => builder.setName("help").setDescription("Display the help menu."),
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
				name: "—  **GENERAL**",
				value: `
				${transparent} </help:${this.getCommandID("help")}> - ${await resolveKey(
					interaction,
					LanguageKeys.Commands.General.HelpCommand.HELP_HELPCMD_DESCRIPTION
				)}
				${transparent} </ping:${this.getCommandID("ping")}> - ${await resolveKey(
					interaction,
					LanguageKeys.Commands.General.HelpCommand.HELP_PINGCMD_DESCRIPTION
				)}
				`
			},
			{
				name: "—  **ENTERTAINMENT**",
				value: `
				${transparent} </chat:${this.getCommandID("chat")}> - ${await resolveKey(
					interaction,
					LanguageKeys.Commands.General.HelpCommand.HELP_CHATCMD_DESCRIPTION
				)}
				`
			},
			{
				name: "—  **CONFIGURATION	**",
				value: `
				${transparent} </config:${this.getCommandID("config")}> - ${await resolveKey(
					interaction,
					LanguageKeys.Commands.General.HelpCommand.HELP_CONFIGCMD_DESCRIPTION
				)}
				${transparent} </language:${this.getCommandID("language")}> - ${await resolveKey(
					interaction,
					LanguageKeys.Commands.General.HelpCommand.HELP_LANGCMD_DESCRIPTION
				)}
				`
			},
			{
				name: "—  **RADIO	**",
				value: `
				${transparent} </leave:${this.getCommandID("leave")}> - ${await resolveKey(
					interaction,
					LanguageKeys.Commands.General.HelpCommand.HELP_DISCONNECTCMD_DESCRIPTION
				)}
				${transparent} </play:${this.getCommandID("play")}> - ${await resolveKey(
					interaction,
					LanguageKeys.Commands.General.HelpCommand.HELP_PLAYCMD_DESCRIPTION
				)}
				${transparent} </song:${this.getCommandID("song")}> - ${await resolveKey(
					interaction,
					LanguageKeys.Commands.General.HelpCommand.HELP_SONGCMD_DESCRIPTION
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

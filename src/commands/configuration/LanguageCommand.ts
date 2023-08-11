import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { BaseEmbedBuilder } from "../../libraries/structures/components";
import { getEmoji } from "../../libraries/utils/common/parsers";
import { resolveKey } from "@sapphire/plugin-i18next";
import { LanguageKeys } from "../../libraries/language";

@ApplyOptions<Command.Options>({
	name: "language",
	fullCategory: ["Configuration"],
	preconditions: ["DeveloperOnlyPrecondition"]
})
export class LanguageCommand extends Command {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("language")
					.setDescription("Change the language of the bot for the server.")
					.addStringOption((option) =>
						option
							.setName("lang")
							.setDescription("The language you want to set for the server.")
							.setRequired(false)
							.addChoices(
								{ name: "English | English", value: "en-US" },
								{ name: "Filipino | Pilipino", value: "fil-PH" },
								{ name: "Reset", value: "en-US" }
							)
					),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const lang = interaction.options.getString("lang") as Language;
		const dbLang = await this.getCurrentLang(interaction.guildId as string);
		const infoEmoji = getEmoji("info");
		const embed = new BaseEmbedBuilder();

		if (!lang) {
			embed.setDescription(
				`${infoEmoji}  ${await resolveKey(
					interaction,
					LanguageKeys.Commands.Configuration.LanguageCommand.CURRENT_LANG,
					{ lang: dbLang }
				)}`
			);
		} else {
			await this.container.database.guildConfig.update({
				where: { guildId: interaction.guildId as string },
				data: { language: lang }
			});

			embed.setDescription(
				`${infoEmoji}  ${await resolveKey(
					interaction,
					LanguageKeys.Commands.Configuration.LanguageCommand.CHANGED_TO_LANG,
					{ lang: lang }
				)}`
			);
		}
		return interaction.reply({ embeds: [embed] });
	}

	private async getCurrentLang(guildId: string) {
		const db = await this.container.database.guildConfig.findUnique({
			where: { guildId: guildId }
		});

		return db?.language;
	}
}

type Language = "en-US" | "fil-PH";

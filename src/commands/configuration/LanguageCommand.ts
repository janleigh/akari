import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { BaseEmbedBuilder } from "../../libraries/structures/components";
import { parseEmojiByID } from "../../libraries/utils/common/parsers";

@ApplyOptions<Command.Options>({
	name: "language",
	fullCategory: ["Configuration"]
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
							.addChoices({ name: "English", value: "en-US" })
					),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const lang = interaction.options.getString("lang") as Language;
		const dbLang = await this.getCurrentLang(interaction.guildId as string);
		const infoEmoji = parseEmojiByID("1126390222620463214");
		const embed = new BaseEmbedBuilder();

		if (!lang) {
			embed.setDescription(`${infoEmoji}  The current language for this server is: **\`${dbLang}\`**`);
		} else {
			embed.isErrorEmbed().setDescription("To be implemented.");
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

type Language = "en-US";

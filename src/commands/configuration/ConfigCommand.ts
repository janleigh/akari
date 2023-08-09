import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { BaseEmbedBuilder } from "../../libraries/structures/components";
import { parseLanguageCode } from "../../libraries/utils/common/parsers";

@ApplyOptions<Command.Options>({
	name: "config",
	fullCategory: ["Configuration"]
})
export class ConfigCommand extends Command {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) => builder.setName("config").setDescription("View the current settings of the server."),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const embed = new BaseEmbedBuilder();
		const dbConf = await this.container.database.guildConfig.findUnique({
			where: { guildId: interaction.guildId as string }
		});

		embed.setAuthor({
			name: interaction.guild?.name + " Settings",
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
			iconURL: interaction.guild?.iconURL({ size: 1024 })!
		});

		embed.addFields({
			name: "—  **GENERAL**",
			value: `
					Is Premium: **\`To be developed.\`**
					Language: ${this.getFlag(dbConf?.language)} **\`${parseLanguageCode(dbConf?.language)}\`**
					`
		});

		return interaction.reply({ embeds: [embed] });
	}

	private getFlag(lang: string | undefined) {
		return `:flag_${lang?.split("-")[1].toLowerCase()}:`;
	}
}

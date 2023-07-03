import { ChatInputCommand, Command } from "@sapphire/framework";
import { BaseEmbedBuilder } from "../../libraries/structures/components/BaseEmbedBuilder";
import { DEV_USER_IDS } from "../../config";

export class EvalCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			fullCategory: ["Developer"]
		});
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("eval")
				.setDescription("Execute some javascript.")
				.addStringOption((option) =>
					option.setName("input").setDescription("The code to execute").setRequired(true)
				)
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const input = interaction.options.getString("input");
		const embed = new BaseEmbedBuilder();

		try {
			if (!DEV_USER_IDS.includes(interaction.user.id)) {
				throw Error("This command is dev only.");
			}

			const evaled = eval(input as string);
			embed.isSuccessEmbed().setDescription(`\`\`\`xl\n${evaled}\`\`\``);
		} catch (err) {
			embed.setTitle("Error Occured").isErrorEmbed().setDescription(`${err}`);
		}

		return interaction.reply({ embeds: [embed] });
	}
}

import { ChatInputCommand, Command } from "@sapphire/framework";
import { BaseEmbedBuilder } from "../../libraries/structures/components/BaseEmbedBuilder";
import { ComponentType } from "discord.js";
import { deleteBtn } from "../../libraries/structures/components/Buttons";
import { clean } from "../../libraries/utils/common/text";

export class EvalCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			fullCategory: ["Developer"],
			preconditions: ["DeveloperOnlyPrecondition"]
		});
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("eval")
				.setDescription("Execute some raw JavaScript code.")
				.addStringOption((option) =>
					option.setName("input").setDescription("The code to execute.").setRequired(true)
				)
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const input = interaction.options.getString("input");
		const embed = new BaseEmbedBuilder();
		let content = "";

		try {
			let evaled = eval(input as string);
			const timeTaken = ((Date.now() - interaction.createdTimestamp) / 1000).toFixed(3);
			evaled = clean(evaled);

			content = `:bricks: **EVAL COMPLETE** (${timeTaken}s) :bricks:\n\`\`\`xl\n${evaled}\`\`\``;
		} catch (err) {
			this.container.logger.error(`[EvalCommand] ${err}`);
			embed.isErrorEmbed().setDescription("An error occurred. Check the console for more details.");
		}

		return interaction.reply({
			content: content,
			embeds: embed.data.description ? [embed] : [],
			components: [
				{
					type: ComponentType.ActionRow,
					components: [deleteBtn]
				}
			]
		});
	}
}

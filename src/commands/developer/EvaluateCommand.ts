import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ComponentType } from "discord.js";
import { clean } from "../../libraries/utils/common/text";
import { BaseEmbedBuilder, deleteBtn } from "../../libraries/structures/components";

@ApplyOptions<Command.Options>({
	name: "eval",
	fullCategory: ["Developer"],
	preconditions: ["DeveloperOnlyPrecondition"]
})
export class EvalCommand extends Command {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("eval")
					.setDescription("Execute some raw JavaScript code.")
					.addStringOption((option) =>
						option.setName("input").setDescription("The code to execute.").setRequired(true)
					)
					.addBooleanOption((option) =>
						option
							.setName("silent")
							.setDescription("Whether to send the reply public or not.")
							.setRequired(false)
					),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
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

		if (content.length < 2000) {
			return interaction.reply({
				content: content,
				embeds: embed.data.description ? [embed] : [],
				ephemeral: interaction.options.getBoolean("silent") ?? false,
				components: [
					{
						type: ComponentType.ActionRow,
						components: [deleteBtn]
					}
				]
			});
		} else {
			this.container.logger.info("!! EVAL COMPLETE !!");
			console.log(content.replaceAll("```xl", "").replaceAll("```", ""));

			embed
				.isErrorEmbed()
				.setDescription(
					"The output was too long to be sent as a message. Output has been logged to the console."
				);

			return interaction.reply({
				content: "",
				embeds: embed.data.description ? [embed] : [],
				ephemeral: interaction.options.getBoolean("silent") ?? false,
				components: [
					{
						type: ComponentType.ActionRow,
						components: [deleteBtn]
					}
				]
			});
		}
	}
}

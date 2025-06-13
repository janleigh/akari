import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } from "discord.js";
import { text } from "../../lib/utils";
import { EmbedBuilder } from "../../lib/components/EmbedBuilder";

@ApplyOptions<Command.Options>({
    name: "eval",
    fullCategory: ["Developer"],
    preconditions: ["DeveloperOnlyPrecondition"]
})
export class EvaluateCommand extends Command {
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
                            .setName("ephemeral")
                            .setDescription("Whether to send the reply public or not.")
                            .setRequired(false)
                    ),
            { behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
        );
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const input = interaction.options.getString("input");
        const ephemeral = interaction.options.getBoolean("ephemeral") ?? false;
        const embed = new EmbedBuilder();
        let content = "";

        const deleteButton = new ButtonBuilder()
            .setCustomId("evalDelete")
            .setLabel("Delete")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🗑️");

        const deleteRow = new ActionRowBuilder<ButtonBuilder>().addComponents(deleteButton);

        try {
            let evaled = eval(input as string);
            const timeTaken = ((Date.now() - interaction.createdTimestamp) / 1000).toFixed(3);
            evaled = text.clean(evaled);

            content = `:bricks: **EVAL COMPLETE** (${timeTaken}s) :bricks:\n\`\`\`xl\n${evaled}\`\`\``;
        } catch (err) {
            this.container.logger.error(`[EvalCommand] ${err}`);
            embed.isErrorEmbed().setDescription("An error occurred. Check the console for more details.");
        }

        if (content.length < 2000) {
            return interaction.reply({
                content: content,
                embeds: embed.data.description ? [embed] : [],
                flags: ephemeral ? MessageFlags.Ephemeral : undefined,
                components: [deleteRow]
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
                embeds: [embed],
                flags: ephemeral ? MessageFlags.Ephemeral : undefined,
                components: [deleteRow]
            });
        }
    }
}

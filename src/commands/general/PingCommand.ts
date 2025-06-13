import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { MessageFlags } from "discord.js";
import { EmbedBuilder } from "../../lib/components/EmbedBuilder";

@ApplyOptions<Command.Options>({
    name: "ping",
    fullCategory: ["General"]
})
export class PingCommand extends Command {
    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand(
            (builder) => builder.setName("ping").setDescription("Check the bot's latency."),
            { behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
        );
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const start = Date.now();

        await interaction.reply({
            content: "> 🏓 Pinging...",
            flags: MessageFlags.Ephemeral
        });

        const end = Date.now();
        const diff = end - start;
        const ping = Math.round(this.container.client.ws.ping);

        const embed = new EmbedBuilder()
            .isSuccessEmbed()
            .setDescription(`**Discord API**: \`${diff}\`ms\n**Websocket:** \`${ping}\`ms`);

        return interaction.editReply({
            content: "> Pong 🏓!",
            embeds: [embed]
        });
    }
}

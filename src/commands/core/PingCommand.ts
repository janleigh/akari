import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { BaseEmbedBuilder } from "../../libraries/structures/components/BaseEmbedBuilder";

export class PingCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			fullCategory: ["Core"]
		});
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) => builder.setName("ping").setDescription("Check if the bot is alive."),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const msg = await interaction.reply({ content: "> Ping?", ephemeral: false, fetchReply: true });
		const embed = new BaseEmbedBuilder().isErrorEmbed().setDescription(":(, something went wrong.");

		if (isMessageInstance(msg)) {
			const diff = msg.createdTimestamp - interaction.createdTimestamp;
			const ping = Math.round(this.container.client.ws.ping);

			embed.isSuccessEmbed(false);
			embed.setDescription(`**Discord API**: \`${ping}\`ms\n**Websocket**: \`${diff}\`ms`);

			return interaction.editReply({ content: "Pong 🏓!", embeds: [embed] });
		}

		return interaction.editReply({ content: "", embeds: [embed] });
	}
}

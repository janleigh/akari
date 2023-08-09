import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { BaseEmbedBuilder } from "../../libraries/structures/components";
import { GuildMember } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

@ApplyOptions<Command.Options>({
	name: "disconnect",
	fullCategory: ["Radio"]
})
export class PingCommand extends Command {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder.setName("disconnect").setDescription("Disconnects the bot from the active voice channel."),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const embed = new BaseEmbedBuilder();
		const guild = interaction.guild;
		const member = interaction.member as GuildMember;
		const botMember = guild?.members.cache.get(this.container.client.user?.id as string);

		if (member.voice.channelId) {
			const connection = getVoiceConnection(guild?.id as string);
			if (connection) {
				embed.isSuccessEmbed(true);
				embed.setDescription(`Disconnected from <#${botMember?.voice.channelId}>.`);

				connection.destroy();
				this.container.players.delete(guild?.id as string);
			} else {
				embed.isErrorEmbed();
				embed.setDescription("I'm not connected to any voice channel.");
			}
		} else {
			embed.isErrorEmbed();
			embed.setDescription("You're not connected to any voice channel.");
		}

		return interaction.reply({ content: "", embeds: [embed] });
	}
}

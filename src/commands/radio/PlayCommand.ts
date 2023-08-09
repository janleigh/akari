import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { GuildMember, VoiceChannel } from "discord.js";
import { BaseEmbedBuilder } from "../../libraries/structures/components";
import { createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
import { parseEmojiByID } from "../../libraries/utils/common/parsers";
import got from "got";

@ApplyOptions<Command.Options>({
	name: "play",
	fullCategory: ["Radio"]
})
export class PingCommand extends Command {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("play")
					.setDescription("Plays the listen.moe radio on connected voice channel.")
					.addStringOption((option) =>
						option
							.setName("type")
							.setDescription("Which radio type you want to play.")
							.setRequired(true)
							.addChoices({ name: "J-Pop", value: "jpop" }, { name: "K-Pop", value: "kpop" })
					),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const embed = new BaseEmbedBuilder();
		const infoEmoji = parseEmojiByID("1126390222620463214");
		const type = interaction.options.getString("type") as RadioType;
		const guild = interaction.guild;
		const member = interaction.member as GuildMember;
		const botMember = guild?.members.cache.get(this.container.client.user?.id as string);

		if (member.voice.channelId) {
			const voiceChannel = guild?.channels.cache.get(member.voice.channelId);
			if (botMember?.voice.channelId) {
				embed.setDescription("I'm already playing on another voice channel.");
				embed.isErrorEmbed();
			}

			if (voiceChannel instanceof VoiceChannel) {
				const connection = joinVoiceChannel({
					channelId: voiceChannel.id,
					guildId: voiceChannel.guild.id,
					adapterCreator: voiceChannel.guild.voiceAdapterCreator
				});

				const player = createAudioPlayer();
				const stream = type === "jpop" ? "https://listen.moe/fallback" : "https://listen.moe/kpop/fallback";
				const resource = createAudioResource(got.stream(stream));

				player.play(resource);
				connection.subscribe(player);

				this.container.players.set(guild?.id as string, type);

				embed.setDescription(
					`${infoEmoji}  Joined <#${voiceChannel.id}> and started playing ${
						type === "jpop" ? "J-Pop" : "K-Pop"
					} radio.`
				);
			}
		} else {
			embed.setDescription("You must be connected to a voice channel to use this command.");
			embed.isErrorEmbed();
		}

		return interaction.reply({ embeds: [embed] });
	}
}

type RadioType = "jpop" | "kpop";

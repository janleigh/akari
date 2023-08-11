import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { GuildMember, VoiceChannel } from "discord.js";
import { BaseEmbedBuilder } from "../../libraries/structures/components";
import {
	AudioPlayerStatus,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel
} from "@discordjs/voice";
import { getEmoji } from "../../libraries/utils/common/parsers";
import { resolveKey } from "@sapphire/plugin-i18next";
import { LanguageKeys } from "../../libraries/language";

@ApplyOptions<Command.Options>({
	name: "play",
	fullCategory: ["Radio"]
})
export class PlayCommand extends Command {
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
		const infoEmoji = getEmoji("info");
		const type = interaction.options.getString("type") as RadioType;
		const guild = interaction.guild;
		const member = interaction.member as GuildMember;
		const botMember = guild?.members.cache.get(this.container.client.user?.id as string);

		if (member.voice.channelId) {
			const voiceChannel = guild?.channels.cache.get(member.voice.channelId);
			if (botMember?.voice.channelId) {
				embed.isErrorEmbed();
				embed.setDescription(
					await resolveKey(interaction, LanguageKeys.Commands.Radio.PlayCommand.ALREADY_PLAYING)
				);
			}

			if (voiceChannel instanceof VoiceChannel) {
				const connection = joinVoiceChannel({
					channelId: voiceChannel.id,
					guildId: voiceChannel.guild.id,
					adapterCreator: voiceChannel.guild.voiceAdapterCreator
				});

				const player = createAudioPlayer();
				const stream = type === "jpop" ? "https://listen.moe/stream" : "https://listen.moe/kpop/stream";

				connection.subscribe(player);

				let resource = createAudioResource(stream, {
					inputType: StreamType.OggOpus
				});

				player.play(resource);
				player.on(AudioPlayerStatus.Idle, () => {
					// Hehe memory leak go brrrr. Fixes #13
					if (this.container.players.has(guild?.id as string)) {
						resource = createAudioResource(stream, {
							inputType: StreamType.OggOpus
						});
						player.play(resource);
					}
				});
				player.on("error", (error) => {
					this.container.logger.error("Player error:" + error);
				});
				this.container.players.set(guild?.id as string, type);

				embed.setDescription(
					`${infoEmoji}  ${await resolveKey(
						interaction,
						LanguageKeys.Commands.Radio.PlayCommand.SUCCESSFULLY_JOINED,
						{
							channelId: voiceChannel.id,
							type: type === "jpop" ? "J-Pop" : "K-Pop"
						}
					)}`,
					true
				);
			}
		} else {
			embed.isErrorEmbed();
			embed.setDescription(
				await resolveKey(interaction, LanguageKeys.Commands.Radio.PlayCommand.USER_NOT_CONNECTED)
			);
		}

		return interaction.reply({ embeds: [embed] });
	}
}

export type RadioType = "jpop" | "kpop";

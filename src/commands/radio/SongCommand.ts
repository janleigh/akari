import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { BaseEmbedBuilder } from "../../libraries/structures/components";
import { getEmoji } from "../../libraries/utils/common/parsers";
import { RadioType } from "./PlayCommand";

@ApplyOptions<Command.Options>({
	name: "song",
	fullCategory: ["Radio"]
})
export class SongCommand extends Command {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("song")
					.setDescription("Shows the currently playing song on listen.moe.")
					.addStringOption((option) =>
						option
							.setName("type")
							.setDescription("Which radio type you want to check what's playing.")
							.setRequired(false)
							.addChoices({ name: "J-Pop", value: "jpop" }, { name: "K-Pop", value: "kpop" })
					),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const embed = new BaseEmbedBuilder();
		const transparent = getEmoji("transparent");
		const guild = interaction.guild;
		const type =
			this.container.players.get(guild?.id as string) ??
			(interaction.options.getString("type") as RadioType) ??
			"jpop";

		let ws = this.container.listenmoeJPOP;
		if (type === "kpop") {
			ws = this.container.listenmoeKPOP;
		}

		let ty = "J-Pop",
			np = ws.nowPlaying.song;

		if (type === "kpop") {
			ty = "K-Pop";
			np = ws.nowPlaying.song;
		}

		embed.setAuthor({
			name: `Now Playing on ${ty} Radio`,
			iconURL: "https://github.com/LISTEN-moe.png"
		});

		embed.setThumbnail(`https://cdn.listen.moe/covers/${np.albums[0].image}`);

		embed.addFields(
			{
				name: "—  **SONG INFO**",
				value: `
						${transparent} Title: **\`${np.title}\`**
						${transparent} Artist: **\`${np.artists
					.map((artist) => (artist.nameRomaji ? artist.nameRomaji : artist.name))
					.join(", ")}\`**
						${transparent} Duration: **\`${this.toMMSS(np.duration)}\`**
						${transparent} Requested by: **\`${ws.nowPlaying.requester !== null ? ws.nowPlaying.requester : "None"}\`**
							`
			},
			{
				name: "—  **RADIO**",
				value: `
						${transparent} Name: **[Listen.moe](https://listen.moe/)**
						${transparent} Listeners: **\`${ws.listeners}\`**
						`
			}
		);

		return interaction.reply({ content: "", embeds: [embed], ephemeral: true });
	}

	toMMSS(duration: number) {
		const minutes = ("0" + Math.floor(duration / 60)).slice(-2);
		const seconds = ("0" + Math.floor(duration % 60)).slice(-2);

		return `${minutes}:${seconds}`;
	}
}

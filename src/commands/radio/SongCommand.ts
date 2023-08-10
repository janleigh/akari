import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { BaseEmbedBuilder } from "../../libraries/structures/components";
import { parseEmojiByID } from "../../libraries/utils/common/parsers";

@ApplyOptions<Command.Options>({
	name: "song",
	fullCategory: ["Radio"]
})
export class SongCommand extends Command {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) => builder.setName("song").setDescription("Shows the currently playing song on listen.moe."),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const embed = new BaseEmbedBuilder();
		const transparent = parseEmojiByID("1126301870210695239");
		const guild = interaction.guild;
		const type = this.container.players.get(guild?.id as string);

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
						${transparent} Duration: **\`${this.toMMSS(np.duration)}\`**
						${transparent} Artist: **\`${np.artists
					.map((artist) => (artist.nameRomaji ? artist.nameRomaji : artist.name))
					.join(", ")}\`**
							`
			},
			{
				name: "—  **RADIO STATION**",
				value: `
						${transparent} Name: **[Listen.moe](https://listen.moe/)**
						${transparent} Listeners: **\`${ws.listeners}\`**
						`
			}
		);

		return interaction.reply({ content: "", embeds: [embed] });
	}

	toMMSS(duration: number) {
		const minutes = ("0" + Math.floor(duration / 60)).slice(-2);
		const seconds = ("0" + Math.floor(duration % 60)).slice(-2);

		return `${minutes}:${seconds}`;
	}
}

import { Listener } from "@sapphire/framework";
import { BaseInteraction, Events } from "discord.js";
import { parsers } from "../../libraries/utils";
import { BaseEmbedBuilder } from "../../libraries/structures/components/BaseEmbedBuilder";

export class InteractionCreateListener extends Listener {
	public constructor(ctx: Listener.Context) {
		super(ctx, {
			event: Events.InteractionCreate,
			name: Events.InteractionCreate
		});
	}

	public run(interaction: BaseInteraction) {
		if (!interaction.isChatInputCommand()) return;

		const barredUsers = parsers.parseBarredUserIDByFile(`${process.cwd()}/public/barredUsers.txt`);
		if (barredUsers.includes(interaction.user.id)) {
			const embed = new BaseEmbedBuilder()
				.isErrorEmbed()
				.setDescription("You are barred from using this command.");

			return interaction.reply({ content: "", embeds: [embed] });
		}
	}
}

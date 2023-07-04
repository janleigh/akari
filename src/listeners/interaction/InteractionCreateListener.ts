import { Listener } from "@sapphire/framework";
import { BaseInteraction, Events } from "discord.js";
import { parsers } from "../../libraries/utils";
import { BaseEmbedBuilder } from "../../libraries/structures/components";
import { resolveKey } from "@sapphire/plugin-i18next";
import { LanguageKeys } from "../../libraries/language";

export class InteractionCreateListener extends Listener {
	public constructor(ctx: Listener.Context) {
		super(ctx, {
			event: Events.InteractionCreate,
			name: Events.InteractionCreate
		});
	}

	public async run(interaction: BaseInteraction) {
		if (!interaction.isChatInputCommand()) return;

		const barredUsers = parsers.parseBarredUserIDByFile(`${process.cwd()}/public/barredUsers.txt`);
		if (barredUsers.includes(interaction.user.id)) {
			const embed = new BaseEmbedBuilder()
				.isErrorEmbed()
				.setDescription(await resolveKey(interaction, LanguageKeys.Listeners.InteractionCreate.USER_BARRED));

			return interaction.reply({ content: "", embeds: [embed] });
		}
	}
}

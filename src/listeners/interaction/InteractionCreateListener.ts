import { Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { resolveKey } from "@sapphire/plugin-i18next";
import { BaseInteraction, Events } from "discord.js";
import { parsers } from "../../libraries/utils";
import { BaseEmbedBuilder } from "../../libraries/structures/components";
import { LanguageKeys } from "../../libraries/language";

@ApplyOptions<Listener.Options>({ event: Events.InteractionCreate, name: "interactionCreate" })
export class InteractionCreateListener extends Listener<typeof Events.InteractionCreate> {
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

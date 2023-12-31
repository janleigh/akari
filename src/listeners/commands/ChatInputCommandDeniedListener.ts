import { Listener, Events, ChatInputCommandDeniedPayload, UserError, Identifiers } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { InteractionResponse } from "discord.js";
import { BaseEmbedBuilder } from "../../libraries/structures/components";
import { resolveKey } from "@sapphire/plugin-i18next";
import { LanguageKeys } from "../../libraries/language";

@ApplyOptions<Listener.Options>({ event: Events.ChatInputCommandDenied, once: false, name: "chatInputCommandDenied" })
export class ChatInputCommandDeniedListener extends Listener<typeof Events.ChatInputCommandDenied> {
	public async run(
		{ identifier, context, message }: UserError,
		{ interaction }: ChatInputCommandDeniedPayload
	): Promise<InteractionResponse | void> {
		const embed = new BaseEmbedBuilder().isErrorEmbed();
		let remaining;

		switch (identifier) {
			case Identifiers.PreconditionCooldown:
				remaining = Reflect.get(Object(context), "remaining");
				remaining = Math.round(remaining / 1000);

				embed.setDescription(
					await resolveKey(interaction, LanguageKeys.Listeners.Commands.ChatInputCommandDenied.ON_COOLDOWN, {
						remaining
					})
				);
				break;

			default:
				embed.setDescription(message);
				break;
		}

		return interaction.reply({ content: "", embeds: [embed] });
	}
}

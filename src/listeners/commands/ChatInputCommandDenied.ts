import { ApplyOptions } from "@sapphire/decorators";
import {
	type ChatInputCommandDeniedPayload,
	Events,
	Identifiers,
	Listener,
	type UserError,
} from "@sapphire/framework";

@ApplyOptions<Listener.Options>({
	event: Events.ChatInputCommandDenied,
})
export class ChatInputCommandDeniedListener extends Listener<
	typeof Events.ChatInputCommandDenied
> {
	public async run(
		error: UserError,
		{ interaction }: ChatInputCommandDeniedPayload,
	) {
		if (error.identifier === Identifiers.PreconditionUserPermissions) {
			const missing = (error.context as { missing: string[] })?.missing ?? [];
			const content = `You lack the required permissions to run this command: ${missing.map((perm) => `\`${perm}\``).join(", ")}`;

			return interaction.deferred || interaction.replied
				? interaction.editReply({ content })
				: interaction.reply({ content, ephemeral: true });
		}

		return interaction.deferred || interaction.replied
			? interaction.editReply({ content: error.message })
			: interaction.reply({ content: error.message, ephemeral: true });
	}
}

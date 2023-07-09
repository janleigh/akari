import { Listener, Events, ChatInputCommand } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ChatInputCommandInteraction, InteractionResponse } from "discord.js";

@ApplyOptions<Listener.Options>({ event: Events.ChatInputCommandRun, once: false, name: "chatInputCommandRun" })
export class ChatInputCommandRunListener extends Listener<typeof Events.ChatInputCommandRun> {
	public async run(
		interaction: ChatInputCommandInteraction,
		command: ChatInputCommand
	): Promise<InteractionResponse | void> {
		const db = await this.container.database.userTelemetry.findUnique({
			where: { userId: interaction.user.id }
		});

		if (!db) {
			await this.container.database.userTelemetry.create({
				data: {
					userId: interaction.user.id,
					totalCommandsUsed: 1,
					lastCommandUsed: command.name
				}
			});
		} else {
			await this.container.database.userTelemetry.update({
				where: { userId: interaction.user.id },
				data: {
					totalCommandsUsed: Number(db.totalCommandsUsed) + 1,
					lastCommandUsed: command.name
				}
			});
		}
	}
}

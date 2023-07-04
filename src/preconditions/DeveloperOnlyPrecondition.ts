import { Command, Precondition } from "@sapphire/framework";
import { DEV_USER_IDS } from "../config";

export class DeveloperOnlyPrecondition extends Precondition {
	public chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return this.checkDev(interaction.user.id);
	}

	public contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		return this.checkDev(interaction.user.id);
	}

	checkDev(userId: string) {
		return DEV_USER_IDS.includes(userId)
			? this.ok()
			: this.error({ message: "You are not allowed to use this command." });
	}
}

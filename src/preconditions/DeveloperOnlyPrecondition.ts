import { Command, Precondition } from "@sapphire/framework";
import { DEV_USER_IDS } from "../config";
import { resolveKey } from "@sapphire/plugin-i18next";
import { LanguageKeys } from "../libraries/language";

export class DeveloperOnlyPrecondition extends Precondition {
	public chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return this.checkDev(interaction, interaction.user.id);
	}

	public contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		return this.checkDev(interaction, interaction.user.id);
	}

	async checkDev(
		interaction: Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction,
		userId: string
	) {
		return DEV_USER_IDS.includes(userId)
			? this.ok()
			: this.error({ message: `${await resolveKey(interaction, LanguageKeys.Preconditions.DEVELOPER_ONLY)}` });
	}
}

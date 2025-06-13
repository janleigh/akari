import { Command, Precondition } from "@sapphire/framework";
import { Message } from "discord.js";
import { DEV_USER_IDS } from "../config";

export class DeveloperOnlyPrecondition extends Precondition {
    public chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        return this.checkDev(interaction.user.id);
    }

    public contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
        return this.checkDev(interaction.user.id);
    }

    public messageRun(message: Message) {
        return this.checkDev(message.author.id);
    }

    private checkDev(userId: string) {
        return DEV_USER_IDS.includes(userId)
            ? this.ok()
            : this.error({ message: "This command is only available to developers." });
    }
}

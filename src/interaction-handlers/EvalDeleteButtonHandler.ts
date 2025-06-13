import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { ButtonInteraction } from "discord.js";

export class EvalDeleteButtonHandler extends InteractionHandler {
    public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.Button
        });
    }

    public override parse(interaction: ButtonInteraction) {
        if (interaction.customId !== "evalDelete") return this.none();

        return this.some();
    }

    public async run(interaction: ButtonInteraction) {
        await interaction.deferUpdate();

        return interaction.message.delete();
    }
}

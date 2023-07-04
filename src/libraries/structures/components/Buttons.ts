import { ButtonBuilder, ButtonStyle } from "discord.js";

export const deleteBtn = new ButtonBuilder()
	.setCustomId("evalDelete")
	.setLabel("Delete Output")
	.setStyle(ButtonStyle.Danger);

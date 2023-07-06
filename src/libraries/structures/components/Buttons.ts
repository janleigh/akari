import { ButtonBuilder, ButtonStyle } from "discord.js";

export const deleteBtn = new ButtonBuilder()
	.setCustomId("evalDelete")
	.setLabel("Delete Output")
	.setStyle(ButtonStyle.Danger);

export const inviteBtn = new ButtonBuilder()
	.setLabel("Invite Akari")
	.setEmoji("1126314576544280686")
	.setURL(
		"https://discord.com/oauth2/authorize?client_id=1125402976845049937&permissions=1237423877622&scope=bot%20applications.commands"
	)
	.setStyle(ButtonStyle.Link);

export const githubBtn = new ButtonBuilder()
	.setLabel("GitHub")
	.setEmoji("1126316165208211476")
	.setURL("https://github.com/janleigh/akari")
	.setStyle(ButtonStyle.Link);

/**
 *  Copyright (C) 2026 Jan Leigh Muñoz
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published
 *  by the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { type Command, Precondition } from "@sapphire/framework";
import type { Guild, Message } from "discord.js";

export class SameVoiceChannelPrecondition extends Precondition {
	public chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return this.checkSameVoice(interaction.guild, interaction.user.id);
	}

	public contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		return this.checkSameVoice(interaction.guild, interaction.user.id);
	}

	public messageRun(message: Message) {
		return this.checkSameVoice(message.guild, message.author.id);
	}

	private async checkSameVoice(guild: Guild | null, userId: string) {
		if (!guild) {
			return this.error({
				message: "This command can only be used in a server.",
			});
		}

		const botVoiceChannelId =
			guild.members.me?.voice.channelId ??
			(await guild.members.fetchMe().catch(() => null))?.voice.channelId ??
			this.container.client.riffy.players.get(guild.id)?.voiceChannel;

		// If the bot is not connected to a voice channel, allow execution
		if (!botVoiceChannelId) {
			return this.ok();
		}

		const member =
			guild.members.cache.get(userId) ??
			(await guild.members.fetch(userId).catch(() => null));

		if (
			!member?.voice.channelId ||
			member.voice.channelId !== botVoiceChannelId
		) {
			return this.error({
				message:
					"You must be in the same voice channel as the bot to use this command.",
			});
		}

		return this.ok();
	}
}

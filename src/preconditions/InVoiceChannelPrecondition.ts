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

export class InVoiceChannelPrecondition extends Precondition {
	public chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return this.checkVoice(interaction.guild, interaction.user.id);
	}

	public contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		return this.checkVoice(interaction.guild, interaction.user.id);
	}

	public messageRun(message: Message) {
		return this.checkVoice(message.guild, message.author.id);
	}

	private async checkVoice(guild: Guild | null, userId: string) {
		if (!guild) {
			return this.error({
				message: "This command can only be used in a server.",
			});
		}

		const member =
			guild.members.cache.get(userId) ??
			(await guild.members.fetch(userId).catch(() => null));

		if (!member?.voice.channelId) {
			return this.error({
				message: "You must be in a voice channel to use this command.",
			});
		}

		return this.ok();
	}
}

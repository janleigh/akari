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
import type { Message } from "discord.js";

export class HasActivePlayerPrecondition extends Precondition {
	public chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return this.checkPlayer(interaction.guildId);
	}

	public contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		return this.checkPlayer(interaction.guildId);
	}

	public messageRun(message: Message) {
		return this.checkPlayer(message.guildId);
	}

	private checkPlayer(guildId: string | null) {
		if (!guildId) {
			return this.error({
				message: "This command can only be used in a server.",
			});
		}

		const player = this.container.client.riffy.players.get(guildId);
		if (!player) {
			return this.error({
				message: "There is no active music player in this server.",
			});
		}

		return this.ok();
	}
}

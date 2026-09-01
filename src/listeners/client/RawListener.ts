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

import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, type ListenerOptions } from "@sapphire/framework";
import { GatewayDispatchEvents } from "discord.js";
import { Riffy } from "riffy";

@ApplyOptions<ListenerOptions>({
	once: false,
	event: Events.Raw,
})
export class RawListener extends Listener<typeof Events.Raw> {
	public run(packet: Parameters<Riffy["updateVoiceState"]>[0]) {
		if (
			packet.t !== GatewayDispatchEvents.VoiceServerUpdate &&
			packet.t !== GatewayDispatchEvents.VoiceStateUpdate
		) {
			return;
		}

		this.container.logger.debug(`Received voice gateway event: ${packet.t}`);

		this.container.client.riffy.updateVoiceState(packet);
	}
}

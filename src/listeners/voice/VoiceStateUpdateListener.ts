import { Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Events, VoiceState } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

@ApplyOptions<Listener.Options>({ event: Events.VoiceStateUpdate, name: "voiceStateUpdate" })
export class VoiceStateUpdateListener extends Listener<typeof Events.VoiceStateUpdate> {
	public run(oldState: VoiceState): void {
		// Leave the voice channel if the bot is alone
		const connection = getVoiceConnection(oldState.guild.id);
		if (oldState.channel?.members.size === 1 && connection) {
			connection.destroy();
			this.container.players.delete(oldState.guild.id);
		}
	}
}

import { Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ActivityType, Events } from "discord.js";
import { CLIENT_OPTIONS } from "../config";

@ApplyOptions<Listener.Options>({ event: Events.ClientReady, name: "ready" })
export class ReadyListener extends Listener<typeof Events.ClientReady> {
	public async run(): Promise<void> {
		this.container.logger.info(`Logged in as ${this.container.client.user?.tag}`);

		this.container.client.user?.setPresence({
			activities: [
				{
					name:
						process.env.NODE_ENV === "development"
							? "my devs test in production"
							: `${CLIENT_OPTIONS.defaultPrefix}help`,
					type: process.env.NODE_ENV === "development" ? ActivityType.Watching : ActivityType.Listening
				}
			],
			status: "idle"
		});
	}
}

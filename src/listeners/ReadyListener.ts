import { Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ActivityType, Events } from "discord.js";
import { CLIENT_OPTIONS } from "../config";

@ApplyOptions<Listener.Options>({ event: Events.ClientReady, name: "ready" })
export class ReadyListener extends Listener<typeof Events.ClientReady> {
	public run(): void {
		this.container.logger.info(`Logged in as ${this.container.client.user?.tag}`);

		this.container.client.user?.setPresence({
			activities: [
				{
					name:
						process.env.NODE_ENV === "development"
							? "my devs test in production"
							: `${CLIENT_OPTIONS.defaultPrefix}help`,
					type: ActivityType.Listening
				}
			],
			status: "idle"
		});
	}
}

import { Listener } from "@sapphire/framework";
import { ActivityType, Events } from "discord.js";
import { CLIENT_OPTIONS } from "../config";

export class ReadyListener extends Listener {
	public constructor(ctx: Listener.Context) {
		super(ctx, {
			event: Events.ClientReady,
			name: Events.ClientReady
		});
	}

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

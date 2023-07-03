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
						this.container.client.user?.id === "1091917720641081374"
							? "my devs test in production"
							: `${CLIENT_OPTIONS.defaultPrefix}help`,
					type: ActivityType.Watching
				}
			],
			status: "dnd"
		});
	}
}

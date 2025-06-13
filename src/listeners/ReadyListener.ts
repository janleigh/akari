import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, type ListenerOptions } from "@sapphire/framework";
import { ActivityType, type Client } from "discord.js";
import { CLIENT_OPTIONS } from "../config";

@ApplyOptions<ListenerOptions>({
    once: true
})
export class ReadyListener extends Listener<typeof Events.ClientReady> {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: Events.ClientReady
        });
    }

    public run(client: Client<true>) {
        const { id, tag } = client.user;
        this.container.logger.info(`Successfully logged in as ${tag} (${id})`);

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

import { ClientOptions, GatewayIntentsString } from "discord.js";

/**
 * @description The dev server IDs. The only places where developer commands will be registered.
 * @type {string[]}
 */
export const DEV_SERVER_IDS: string[] = ["853812920919261235", "1125589968694280273"];

/**
 * @description The dev user IDs. The only users who can use developer commands.
 * @type {string[]}
 */
export const DEV_USER_IDS: string[] = ["380307921952833537"];

/**
 * @description The priveledged intents to be used by the bot.
 * @type {GatewayIntentsString[]}
 */
const INTENTS: GatewayIntentsString[] = [
	"Guilds",
	"GuildMembers",
	"GuildMessages",
	"GuildMessageReactions",
	"GuildEmojisAndStickers",
	"DirectMessages",
	"DirectMessageReactions"
];

/**
 * @description The default client options.
 * @type {ClientOptions}
 */
export const CLIENT_OPTIONS: ClientOptions = {
	intents: INTENTS,
	allowedMentions: { parse: ["users", "roles"], repliedUser: true },
	defaultCooldown: { delay: 3000 },
	defaultPrefix: "/",
	loadMessageCommandListeners: false,
	enableLoaderTraceLoggings: false
};

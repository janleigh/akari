/**
 *  Copyright (C) 2025 Jan Leigh Muñoz
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
 **/

import { BucketScope, LogLevel } from "@sapphire/framework";
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
	"GuildVoiceStates",
	"DirectMessages",
	"DirectMessageReactions"
];

/**
 * @description The Ollama server options.
 * @property {string} [model] - The model to use for the Ollama server.
 * @property {string} [server] - The URL of the Ollama server.
 */
export const OLLAMA_OPTIONS = {
	model: process.env.OLLAMA_MODEL ?? "huihui_ai/llama3.2-abliterate",
	server: process.env.OLLAMA_URL ?? "http://localhost:11434"
};

/**
 * @description The default client options.
 * @type {ClientOptions}
 */
export const CLIENT_OPTIONS: ClientOptions = {
	intents: INTENTS,
	allowedMentions: { parse: ["users", "roles"], repliedUser: true },
	defaultCooldown: {
		delay: 10_000,
		filteredUsers: DEV_USER_IDS,
		limit: 2,
		scope: BucketScope.User
	},
	defaultPrefix: "/",
	loadMessageCommandListeners: false,
	enableLoaderTraceLoggings: false,
	logger: {
		level: process.env.NODE_ENV === "production" ? LogLevel.Info : LogLevel.Debug
	}
};

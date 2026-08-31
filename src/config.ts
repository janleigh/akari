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

import { BucketScope, LogLevel } from "@sapphire/framework";
import {
	ActivityType,
	type ClientOptions,
	type GatewayIntentsString,
	type PresenceData,
} from "discord.js";

/**
 * @description The dev server IDs. The only places where developer commands will be registered.
 * @type {string[]}
 */
export const DEV_SERVER_IDS: string[] = ["1543805959636516864"];

/**
 * @description The dev user IDs. The only users who can use developer commands.
 * @type {string[]}
 */
export const DEV_USER_IDS: string[] = ["359641658654064641"];

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
	"DirectMessageReactions",
];

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
		scope: BucketScope.User,
	},
	defaultPrefix: "/",
	loadMessageCommandListeners: true,
	enableLoaderTraceLoggings: true,
	logger: {
		level:
			process.env.NODE_ENV === "production" ? LogLevel.Info : LogLevel.Debug,
	},
};

/**
 * @description The presence data for the bot.
 * @type {PresenceData}
 */
export const PRESENCE_OPTIONS: PresenceData = {
	activities: [
		{
			name: "idk to put here",
			type: ActivityType.Streaming,
			url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		},
	],
	status: "dnd",
};

export const EMOJI_IDS: Record<string, string> = {
	crossmark: "1543822619189575792",
	checkmark: "1543822636130508931",
	info: "1543831524913188864",
	loading: "1543831689543946301",
};

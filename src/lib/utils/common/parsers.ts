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

import { container } from "@sapphire/pieces";
import type { GuildEmoji } from "discord.js";

import { EMOJI_IDS } from "@/config.ts";

import type { EmojiName } from "../../types/constants/Emoji.ts";

/**
 * Parses an emoji by its ID.
 * @param {string} [emojiID] The emoji ID.
 * @returns {GuildEmoji | undefined}
 */
export const parseEmojiByID = (emojiID: string): GuildEmoji | undefined => {
	return container.client.emojis.cache.get(emojiID);
};

/**
 * Gets an emoji by its name.
 * @param {EmojiName} emoji The name of the emoji to get.
 * @returns {GuildEmoji | undefined} The emoji if found, otherwise undefined.
 */
export const getEmoji = (emoji: EmojiName): GuildEmoji | undefined => {
	return parseEmojiByID(EMOJI_IDS[emoji]);
};

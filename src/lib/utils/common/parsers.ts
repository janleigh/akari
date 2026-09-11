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

import { EMOJI_IDS } from "@/config";

import type { EmojiName } from "../../types/constants/Emoji";

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
 * @returns {GuildEmoji | string | undefined} The emoji if found, otherwise formatted emoji string or undefined.
 */
export const getEmoji = (emoji: EmojiName): GuildEmoji | string | undefined => {
	const emojiId = EMOJI_IDS[emoji];
	if (!emojiId) return undefined;

	const cachedEmoji = parseEmojiByID(emojiId);
	if (cachedEmoji) return cachedEmoji;

	return `<:${emoji}:${emojiId}>`;
};

/**
 * Formats a duration in milliseconds to a string in the format of "HH:MM:SS" or "MM:SS".
 * @param {number} duration The duration in milliseconds.
 * @returns {string} The formatted duration string.
 */
export const formatDuration = (duration: number): string => {
	const seconds = Math.floor((duration / 1000) % 60);
	const minutes = Math.floor((duration / (1000 * 60)) % 60);
	const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

	const formattedDuration = [
		hours > 0 ? String(hours).padStart(2, "0") : null,
		String(minutes).padStart(2, "0"),
		String(seconds).padStart(2, "0"),
	]
		.filter(Boolean)
		.join(":");

	return formattedDuration;
};

/**
 * Formats a playback progress bar.
 * @param {number} current The current duration in milliseconds.
 * @param {number} total The total duration in milliseconds.
 * @param {number} [barLength=15] The length of the progress bar.
 * @returns {string} The progress bar string.
 */
export const createProgressBar = (
	current: number,
	total: number,
	barLength: number = 15,
): string => {
	if (total <= 0) return `🔘${"▬".repeat(barLength - 1)}`;
	const progress = Math.min(Math.max(current / total, 0), 1);
	const progressIndex = Math.min(
		Math.floor(progress * barLength),
		barLength - 1,
	);
	const before = "▬".repeat(progressIndex);
	const after = "▬".repeat(barLength - 1 - progressIndex);
	return `${before}🔘${after}`;
};

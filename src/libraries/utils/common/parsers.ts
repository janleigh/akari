import { container } from "@sapphire/pieces";
import { GuildEmoji } from "discord.js";

/**
 * Parses an emoji by its ID.
 * @param {string} [emojiID] The emoji ID.
 * @returns {GuildEmoji | undefined}
 */
export const parseEmojiByID = (emojiID: string): GuildEmoji | undefined => {
	return container.client.emojis.cache.get(emojiID);
};

/**
 * Parses a language code and returns the language name.
 * @param {string | undefined} [languageCode] The language code.
 * @returns {string}/
 */
export const parseLanguageCode = (languageCode: string | undefined): string => {
	switch (languageCode) {
		case "fil-PH":
			return "Filipino (Philippines)";
		case "en-US":
		default:
			return "English (United States)";
	}
};

import { readFileSync } from "fs";
import { container } from "@sapphire/pieces";
import { GuildEmoji } from "discord.js";

/**
 * Parses a file and returns an array of strings.
 * @param {string} [inputFile] The file to parse.
 * @returns {string[]}
 */
export const parseBarredUserIDByFile = (inputFile: string): string[] => {
	const barredUsers: string[] = [];
	const file = readFileSync(inputFile, "utf-8");
	const lines = file.split(/\r?\n/);

	for (const line of lines) {
		barredUsers.push(line);
	}

	return barredUsers;
};

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

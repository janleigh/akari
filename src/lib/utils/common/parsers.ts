import { container } from "@sapphire/pieces";
import { GuildEmoji } from "discord.js";
import { Emoji } from "../../types/constants";
import { EmojiName } from "../../types/constants/Emoji";

/**
 * Parses an emoji by its ID.
 * @param {string} [emojiID] The emoji ID.
 * @returns {GuildEmoji | undefined}
 */
export const parseEmojiByID = (emojiID: string): GuildEmoji | undefined => {
	return container.client.emojis.cache.get(emojiID);
};

export const getEmoji = (emoji: EmojiName): GuildEmoji | undefined => {
	switch (emoji) {
		case "checkmark":
			return parseEmojiByID(Emoji.CheckmarkEmoji);
		case "crossmark":
			return parseEmojiByID(Emoji.CrossMarkEmoji);
		case "info":
			return parseEmojiByID(Emoji.InfoEmoji);
		case "transparent":
			return parseEmojiByID(Emoji.TransparentEmoji);
	}
};

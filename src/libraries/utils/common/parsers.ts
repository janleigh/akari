import { readFileSync } from "fs";
import { container } from "@sapphire/pieces";

export const parseBarredUserIDByFile = (inputFile: string): string[] => {
	const barredUsers: string[] = [];
	const file = readFileSync(inputFile, "utf-8");
	const lines = file.split(/\r?\n/);

	for (const line of lines) {
		barredUsers.push(line);
	}

	return barredUsers;
};

export const parseEmojiByID = (emojiID: string) => {
	return container.client.emojis.cache.get(emojiID);
};

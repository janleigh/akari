import { inspect } from "util";

export const clean = (text: string) => {
	if (typeof text !== "string") {
		text = inspect(text, { depth: 1 });
	}

	text = text
		.replace(/`/g, "`" + String.fromCharCode(8203))
		.replace(/@/g, "@" + String.fromCharCode(8203))
		.replace(process.env.DISCORD_TOKEN, "<TOKEN>");
	return text;
};

export const removeSymbols = (text: string) => {
	return text.replace(/[^a-zA-Z0-9 ]/g, "");
};

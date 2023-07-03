import { readFileSync } from "fs";

export const parseBarredUsersByFile = (inputFile: string): string[] => {
	const barredUsers: string[] = [];
	const file = readFileSync(inputFile, "utf-8");
	const lines = file.split(/\r?\n/);

	for (const line of lines) {
		barredUsers.push(line);
	}

	return barredUsers;
};

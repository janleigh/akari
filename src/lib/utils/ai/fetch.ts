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

import axios from "axios";
import fs from "fs";
import { OLLAMA_OPTIONS } from "../../../config";

/**
 * Checks if the Ollama server is reachable.
 * @returns {Promise<boolean>} True if the Ollama server is reachable, false otherwise.
 */
export const pingOllamaServer = async () => {
	try {
		const response = await axios.get(`${OLLAMA_OPTIONS.server}/api/tags`, {
			timeout: 5000
		});
		return response.status === 200;
	} catch {
		return false;
	}
};

/**
 * Generates a response from the AI with conversation history
 * @param {string} [message] - The user's message to the AI.
 * @param {Array<{ role: string; content: string }>} [conversationHistory] - The conversation history to provide context.
 * @param {string} [username] - The username to replace in the system prompt.
 * @param {string | null} [customSystemInstructions] - Custom system instructions to use instead of the default.
 * @returns {Promise<string>} The AI's response.
 */
export const generateResponse = async (
	message: string,
	conversationHistory: Array<{ role: string; content: string }>,
	username?: string,
	customSystemInstructions?: string | null
) => {
	let systemPrompt: string;

	if (customSystemInstructions) {
		systemPrompt = customSystemInstructions.replace("{{user}}", username ?? "User");
	} else {
		systemPrompt = fs
			.readFileSync("./public/Modelfile", "utf-8")
			.replace("{{user}}", username ?? "User")
			.replace(/\n/g, " ")
			.trim();
	}

	const messages = [
		{
			role: "system",
			content: systemPrompt
		},
		...conversationHistory,
		{
			role: "user",
			content: message
		}
	];

	const payload = {
		model: OLLAMA_OPTIONS.model,
		messages,
		stream: false,
		options: {
			num_thread: 2,
			temperature: 0.8,
			top_p: 0.9,
			top_k: 40
		}
	};

	const response = await axios.post(`${OLLAMA_OPTIONS.server}/api/chat`, payload, {
		timeout: 250000,
		headers: {
			"Content-Type": "application/json"
		}
	});

	if (response.data?.message?.content) {
		return response.data.message.content;
	}

	throw new Error("Invalid response from Ollama server");
};

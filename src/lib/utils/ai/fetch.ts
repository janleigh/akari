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
 * Generates a response from the AI without conversation history (simplified version)
 */
export const generateResponse = async (message: string, username?: string) => {
	const systemPrompt = fs
		.readFileSync("./public/Modelfile", "utf-8")
		.replace("{{user}}", username ?? "User")
		.replace(/\n/g, " ")
		.trim();

	const payload = {
		model: OLLAMA_OPTIONS.model,
		messages: [
			{
				role: "system",
				content: systemPrompt
			},
			{
				role: "user",
				content: message
			}
		],
		stream: false,
		options: {
			num_thread: 2,
			temperature: 0.8,
			top_p: 0.9,
			top_k: 40
		}
	};

	const response = await axios.post(`${OLLAMA_OPTIONS.server}/api/chat`, payload, {
		timeout: 999999,
		headers: {
			"Content-Type": "application/json"
		}
	});

	if (response.data?.message?.content) {
		return response.data.message.content;
	}

	throw new Error("Invalid response from Ollama server");
};

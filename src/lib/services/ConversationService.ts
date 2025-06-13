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

import { eq, desc } from "drizzle-orm";
import { db } from "../database/client";
import { conversations, messages } from "../database/schema";

export class ConversationService {
	/**
	 * Creates a new conversation for a user
	 */
	public static async createConversation(userId: string, guildId?: string, systemInstructions?: string) {
		const [newConversation] = await db
			.insert(conversations)
			.values({
				userId,
				guildId,
				systemInstructions,
				createdAt: Date.now()
			})
			.returning();

		return newConversation;
	}

	/**
	 * Gets the active conversation for a user or creates one if none exists
	 */
	public static async getOrCreateConversation(userId: string, guildId?: string) {
		// Get the most recent conversation for this user
		const userConversations = await db
			.select()
			.from(conversations)
			.where(eq(conversations.userId, userId))
			.orderBy(desc(conversations.createdAt))
			.limit(1);

		// If a conversation exists, return it, otherwise create a new one
		if (userConversations.length > 0) {
			return userConversations[0];
		}

		return this.createConversation(userId, guildId);
	}

	/**
	 * Sets custom system instructions for a user's conversation
	 */
	public static async setSystemInstructions(userId: string, instructions: string | null) {
		const conversation = await this.getOrCreateConversation(userId);

		await db
			.update(conversations)
			.set({ systemInstructions: instructions })
			.where(eq(conversations.id, conversation.id));
	}

	/**
	 * Gets system instructions for a user's conversation
	 */
	public static async getSystemInstructions(userId: string): Promise<string | null> {
		const conversation = await this.getOrCreateConversation(userId);
		return conversation.systemInstructions;
	}

	/**
	 * Adds a new message to a conversation
	 */
	public static async addMessage(conversationId: number, role: "user" | "assistant" | "system", content: string) {
		await db.insert(messages).values({
			conversationId,
			role,
			content,
			timestamp: Date.now()
		});
	}

	/**
	 * Gets messages from a conversation
	 */
	public static async getMessages(conversationId: number, limit = 10) {
		return db
			.select()
			.from(messages)
			.where(eq(messages.conversationId, conversationId))
			.orderBy(desc(messages.timestamp))
			.limit(limit);
	}

	/**
	 * Retrieves conversation history formatted for AI context
	 */
	public static async getConversationHistory(userId: string, guildId?: string, limit = 5) {
		const conversation = await this.getOrCreateConversation(userId, guildId);
		const messageHistory = await this.getMessages(conversation.id, limit);

		// Format the messages for the API call
		return {
			conversationId: conversation.id,
			systemInstructions: conversation.systemInstructions,
			messages: messageHistory
				.sort((a, b) => a.timestamp - b.timestamp)
				.map((msg) => ({
					role: msg.role,
					content: msg.content
				}))
		};
	}

	/**
	 * Clears a user's conversation history
	 */
	public static async clearConversation(userId: string) {
		const conversation = await this.getOrCreateConversation(userId);
		await db.delete(messages).where(eq(messages.conversationId, conversation.id));
		return conversation;
	}
}

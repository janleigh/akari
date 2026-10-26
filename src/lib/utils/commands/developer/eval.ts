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

import {
	ActionRowBuilder,
	ButtonBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
} from "@discordjs/builders";
import { ButtonStyle } from "discord.js";

export const EVAL_DELETE_CUSTOM_ID = "evalDelete";

export function createEvalSuccessContainer(
	evaled: string,
	timeTaken: string,
): ContainerBuilder {
	return new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## 🧱  Eval Complete (\`${timeTaken}s\`)`,
			),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`\`\`\`xl\n${evaled}\n\`\`\``),
		);
}

export function createEvalErrorContainer(errorText: string): ContainerBuilder {
	return new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent("## ❌  Eval Error"),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`\`\`\`xl\n${errorText}\n\`\`\``,
			),
		);
}

export function createEvalTooLongContainer(): ContainerBuilder {
	return new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent("## ❌  Eval Output Too Long"),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				"The output was too long to be sent as a message. Output has been logged to the console.",
			),
		);
}

export function createEvalDeleteRow(): ActionRowBuilder<ButtonBuilder> {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(EVAL_DELETE_CUSTOM_ID)
			.setLabel("Delete")
			.setStyle(ButtonStyle.Danger)
			.setEmoji({ name: "🗑️" }),
	);
}

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
	createEvalDeleteRow,
	createEvalErrorContainer,
	createEvalSuccessContainer,
	createEvalTooLongContainer,
} from "@commandUtils/developer/eval";
import { ApplyOptions } from "@sapphire/decorators";
import {
	type ChatInputCommand,
	Command,
	RegisterBehavior,
} from "@sapphire/framework";
import { text } from "@utils/index";
import { MessageFlags } from "discord.js";

@ApplyOptions<Command.Options>({
	name: "eval",
	description: "Developer Only",
	fullCategory: ["Developer"],
	preconditions: ["DeveloperOnlyPrecondition"],
})
export class EvaluateCommand extends Command {
	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry,
	) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("eval")
					.setDescription("Execute some raw JavaScript code")
					.addStringOption((option) =>
						option
							.setName("input")
							.setDescription("The code to execute.")
							.setRequired(true),
					)
					.addBooleanOption((option) =>
						option
							.setName("ephemeral")
							.setDescription(
								"Whether to send the reply public or not.",
							)
							.setRequired(false),
					),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite },
		);
	}

	public override chatInputRun(
		interaction: Command.ChatInputCommandInteraction,
	) {
		const input = interaction.options.getString("input");
		const ephemeral = interaction.options.getBoolean("ephemeral") ?? false;
		const baseFlags = ephemeral
			? MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
			: MessageFlags.IsComponentsV2;

		let evaled = "";
		let timeTaken = "";

		try {
			// oxlint-disable-next-line no-eval
			const rawResult = eval(input as string);
			timeTaken = (
				(Date.now() - interaction.createdTimestamp) /
				1000
			).toFixed(3);
			evaled = text.clean(rawResult);
		} catch (err) {
			this.container.logger.error("[EvalCommand] " + String(err));
			return interaction.reply({
				components: [
					createEvalErrorContainer(text.clean(String(err))),
					createEvalDeleteRow(),
				],
				flags: baseFlags,
			});
		}

		if (evaled.length < 1800) {
			return interaction.reply({
				components: [
					createEvalSuccessContainer(evaled, timeTaken),
					createEvalDeleteRow(),
				],
				flags: baseFlags,
			});
		} else {
			this.container.logger.info("!! EVAL COMPLETE !!");
			this.container.logger.info(evaled);

			return interaction.reply({
				components: [
					createEvalTooLongContainer(),
					createEvalDeleteRow(),
				],
				flags: baseFlags,
			});
		}
	}
}

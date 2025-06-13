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

import { ChatInputCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { MessageFlags } from "discord.js";
import { EmbedBuilder } from "../../lib/components/EmbedBuilder";

@ApplyOptions<Command.Options>({
	name: "ping",
	fullCategory: ["General"]
})
export class PingCommand extends Command {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) => builder.setName("ping").setDescription("Check the bot's latency."),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const start = Date.now();

		await interaction.reply({
			content: "> 🏓 Pinging...",
			flags: MessageFlags.Ephemeral
		});

		const end = Date.now();
		const diff = end - start;
		const ping = Math.round(this.container.client.ws.ping);

		const embed = new EmbedBuilder()
			.isSuccessEmbed()
			.setDescription(`**Discord API**: \`${diff}\`ms\n**Websocket:** \`${ping}\`ms`);

		return interaction.editReply({
			content: "> Pong 🏓!",
			embeds: [embed]
		});
	}
}

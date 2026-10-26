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
	createHelpContainer,
	createHelpLinksRow,
	HELP_CATEGORY_SELECT_ID,
} from "@commandUtils/general/help";
import { ApplyOptions } from "@sapphire/decorators";
import {
	InteractionHandler,
	InteractionHandlerTypes,
} from "@sapphire/framework";
import type { StringSelectMenuInteraction } from "discord.js";
import { MessageFlags } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.SelectMenu,
})
export class HelpCategorySelectMenuHandler extends InteractionHandler {
	public override parse(interaction: StringSelectMenuInteraction) {
		if (interaction.customId !== HELP_CATEGORY_SELECT_ID)
			return this.none();

		return this.some();
	}

	public async run(interaction: StringSelectMenuInteraction) {
		const commands = this.container.stores.get("commands");
		const category = interaction.values[0];

		return interaction.update({
			components: [
				createHelpContainer(
					commands.values(),
					commands.categories,
					category,
				),
				createHelpLinksRow(),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

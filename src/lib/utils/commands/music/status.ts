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
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
} from "@discordjs/builders";

export function createMusicStatusContainer(
	title: string,
	description: string,
	emoji: string = "🎵",
): ContainerBuilder {
	return new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`## ${emoji}  ${title}`),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(description),
		);
}

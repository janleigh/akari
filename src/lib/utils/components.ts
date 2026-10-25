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

export interface StatusContainerOptions {
	title: string;
	description: string;
	emoji?: string;
}

export function createStatusContainer(
	options: StatusContainerOptions,
): ContainerBuilder {
	const heading = options.emoji
		? `## ${options.emoji}  ${options.title}`
		: `## ${options.title}`;

	return new ContainerBuilder()
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(heading))
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(options.description),
		);
}

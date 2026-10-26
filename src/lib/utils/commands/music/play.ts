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
	ContainerBuilder,
	SelectMenuBuilder,
	SelectMenuOptionBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
} from "@discordjs/builders";
import { parsers } from "@utils/index";
import type { Track } from "riffy";

import { createMusicStatusContainer } from "./status";

export { createMusicStatusContainer };

export const SUPPORTED_SOURCES = [
	{ label: "YouTube Music", value: "ytmsearch", emoji: "🎵" },
	{ label: "YouTube", value: "ytsearch", emoji: "▶️" },
	{ label: "Spotify", value: "spsearch", emoji: "🟢" },
	{ label: "SoundCloud", value: "scsearch", emoji: "☁️" },
] as const;

export type MusicSearchSource = (typeof SUPPORTED_SOURCES)[number]["value"];

export function getSourceName(source: string): string {
	const found = SUPPORTED_SOURCES.find((s) => s.value === source);
	return found ? found.label : source;
}

export function createTrackEnqueuedContainer(options: {
	type: "track" | "playlist";
	title: string;
	userTag: string;
	count?: number;
	uri?: string;
}): ContainerBuilder {
	const checkmark = parsers.getEmoji("checkmark")?.toString() ?? "✅";
	if (options.type === "playlist") {
		return new ContainerBuilder()
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`## ${checkmark}  Playlist Enqueued`,
				),
			)
			.addSeparatorComponents(new SeparatorBuilder())
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`Added **${options.count ?? 0}** tracks from playlist **\`${options.title}\`** by **${options.userTag}**.`,
				),
			);
	}

	const trackLink = options.uri
		? `[${options.title}](${options.uri})`
		: `\`${options.title}\``;

	return new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## ${checkmark}  Track Enqueued`,
			),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`Added ${trackLink} to the queue by **${options.userTag}**.`,
			),
		);
}

export function createTrackSelectContainer(
	query: string,
	source: string,
	trackCount: number,
): ContainerBuilder {
	return new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## 🔍  Search Results\nFound **${trackCount}** results for **"${query}"** on **${getSourceName(source)}**.\nSelect a track from the menu below to add it to the queue.`,
			),
		)
		.addSeparatorComponents(new SeparatorBuilder());
}

export function createTrackSelectRow(
	tracks: Track[],
): ActionRowBuilder<SelectMenuBuilder> {
	const selectMenu = new SelectMenuBuilder()
		.setCustomId("play_track_select")
		.setPlaceholder("Choose a track to play...")
		.addOptions(
			tracks.slice(0, 10).map((track, index) => {
				const title =
					track.info.title.length > 95
						? `${track.info.title.slice(0, 95)}...`
						: track.info.title;
				const duration = parsers.formatDuration(track.info.length);
				const description = `${track.info.author} • ${duration}`.slice(
					0,
					100,
				);

				return new SelectMenuOptionBuilder()
					.setLabel(title)
					.setDescription(description)
					.setValue(String(index));
			}),
		);

	return new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu);
}

export function createSourceSelectRow(
	currentSource: string,
): ActionRowBuilder<SelectMenuBuilder> {
	const selectMenu = new SelectMenuBuilder()
		.setCustomId("play_source_select")
		.setPlaceholder("Switch search source...")
		.addOptions(
			SUPPORTED_SOURCES.map((source) =>
				new SelectMenuOptionBuilder()
					.setLabel(source.label)
					.setValue(source.value)
					.setEmoji({ name: source.emoji })
					.setDefault(source.value === currentSource),
			),
		);

	return new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu);
}

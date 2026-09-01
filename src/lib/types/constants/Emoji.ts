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

import { EMOJI_IDS } from "@/config";

export const CrossMarkEmoji = EMOJI_IDS.crossmark!;
export const CheckmarkEmoji = EMOJI_IDS.checkmark!;
export const InfoEmoji = EMOJI_IDS.info!;
export const TypingEmoji = EMOJI_IDS.typing!;

export type EmojiName = "checkmark" | "crossmark" | "info" | "typing";

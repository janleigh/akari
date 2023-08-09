import { EmbedBuilder } from "discord.js";
import { parseEmojiByID } from "../../utils/common/parsers";

export class BaseEmbedBuilder extends EmbedBuilder {
	/**
	 * @description Whether the embed is an error embed.
	 * @type {boolean}
	 * @default false
	 */
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	public errorEmbed: boolean = false;

	/**
	 * @description Whether the embed has a checkmark.
	 * @type {boolean}
	 * @default false
	 */
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	public hasCheckmark: boolean = false;

	/**
	 * @description The embed constructor.
	 * @constructor
	 */
	public constructor() {
		super();

		this.setColor("#fdd59a");
	}

	/**
	 * @override
	 * @description Sets the embed description.
	 * @returns {this}
	 */
	public override setDescription(description: string | null): this {
		if (description === null) return this;
		if (this.errorEmbed === true) {
			return super.setDescription(`${parseEmojiByID("1125590268419244042")} **${description}**`);
		}
		if (this.hasCheckmark === true) {
			return super.setDescription(`${parseEmojiByID("1125590254313811998")} **${description}**`);
		}

		return super.setDescription(description);
	}

	/**
	 * @description Sets the embed color to red.
	 * @returns {this}
	 */
	public isErrorEmbed(): this {
		this.setColor("#E84A5F");
		this.errorEmbed = true;
		return this;
	}

	/**
	 * @description Sets the embed color to green.
	 * @param {boolean} emoji Whether to add the checkmark emoji to the embed description.
	 * @returns {this}
	 */
	public isSuccessEmbed(emoji?: boolean): this {
		this.setColor("#1ED760");
		this.errorEmbed = false;
		this.hasCheckmark = emoji ?? false;
		return this;
	}
}

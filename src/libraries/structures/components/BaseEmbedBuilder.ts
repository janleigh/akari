import { EmbedBuilder } from "discord.js";

export class BaseEmbedBuilder extends EmbedBuilder {
	/**
	 * @description Whether the embed is an error embed.
	 * @type {boolean}
	 */
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	public errorEmbed: boolean = false;

	/**
	 * @description The embed constructor.
	 * @constructor
	 */
	public constructor() {
		super();
	}

	public override setDescription(description: string | null): this {
		if (description === null) return this;
		if (this.errorEmbed === true) return super.setDescription(`<:kekpoint:917360277647925268> **${description}**`);
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
	 * @returns {this}
	 */
	public isSuccessEmbed(): this {
		this.setColor("#1ED760");
		return this;
	}
}

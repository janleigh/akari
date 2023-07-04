import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-i18next/register";

import "dotenv/config";
import { BaseClient } from "./libraries/structures";

const main = (): void => {
	if (!process.env.DISCORD_TOKEN) {
		throw new TypeError(
			`Environment variable 'DISCORD_TOKEN' should be type string. Got type ${typeof process.env
				.DISCORD_TOKEN} instead.`
		);
	}

	void new BaseClient().initialize();
};

main();

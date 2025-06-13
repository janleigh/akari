import { AkariClient } from "./lib/AkariClient";

import "@sapphire/plugin-logger/register";
import "dotenv/config";

const main = (): void => {
	if (!process.env.DISCORD_TOKEN) {
		throw new TypeError(
			`Environment variable 'DISCORD_TOKEN' should be type string. Got type ${typeof process.env
				.DISCORD_TOKEN} instead.`
		);
	}

	void new AkariClient().login();
};

main();

import { SapphireClient } from "@sapphire/framework";
import { CLIENT_OPTIONS } from "../config";

export class AkariClient extends SapphireClient {
    public constructor() {
        super(CLIENT_OPTIONS);
    }

    public override async login(token?: string) {
        return super.login(token);
    }

    public override async destroy() {
        return super.destroy();
    }
}

declare module "@sapphire/pieces" {
    interface Container {
        client: AkariClient;
    }
}

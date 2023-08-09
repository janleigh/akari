import WebSocket from "ws";
import { BaseClient } from "../BaseClient";
import { ListenMoe } from "../../types/augments";

export class ListenMoeWebSocket {
	/**
	 * The base bot client.
	 * @type {BaseClient}
	 */
	public client: BaseClient;

	public gateway: string;
	public heartbeatInterval: NodeJS.Timer | undefined;

	public nowPlaying: ListenMoe.SongResponse;

	/**
	 * @constructor
	 * @param {BaseClient} [client] The base bot client.
	 */
	constructor(client: BaseClient, gateway: Gateway) {
		this.client = client;
		this.gateway = gateway;

		this.heartbeatInterval = undefined;
		this.nowPlaying = {} as ListenMoe.SongResponse;

		this.client.on("ready", () => this.initialize());
	}

	public initialize() {
		let ws: WebSocket | undefined = new WebSocket(`wss://listen.moe/${this.gateway}`);

		ws.onopen = () => {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = undefined;
		};

		ws.onmessage = (message) => {
			let res: ListenMoe.ListenMoeResponse;
			try {
				res = JSON.parse(message.data as string);
			} catch (err) {
				return;
			}

			switch (res.op) {
				case 0:
					ws?.send(JSON.stringify({ op: 9 }));
					this.heartbeat(ws, res.d.heartbeat);
					break;
				case 1:
					if (res.t != "TRACK_UPDATE" && res.t != "TRACK_UPDATE_REQUEST") return;
					this.nowPlaying = res.d;
					break;
				default:
					break;
			}
		};

		ws.onerror = () => {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = undefined;
			if (ws) {
				ws.close();
				ws = undefined;
			}

			setTimeout(() => this.initialize(), 5000);
		};
	}

	public heartbeat(ws: WebSocket | undefined, interval: number) {
		this.heartbeatInterval = setInterval(() => {
			ws?.send(JSON.stringify({ op: 9 }));
		}, interval);
	}
}

type Gateway = "gateway_v2" | "kpop/gateway_v2";

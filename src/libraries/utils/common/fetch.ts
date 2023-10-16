const API_URL = process.env.API_URL ?? "http://localhost:3000";

const _fetch = async (url: string) => {
	return await import("node-fetch").then(({ default: fetch }) => fetch(url));
};

export const pingServer = async () => {
	const status = await _fetch(API_URL);

	return status.status === 200;
};

export const fetchResponseFromAI = async (message: string, uid: string) => {
	// Closed source ;) No stealing
	const response = await _fetch(`${API_URL}/response?message=${message}&userId=${encodeURIComponent(uid)}`);

	return response.json() as Promise<{ content: string }>;
};

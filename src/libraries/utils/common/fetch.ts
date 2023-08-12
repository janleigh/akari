const API_URL = process.env.API_URL ?? "http://localhost:8080";

// Closed source ;) No stealing
export const pingServer = async () => {
	return await import("node-fetch").then(({ default: fetch }) =>
		fetch(API_URL)
			.then(() => {
				return true;
			})
			.catch(() => {
				return false;
			})
	);
};

export const fetchResponseFromAI = async (message: string, uid: string) => {
	const response = await import("node-fetch").then(({ default: fetch }) =>
		fetch(`${API_URL}/response?message=${message}&userId=${encodeURIComponent(uid)}`)
	);
	if (response instanceof Error) {
		return response;
	}
	return response.json();
};

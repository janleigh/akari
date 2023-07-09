/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from "node-fetch";

// Closed source ;) No stealing
export const pingServer = async () => {
	return await fetch("http://localhost:8080/")
		.then(() => {
			return true;
		})
		.catch(() => {
			return false;
		});
};

export const fetchResponseFromAI = async (message: string, uid: string) => {
	const response = await fetch(`http://localhost:8080/response?message=${message}&userId=${encodeURIComponent(uid)}`);
	if (response instanceof Error) {
		return response;
	}
	return response.json();
};

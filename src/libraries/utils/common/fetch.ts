import fetch from "node-fetch";

// Closed source ;) No stealing
export const fetchResponseFromAI = async (message: string, uid: string) => {
	const response = await fetch(`http://localhost:8080/response?msg=${message}&uid=${uid}`);
	return response.json();
};

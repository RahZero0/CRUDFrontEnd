import axios from "axios";

export const queryGemini = async (query) => {
  try {
    const response = await axios.get("/api/gemini", { params: { query } });
    return response.data.result || "No relevant information found.";
  } catch (error) {
    console.error("Error querying backend:", error.response.data.error);
    return error.response.data.error;
  }
};

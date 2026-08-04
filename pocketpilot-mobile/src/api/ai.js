import API from "./axios";

export const sendChatMessage = async (messages) => {
    const response = await API.post("/ai/chat", { messages });
    return response.data;
};
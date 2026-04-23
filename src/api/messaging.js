// src/api/messaging.js
// All messaging API calls. Auth token is pulled from localStorage.
// Adjust TOKEN_KEY to match whatever key your app uses to store the JWT.

import axios from "axios";

const TOKEN_KEY = "access_token"; // ← change if your app uses a different key
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

const api = axios.create({ baseURL: `${BASE_URL}/api/messaging` });

/** Fetch all conversations for the current user */
export async function getConversations() {
  const { data } = await api.get("/conversations/", { headers: authHeaders() });
  return data;
}

/** Start (or retrieve) a conversation with a user, optionally sending a first message */
export async function startConversation(recipientId, initialMessage = "") {
  const { data } = await api.post(
    "/conversations/start/",
    { recipient_id: recipientId, initial_message: initialMessage },
    { headers: authHeaders() }
  );
  return data;
}

/** Fetch all messages in a conversation (also marks them as read) */
export async function getMessages(conversationId) {
  const { data } = await api.get(`/conversations/${conversationId}/messages/`, {
    headers: authHeaders(),
  });
  return data;
}

/** Send a message into an existing conversation */
export async function sendMessage(conversationId, content) {
  const { data } = await api.post(
    `/conversations/${conversationId}/send/`,
    { content },
    { headers: authHeaders() }
  );
  return data;
}

/** Get total unread message count (for nav badge) */
export async function getUnreadCount() {
  const { data } = await api.get("/unread-count/", { headers: authHeaders() });
  return data.unread_count;
}

import newRequest from "../utils/newRequest";

export async function getConversations() {
  const { data } = await newRequest.get("/messaging/conversations/");
  return data;
}

export async function getUnreadCount() {
  const { data } = await newRequest.get("/messaging/unread-count/");
  return data.unread_count;
}

export async function startConversation(recipientId, initialMessage = "", gigId = null) {
  const { data } = await newRequest.post("/messaging/conversations/start/", {
    recipient_id: recipientId,
    initial_message: initialMessage,
    gig_id: gigId,
  });
  return data;
}
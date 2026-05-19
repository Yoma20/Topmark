import newRequest from "../utils/newRequest";

// ─── Gigs ─────────────────────────────────────────────────────────────────────

export async function getGigs(params = {}) {
  const { data } = await newRequest.get("/gigs/", { params });
  return Array.isArray(data) ? data : (data.results ?? []);
}

export async function getGig(slug) {
  const { data } = await newRequest.get(`/gigs/${slug}/`);
  return data;
}

export async function getMyGigs() {
  const { data } = await newRequest.get("/gigs/mine/");
  return Array.isArray(data) ? data : (data.results ?? []);
}

export async function createGig(payload) {
  const { data } = await newRequest.post("/gigs/create/", payload);
  return data;
}

export async function updateGig(slug, payload) {
  const { data } = await newRequest.patch(`/gigs/${slug}/manage/`, payload);
  return data;
}

export async function deleteGig(slug) {
  await newRequest.delete(`/gigs/${slug}/manage/`);
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories() {
  const { data } = await newRequest.get("/gigs/categories/");
  return Array.isArray(data) ? data : (data.results ?? []);
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function getOrders() {
  const { data } = await newRequest.get("/gigs/orders/");
  return Array.isArray(data) ? data : (data.results ?? []);
}

export async function getOrder(orderId) {
  const { data } = await newRequest.get(`/gigs/orders/${orderId}/`);
  return data;
}

export async function createPaymentIntent(packageId, extraIds = []) {
  const { data } = await newRequest.post("/gigs/orders/create-payment-intent/", {
    package_id: packageId,
    extra_ids: extraIds,
  });
  return data; // { order_id, amount }
}

export async function confirmPayment(orderId, method, extras = {}) {
  // method: "paypal" | "bank_transfer"
  // extras: { paypal_order_id? } or { pay_token? }
  const { data } = await newRequest.post(`/gigs/orders/${orderId}/confirm-payment/`, {
    method,
    ...extras,
  });
  return data;
}

export async function submitRequirements(orderId, formData) {
  // formData: FormData (multipart — supports rubric_file upload)
  const { data } = await newRequest.post(
    `/gigs/orders/${orderId}/requirements/`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function submitWork(orderId) {
  const { data } = await newRequest.post(`/gigs/orders/${orderId}/submit/`);
  return data;
}

export async function approveDelivery(orderId) {
  const { data } = await newRequest.post(`/gigs/orders/${orderId}/approve/`);
  return data;
}

export async function refundOrder(orderId) {
  const { data } = await newRequest.post(`/gigs/orders/${orderId}/refund/`);
  return data;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function createReview(orderId, payload) {
  // payload: { rubric_adherence_score, timeliness_score, communication_score, comment, would_recommend }
  const { data } = await newRequest.post(`/gigs/orders/${orderId}/review/`, payload);
  return data;
}

export async function getExpertReviews(expertId) {
  const { data } = await newRequest.get(`/gigs/experts/${expertId}/reviews/`);
  return Array.isArray(data) ? data : (data.results ?? []);
}

// ─── Earnings ────────────────────────────────────────────────────────────────

export async function getMyEarnings(period = "month") {
  // period: "week" | "month" | "all"
  const { data } = await newRequest.get("/gigs/my-earnings/", { params: { period } });
  return data; // { period, summary: { gross, fee, net, pending, completed_orders }, orders: [] }
}
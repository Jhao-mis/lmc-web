import { getStore } from "@netlify/blobs";

const KEY = "all-comments";
const MAX_COMMENTS = 500;
const MAX_NAME_LEN = 40;
const MAX_TEXT_LEN = 500;
const MAX_IMAGE_BYTES = 1_500_000; // ~1.5MB base64 string, keep blob store light

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

export default async (req) => {
  const store = getStore("lmc-comments");

  if (req.method === "GET") {
    const data = await store.get(KEY, { type: "json" });
    return json(data || []);
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const image = typeof body.image === "string" ? body.image : null;

    if (!name) return json({ error: "Name is required" }, 400);
    if (!text && !image) return json({ error: "Add a comment or a photo" }, 400);
    if (name.length > MAX_NAME_LEN) return json({ error: "Name is too long" }, 400);
    if (text.length > MAX_TEXT_LEN) return json({ error: "Comment is too long" }, 400);
    if (image && (!image.startsWith("data:image/") || image.length > MAX_IMAGE_BYTES)) {
      return json({ error: "Image is invalid or too large" }, 400);
    }

    const existing = (await store.get(KEY, { type: "json" })) || [];

    const comment = {
      id: crypto.randomUUID(),
      name: name.slice(0, MAX_NAME_LEN),
      text: text.slice(0, MAX_TEXT_LEN),
      image: image || null,
      time: Date.now(),
    };

    existing.push(comment);
    const trimmed = existing.slice(-MAX_COMMENTS);
    await store.set(KEY, JSON.stringify(trimmed));

    return json(comment, 201);
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = { path: "/api/comments" };

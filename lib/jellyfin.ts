const BASE_URL = process.env.NEXT_PUBLIC_JELLYFIN_URL || "http://localhost:8096";

const CLIENT_INFO = {
  name: "PersonalEntertainmentCenter",
  version: "1.0.0",
};

const DEVICE_INFO = {
  name: "Next.js Browser",
  id: "nextjs-web-client-001",
};

function getAuthHeader(token?: string) {
  const parts = [
    `MediaBrowser Client="${CLIENT_INFO.name}"`,
    `Device="${DEVICE_INFO.name}"`,
    `DeviceId="${DEVICE_INFO.id}"`,
    `Version="${CLIENT_INFO.version}"`,
  ];
  if (token) parts.push(`Token="${token}"`);
  return parts.join(", ");
}

export async function login(username: string, password: string) {
  const res = await fetch(`${BASE_URL}/Users/AuthenticateByName`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({ Username: username, Pw: password }),
  });

  if (!res.ok) throw new Error("Login gagal");
  return res.json();
}

export async function getViews(userId: string, token: string) {
  const res = await fetch(`${BASE_URL}/Users/${userId}/Views`, {
    headers: { Authorization: getAuthHeader(token) },
  });
  if (!res.ok) throw new Error("Gagal mengambil libraries");
  return res.json();
}

export async function getLatestItems(userId: string, token: string, limit = 20) {
  const params = new URLSearchParams({
    UserId: userId,
    Limit: limit.toString(),
    Fields: "PrimaryImageAspectRatio,Overview",
    ImageTypeLimit: "1",
    EnableImageTypes: "Primary",
  });

  const res = await fetch(`${BASE_URL}/Users/${userId}/Items/Latest?${params}`, {
    headers: { Authorization: getAuthHeader(token) },
  });
  if (!res.ok) throw new Error("Gagal mengambil latest items");
  return res.json();
}

export function getImageUrl(itemId: string, token: string, tag?: string) {
  const params = new URLSearchParams({
    maxWidth: "400",
    quality: "90",
  });
  if (tag) params.set("tag", tag);
  return `${BASE_URL}/Items/${itemId}/Images/Primary?${params}&api_key=${token}`;
}

// Lightweight helper for pulling decorative imagery from Unsplash.
// Falls back to a stable placeholder gradient class (handled by caller)
// if no access key is configured, so the UI never breaks in dev/demo setups.

interface UnsplashPhoto {
  id: string;
  url: string;
  thumbUrl: string;
  alt: string;
  credit: string;
  creditUrl: string;
}

const UNSPLASH_API = 'https://api.unsplash.com';

export function hasUnsplashKey(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY);
}

export async function searchUnsplashPhoto(query: string): Promise<UnsplashPhoto | null> {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  try {
    const res = await fetch(
      `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const result = json.results?.[0];
    if (!result) return null;
    return {
      id: result.id,
      url: result.urls.regular,
      thumbUrl: result.urls.thumb,
      alt: result.alt_description || query,
      credit: result.user?.name || 'Unsplash',
      creditUrl: result.user?.links?.html || 'https://unsplash.com',
    };
  } catch {
    return null;
  }
}

import { useState, useEffect } from 'react';
import { HF_BASE } from '../utils/hf';

let cachedManifest = null;

export function useManifest() {
  const [manifest, setManifest] = useState(cachedManifest);
  const [loading, setLoading] = useState(!cachedManifest);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      // Try HF (or local-data proxy in dev); fall back to public/manifest.json
      const urls = [`${HF_BASE}/manifest.json`, '/manifest.json'];
      let data = null;
      for (const url of urls) {
        const res = await fetch(url);
        if (res.ok) { data = await res.json(); break; }
      }
      if (!data) throw new Error('manifest.json not found');
      cachedManifest = data;
      setManifest(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!cachedManifest) load();
  }, []);

  return { manifest, loading, error, retry: load };
}

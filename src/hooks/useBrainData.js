import { useState, useEffect } from 'react';
import { HF_BASE } from '../utils/hf';

const cache = new Map();

export function useBrainData(subjectId) {
  const [data, setData] = useState(cache.get(subjectId) ?? null);
  const [loading, setLoading] = useState(!cache.has(subjectId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!subjectId) return;
    if (cache.has(subjectId)) {
      setData(cache.get(subjectId));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);

    fetch(`${HF_BASE}/${subjectId}/brain_data.json`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(d => {
        cache.set(subjectId, d);
        setData(d);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [subjectId]);

  return { data, loading, error };
}

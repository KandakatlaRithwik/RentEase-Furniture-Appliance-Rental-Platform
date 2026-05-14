import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useAsync() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async (asyncFn, options = {}) => {
    const {
      onSuccess,
      onError,
      successMsg,
      errorFallback = 'Something went wrong. Please try again.',
      showToast     = true,
    } = options;

    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      if (successMsg && showToast) toast.success(successMsg);
      onSuccess?.(result);
      return { data: result, error: null };
    } catch (err) {
      const msg = err?.response?.data?.message || errorFallback;
      setError(msg);
      if (showToast) toast.error(msg);
      onError?.(err);
      return { data: null, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute, reset: () => setError(null) };
}

export function usePageData(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload: load, setData };
}

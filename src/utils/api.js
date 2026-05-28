/**
 * Custom fetch with timeout and retry support
 */
export async function fetchWithRetry(url, options = {}, retries = 3, backoff = 1000) {
  const { timeout = 10000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    clearTimeout(id);
    
    if (!response.ok && retries > 0) {
      console.warn(`Fetch failed with status ${response.status}. Retrying in ${backoff}ms...`);
      await new Promise(res => setTimeout(res, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    
    return response;
  } catch (error) {
    clearTimeout(id);
    if (retries > 0) {
      console.warn(`Fetch error: ${error.message}. Retrying...`);
      await new Promise(res => setTimeout(res, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
}

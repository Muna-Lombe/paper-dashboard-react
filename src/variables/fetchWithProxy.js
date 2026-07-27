import { defaultHeaders, isDevMode } from "../api";

export default function fetchWithProxy(url, params = {}) {
  // 'https://corsproxy.io/?' + encodeURIComponent(url);//
  // const proxyUrl = `https://proxy.cors.sh/${url}`;
  try {
    return fetch(url, {
      ...params,
      headers: {
        ...defaultHeaders,
        ...params.headers,
        ...(isDevMode ? { "x-api-key": import.meta.env.VITE_X_API_KEY } : {}),
      },
    });
  } catch (error) {
    console.log("Error proxy fetching", error.message);
  }
}

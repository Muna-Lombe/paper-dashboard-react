
import { setupCache } from 'axios-cache-adapter';
import axios from 'axios';

// Create cache adapter instance
const cache = setupCache({
  maxAge: 15 * 60 * 1000, // Cache for 15 minutes
  exclude: {
    // Don't cache requests with query parameters that should be dynamic
    query: false
  },
  key: req => {
    // Generate key based on url and data for POST requests
    const serialized = req.data ? JSON.stringify(req.data) : '';
    return `${req.url}${serialized}`;
  }
});

// Create cached axios instance
const axiosCache = axios.create({
  adapter: cache.adapter
});

export default axiosCache;

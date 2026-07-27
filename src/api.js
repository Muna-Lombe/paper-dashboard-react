const baseApiUrl = import.meta.env.VITE_API_URL;
const wsUrl = import.meta.env.VITE_WS_URL;
const apiKey = import.meta.env.VITE_X_API_KEY;

export const isDevMode = ["true", "1", "yes"].includes(
  String(import.meta.env.VITE_DEV_MODE || "").toLowerCase()
);

export const DEV_USER = {
  userId: "dev00001",
};

const jsonHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/** Headers for API calls. In dev mode, includes x-api-key. */
export const defaultHeaders = {
  ...jsonHeaders,
  ...(isDevMode && apiKey ? { "x-api-key": apiKey } : {}),
};

function headersToObject(headers) {
  if (!headers) return {};
  if (typeof headers.forEach === "function") {
    const obj = {};
    headers.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
  return { ...headers };
}

function resolveUrl(url, params) {
  const full =
    /^https?:\/\//i.test(url)
      ? url
      : `${baseApiUrl}${url.startsWith("/") ? "" : "/"}${url}`;

  if (!params || Object.keys(params).length === 0) return full;

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    search.append(key, String(value));
  });

  const qs = search.toString();
  if (!qs) return full;
  return `${full}${full.includes("?") ? "&" : "?"}${qs}`;
}

function buildBody(data, headers) {
  if (data === undefined || data === null) {
    return { body: undefined, headers };
  }

  if (typeof FormData !== "undefined" && data instanceof FormData) {
    const next = { ...headers };
    delete next["Content-Type"];
    delete next["content-type"];
    return { body: data, headers: next };
  }

  if (typeof data === "string" || data instanceof Blob || data instanceof ArrayBuffer) {
    return { body: data, headers };
  }

  return { body: JSON.stringify(data), headers };
}

/**
 * Axios-like error: callers can use error.response?.data / error.response?.status
 */
export class ApiError extends Error {
  constructor(message, response, config) {
    super(message);
    this.name = "ApiError";
    this.response = response;
    this.config = config;
  }
}

/**
 * Core fetch wrapper with axios-compatible methods and response shape:
 * { data, status, statusText, headers, config }
 */
async function request(method, url, data, config = {}) {
  const {
    headers: configHeaders = {},
    params,
    withCredentials = true,
    signal,
  } = config;

  const mergedHeaders = {
    ...defaultHeaders,
    ...configHeaders,
  };

  const { body, headers } = buildBody(data, mergedHeaders);
  const resolvedUrl = resolveUrl(url, params);
  const upperMethod = method.toUpperCase();

  const response = await fetch(resolvedUrl, {
    method: upperMethod,
    headers,
    body: upperMethod === "GET" || upperMethod === "HEAD" ? undefined : body,
    credentials: withCredentials ? "include" : "same-origin",
    signal,
  });

  const responseHeaders = headersToObject(response.headers);
  const contentType = response.headers.get("content-type") || "";
  let responseData;

  if (response.status === 204) {
    responseData = null;
  } else if (contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }

  const axiosLikeResponse = {
    data: responseData,
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    config: { method, url: resolvedUrl, data, ...config },
  };

  if (!response.ok) {
    const message =
      (responseData && (responseData.message || responseData.msg)) ||
      response.statusText ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, axiosLikeResponse, axiosLikeResponse.config);
  }

  return axiosLikeResponse;
}

/**
 * Axios-shaped client used as the base for all endpoint helpers.
 */
export const api = {
  request(config = {}) {
    const { method = "get", url, data, ...rest } = config;
    return request(method, url, data, rest);
  },
  get(url, config) {
    return request("GET", url, undefined, config);
  },
  delete(url, config) {
    return request("DELETE", url, undefined, config);
  },
  head(url, config) {
    return request("HEAD", url, undefined, config);
  },
  options(url, config) {
    return request("OPTIONS", url, undefined, config);
  },
  post(url, data, config) {
    return request("POST", url, data, config);
  },
  put(url, data, config) {
    return request("PUT", url, data, config);
  },
  patch(url, data, config) {
    return request("PATCH", url, data, config);
  },
};

function bindEndpointMethods(url, baseHeaders) {
  const withHeaders = (config = {}) => ({
    ...config,
    headers: {
      ...baseHeaders,
      ...config.headers,
    },
  });

  return {
    url,
    headers: { ...baseHeaders },
    get: (config) => api.get(url, withHeaders(config)),
    delete: (config) => api.delete(url, withHeaders(config)),
    head: (config) => api.head(url, withHeaders(config)),
    options: (config) => api.options(url, withHeaders(config)),
    post: (data, config) => api.post(url, data, withHeaders(config)),
    put: (data, config) => api.put(url, data, withHeaders(config)),
    patch: (data, config) => api.patch(url, data, withHeaders(config)),
    request: (config = {}) =>
      api.request({
        url,
        ...withHeaders(config),
        method: config.method || "get",
        data: config.data,
      }),
  };
}

/** Build a static endpoint that uses `api` as its base fetch. */
const endpoint = (path) =>
  bindEndpointMethods(`${baseApiUrl}${path}`, { ...defaultHeaders });

/** Build a dynamic endpoint factory (e.g. by id). */
const dynamicEndpoint = (pathFn) => (...args) => endpoint(pathFn(...args));

export const endpoints = {
  bot: {
    socketUrl: `${wsUrl}/api/bot`,
  },

  paperDashApi: {
    authenticateUser: endpoint("/api/scraper/getUserInfo"),
    getBook: endpoint("/api/scraper/getbook"),
    validateUrl: endpoint("/api/scraper/validate-url"),
    copyCourse: endpoint("/api/scraper/copy-course"),
  },

  auth: {
    login: endpoint("/api/auth/login"),
    register: endpoint("/api/auth/register"),
    onboarding: endpoint("/api/auth/onboarding"),
    verifyEmail: endpoint("/api/auth/verify-email"),
    resendVerification: endpoint("/api/auth/resend-verification"),
    logout: endpoint("/api/auth/logout"),
    forgotPassword: endpoint("/api/auth/forgot-password"),
    resetPassword: endpoint("/api/auth/reset-password"),
  },

  user: {
    profile: {
      get: endpoint("/api/user/profile"),
      update: endpoint("/api/user/profile"),
      password: {
        update: endpoint("/api/user/password"),
      },
      delete: endpoint("/api/user/profile"),
    },
  },

  dashboard: {
    summary: endpoint("/api/dashboard/summary"),
    calendarEvents: endpoint("/api/dashboard/calendar-events"),
    studentRequests: {
      get: endpoint("/api/dashboard/student-requests"),
      approve: dynamicEndpoint((id) => `/api/dashboard/student-requests/${id}/approve`),
      reject: dynamicEndpoint((id) => `/api/dashboard/student-requests/${id}/reject`),
    },
  },

  schedule: {
    save: endpoint("/api/schedule"),
    get: endpoint("/api/schedule"),
  },

  courses: {
    create: endpoint("/api/courses"),
    get: dynamicEndpoint((courseId) => `/api/courses/${courseId}`),
    update: dynamicEndpoint((courseId) => `/api/courses/${courseId}`),
    delete: dynamicEndpoint((courseId) => `/api/courses/${courseId}`),
    blocks: {
      add: dynamicEndpoint((courseId) => `/api/courses/${courseId}/blocks`),
      update: dynamicEndpoint(
        (courseId, blockId) => `/api/courses/${courseId}/blocks/${blockId}`
      ),
      delete: dynamicEndpoint(
        (courseId, blockId) => `/api/courses/${courseId}/blocks/${blockId}`
      ),
    },
    corrections: {
      add: dynamicEndpoint((courseId) => `/api/courses/${courseId}/corrections`),
      update: dynamicEndpoint(
        (courseId, correctionId) =>
          `/api/courses/${courseId}/corrections/${correctionId}`
      ),
      delete: dynamicEndpoint(
        (courseId, correctionId) =>
          `/api/courses/${courseId}/corrections/${correctionId}`
      ),
    },
  },

  integrations: {
    get: endpoint("/api/integrations"),
    add: endpoint("/api/integrations"),
    update: dynamicEndpoint((id) => `/api/integrations/${id}`),
    delete: dynamicEndpoint((id) => `/api/integrations/${id}`),
  },

  assistant: {
    tools: endpoint("/api/assistant/tools"),
    process: endpoint("/api/assistant/process"),
  },

  telegram: {
    auth: endpoint("/api/telegram/auth"),
    /** @deprecated prefer endpoints.telegram.auth.url */
    get authUrl() {
      return `${baseApiUrl}/api/telegram/auth`;
    },
  },

  telegramBot: {
    registerRequest: endpoint("/api/telegram/register-request"),
    approveRequest: endpoint("/api/telegram/approve-request"),
    rejectRequest: endpoint("/api/telegram/reject-request"),
  },
};

export default api;

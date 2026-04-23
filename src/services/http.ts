export type PaginationResponse<T> = {
  message: string;
  error: unknown;
  statusCode: number;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
};

export type Response<T> = {
  message: string;
  error: unknown;
  statusCode: number;
  data: T;
};

type HttpOptions = RequestInit & {
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

function isBrowser() {
  return typeof window !== 'undefined';
}

function getAccessToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem('accessToken');
}

function getRefreshToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem('refreshToken');
}

async function refreshTokens(endpoint: string) {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) return false;

    const refreshUrl = `${endpoint}/auth/refresh`;

    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    if (!response.ok) return false;

    type RefreshTokensApiResponsePartial = {
      data?: {
        accessToken?: string;
        refreshToken?: string;
      };
    };

    const json = (await response.json()) as RefreshTokensApiResponsePartial;

    // Backend trả về `data.accessToken` và `data.refreshToken`.
    const newAccessToken = json.data?.accessToken;
    const newRefreshToken = json.data?.refreshToken;

    if (newAccessToken && newRefreshToken) {
      window.localStorage.setItem('accessToken', newAccessToken);
      window.localStorage.setItem('refreshToken', newRefreshToken);
      return true;
    }

    return false;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

function ensureAuthorizationHeader(inputInit?: RequestInit, options?: { force?: boolean; skipAuth?: boolean }): RequestInit {
  if (!isBrowser()) return inputInit ?? {};

  const headers = new Headers(inputInit?.headers);
  const force = options?.force ?? false;
  const skipAuth = options?.skipAuth ?? false;
  if (!skipAuth && (force || !headers.has('Authorization'))) {
    const accessToken = getAccessToken();
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return { ...inputInit, headers };
}

async function readErrorMessage(response: globalThis.Response) {
  const fallbackMessage = `Request failed with status ${response.status}`;
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    const text = await response.text().catch(() => '');
    return text || fallbackMessage;
  }

  const error = (await response.json().catch(() => ({}))) as { message?: string };
  return error.message ?? fallbackMessage;
}

export async function http<T>(input: RequestInfo | URL, init?: HttpOptions): Promise<T> {
  const endpoint = import.meta.env.VITE_ENDPOINT_API;

  let url = input;

  if (typeof input === 'string' && input.startsWith('/')) {
    url = `${endpoint}${input}`;
  } else if (typeof input === 'string' && !input.startsWith('http')) {
    url = `${endpoint}${input}`;
  }

  const requestInit = ensureAuthorizationHeader(init, {
    skipAuth: init?.skipAuth,
  });
  const response = await fetch(url, requestInit);

  if (!response.ok) {
    // Tự refresh token khi bị 401 (tránh gọi lại /auth/refresh).
    const requestUrlString = typeof url === 'string' ? url : url.toString();
    const isRefreshEndpoint = requestUrlString.includes('/auth/refresh');

    if (response.status === 401 && !isRefreshEndpoint && !init?.skipRefresh) {
      const didRefresh = await refreshTokens(endpoint);
      if (didRefresh) {
        // Force overwrite Authorization header because `init` may still contain an expired token.
        const retriedInit = ensureAuthorizationHeader(init, {
          force: true,
          skipAuth: init?.skipAuth,
        });
        const retriedResponse = await fetch(url, retriedInit);
        if (!retriedResponse.ok) {
          throw new Error(await readErrorMessage(retriedResponse));
        }
        return (await retriedResponse.json()) as T;
      }
    }

    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as T;
}

/** Giống `http` nhưng trả `null` khi server trả 404 (dùng cho GET `/patients/me` khi chưa có hồ sơ). */
export async function httpAllow404<T>(input: RequestInfo | URL, init?: HttpOptions): Promise<T | null> {
  const endpoint = import.meta.env.VITE_ENDPOINT_API;

  let url = input;

  if (typeof input === 'string' && input.startsWith('/')) {
    url = `${endpoint}${input}`;
  } else if (typeof input === 'string' && !input.startsWith('http')) {
    url = `${endpoint}${input}`;
  }

  const requestInit = ensureAuthorizationHeader(init, {
    skipAuth: init?.skipAuth,
  });
  let response = await fetch(url, requestInit);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const requestUrlString = typeof url === 'string' ? url : url.toString();
    const isRefreshEndpoint = requestUrlString.includes('/auth/refresh');

    if (response.status === 401 && !isRefreshEndpoint && !init?.skipRefresh) {
      const didRefresh = await refreshTokens(endpoint);
      if (didRefresh) {
        const retriedInit = ensureAuthorizationHeader(init, {
          force: true,
          skipAuth: init?.skipAuth,
        });
        response = await fetch(url, retriedInit);
        if (response.status === 404) {
          return null;
        }
        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }
        return (await response.json()) as T;
      }
    }

    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as T;
}

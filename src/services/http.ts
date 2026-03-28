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

function ensureAuthorizationHeader(inputInit?: RequestInit, options?: { force?: boolean }): RequestInit {
  if (!isBrowser()) return inputInit ?? {};

  const headers = new Headers(inputInit?.headers);
  const force = options?.force ?? false;
  if (force || !headers.has('Authorization')) {
    const accessToken = getAccessToken();
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return { ...inputInit, headers };
}

export async function http<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const endpoint = import.meta.env.VITE_ENDPOINT_API;

  let url = input;

  if (typeof input === 'string' && input.startsWith('/')) {
    url = `${endpoint}${input}`;
  } else if (typeof input === 'string' && !input.startsWith('http')) {
    url = `${endpoint}${input}`;
  }

  const requestInit = ensureAuthorizationHeader(init);
  const response = await fetch(url, requestInit);

  if (!response.ok) {
    // Tự refresh token khi bị 401 (tránh gọi lại /auth/refresh).
    const requestUrlString = typeof url === 'string' ? url : url.toString();
    const isRefreshEndpoint = requestUrlString.includes('/auth/refresh');

    if (response.status === 401 && !isRefreshEndpoint) {
      const didRefresh = await refreshTokens(endpoint);
      if (didRefresh) {
        // Force overwrite Authorization header because `init` may still contain an expired token.
        const retriedInit = ensureAuthorizationHeader(init, {
          force: true,
        });
        const retriedResponse = await fetch(url, retriedInit);
        if (!retriedResponse.ok) {
          throw new Error(`Request failed with status ${retriedResponse.status}`);
        }
        return (await retriedResponse.json()) as T;
      }
    }

    const error = await response.json();
    throw new Error(error.message);
  }

  return (await response.json()) as T;
}

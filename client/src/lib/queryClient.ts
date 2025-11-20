import { QueryClient, QueryFunction, type QueryKey } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function buildRequestUrl(queryKey: QueryKey): string {
  if (typeof queryKey === "string") {
    return queryKey;
  }

  if (!Array.isArray(queryKey)) {
    return String(queryKey ?? "");
  }

  const searchParams = new URLSearchParams();
  const pathSegments: string[] = [];
  let absoluteBase = "";

  for (const segment of queryKey) {
    if (segment === undefined || segment === null || segment === "") {
      continue;
    }

    if (typeof segment === "object" && !Array.isArray(segment)) {
      for (const [key, value] of Object.entries(segment)) {
        if (value === undefined || value === null || value === "") {
          continue;
        }

        if (Array.isArray(value)) {
          value.forEach((entry) => {
            if (entry !== undefined && entry !== null && entry !== "") {
              searchParams.append(key, String(entry));
            }
          });
        } else {
          searchParams.append(key, String(value));
        }
      }
      continue;
    }

    const value = Array.isArray(segment) ? segment.join("/") : String(segment);
    if (!value) {
      continue;
    }

    if (!absoluteBase && value.startsWith("http")) {
      absoluteBase = value.replace(/\/$/, "");
    } else {
      pathSegments.push(value);
    }
  }

  let path = pathSegments.join("/");

  if (absoluteBase) {
    const normalizedPath = path.replace(/^\/*/, "");
    path = normalizedPath ? `${absoluteBase}/${normalizedPath}` : absoluteBase;
  } else if (path && !path.startsWith("/")) {
    path = `/${path}`;
  }

  const paramsString = searchParams.toString();
  if (paramsString) {
    path += path.includes("?") ? `&${paramsString}` : `?${paramsString}`;
  }

  return path || "/";
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: RequestInit,
): Promise<Response> {
  const isFormData = data instanceof FormData;
  
  const computedBody = data !== undefined 
    ? (isFormData ? data : JSON.stringify(data))
    : options?.body;

  // For FormData, we must NOT set headers - browser auto-generates Content-Type with boundary
  // For other data, merge default JSON headers with any custom headers
  const fetchOptions: RequestInit = {
    ...options,
    method,
    body: computedBody,
    credentials: "include",
  };

  if (!isFormData) {
    const defaultHeaders: HeadersInit = data ? { "Content-Type": "application/json" } : {};
    fetchOptions.headers = {
      ...defaultHeaders,
      ...(options?.headers || {}),
    };
  }

  const res = await fetch(url, fetchOptions);

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const requestUrl = buildRequestUrl(queryKey);
    const res = await fetch(requestUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

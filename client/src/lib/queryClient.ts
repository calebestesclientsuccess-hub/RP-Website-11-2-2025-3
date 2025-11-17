import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
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
    const res = await fetch(queryKey.join("/") as string, {
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

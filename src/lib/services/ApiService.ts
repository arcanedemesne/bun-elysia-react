import { StatusCodes } from "http-status-codes";

import { apiPrefix, authPrefix, checkRoute, refreshRoute } from "@/lib/constants";
import { ApiError, ResponseError } from "@/lib/types";

export class ApiService {
  get = async <T>(url: string) => {
    return await apiFetch<T>(url);
  };

  post = async <T>(url: string, request?: object) => {
    return await apiFetch<T>(url, {
      method: "POST",
      body: JSON.stringify(request),
    });
  };

  put = async <T>(url: string, request?: object) => {
    return await apiFetch<T>(url, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  };

  delete = async <T>(url: string, request?: object) => {
    return await apiFetch<T>(url, {
      method: "DELETE",
      body: JSON.stringify(request),
    });
  };
}

const apiFetch = async <T>(url: string, options: RequestInit = {}): Promise<T | any> => {
  let response = await fetch(url, options);

  if (response.status === StatusCodes.UNAUTHORIZED && response.url.endsWith(checkRoute)) {
    await refreshToken();
    response = await fetch(url, options); // Retry
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = (await response.json()) as ResponseError;
    } catch {
      throw new ApiError({
        status: response.status,
        statusText: response.statusText,
        message: "could not parse error",
      });
    }
    console.error(errorData);
    throw new ApiError(errorData);
  }

  if (options.method === "DELETE") return response;

  return response.json && (await response.json());
};

const refreshToken = async (): Promise<void> => {
  const response = await fetch(`${apiPrefix}/${authPrefix}/${refreshRoute}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      statusText: response.statusText,
      message: "Failed to refresh token",
    });
  }
};

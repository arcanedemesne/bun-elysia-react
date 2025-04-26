import { apiPrefix, authPrefix, refreshRoute } from "../../constants";

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public message: string,
  ) {
    super(message);
  }
}

export const apiFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<any> => {
  let response = await fetch(url, options);

  if (response.status === 401) {
    await refreshToken();
    response = await fetch(url, options); // Retry
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (error: unknown) {
      throw new ApiError(
        response.status,
        response.statusText,
        "could not parse error",
      );
    }
    throw new ApiError(
      response.status,
      response.statusText,
      errorData?.errorMessage,
    );
  }

  if (options.method === "POST" || options.method === "DELETE") return response;

  return await response.json();
};

const refreshToken = async (): Promise<void> => {
  const response = await fetch(`${apiPrefix}/${authPrefix}/${refreshRoute}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.statusText,
      "Failed to refresh token",
    );
  }
};

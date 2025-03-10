import {
  apiPrefix,
  authPrefix,
  loginRoute,
  refreshRoute,
} from "../../constants";

async function apiFetch(url: string, options: RequestInit = {}) {
  let response = await fetch(url, options);

  if (response.status === 401) {
    try {
      await refreshToken();
      response = await fetch(url, options); // Retry
    } catch (refreshError) {
      //location.href = `${loginRoute}`;
      throw refreshError;
    }
  }

  if (!response.ok) {
    throw new Error((await response.json()).error);
  }

  if (options.method === "POST" || options.method === "DELETE") return response;

  return await response.json();
}

async function refreshToken() {
  const response = await fetch(`${apiPrefix}/${authPrefix}/${refreshRoute}`, {
    method: "POST",
  });

  if (!response.ok) {
    //location.href = `${loginRoute}`;
    throw new Error("Failed to refresh token");
  }
}

export { apiFetch };

import { useEffect, useState } from "react";

import { apiPrefix, authPrefix, checkRoute, loginRoute } from "@/lib/constants";

import { apiFetch } from "@/api";

export const useAuthCheck = () => {
  const [authenticated, setAuthenticated] = useState<boolean | undefined>(
    undefined,
  );

  const checkAuth = async () => {
    try {
      const { authorized } = await apiFetch(
        `/${apiPrefix}/${authPrefix}/${checkRoute}`,
      );
      setAuthenticated(authorized);
    } catch (error) {
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    if (authenticated === false) {
      location.href = `${loginRoute}`; // should navigate, but there's a race condition with user state in server
      //navigate(`${loginRoute}`);
    }

    const interval = setInterval(async () => {
      await checkAuth();
    }, 30 * 1000); // check every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [authenticated]);
};

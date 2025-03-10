import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPrefix, authPrefix, checkRoute, loginRoute } from "../../constants";

const useAuthCheck = () => {
  const queryClient = useQueryClient();

  const { isPending, data, refetch } = useQuery({
    queryKey: ["loginCheck"],
    queryFn: () =>
      fetch(`/${apiPrefix}/${authPrefix}/${checkRoute}`).then((res) =>
        res.json()
      ),
    refetchOnWindowFocus: false, // Prevents refetching on window focus
    enabled: true, // make sure that the query is enabled.
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30 * 1000); // check every 30 seconds

    const { authenticated } = data || { authenticated: undefined };

    if (authenticated !== undefined && !authenticated && !isPending) {
      location.href = `${loginRoute}`; // should navigate, but there's a race condition with user state in server
      //navigate(`${loginRoute}`);
    }

    return () => {
      queryClient.invalidateQueries({ queryKey: ["loginCheck"] });
      queryClient.refetchQueries({ queryKey: ["loginCheck"] });
      clearInterval(interval);
    };
  }, [refetch, data, queryClient]);
};

export default useAuthCheck;
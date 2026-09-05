import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { createActor } from "@/backend";

const ACTOR_QUERY_KEY = "actor";

/**
 * Builds the fetch-based Backend client (see src/backend.ts) and exposes it
 * with the same { actor, isFetching } shape the rest of the app expects.
 * No ICP agent, no Internet Identity -- just a plain HTTP client.
 */
export function useActor() {
  const queryClient = useQueryClient();
  const actorQuery = useQuery({
    queryKey: [ACTOR_QUERY_KEY],
    queryFn: async () => createActor(),
    staleTime: Number.POSITIVE_INFINITY,
    enabled: true,
  });

  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
      });
      queryClient.refetchQueries({
        predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
  };
}

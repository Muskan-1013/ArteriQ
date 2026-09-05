import { createActorWithConfig } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { createActor } from "@/backend";

const ACTOR_QUERY_KEY = "actor";

/**
 * Local replacement for `@caffeineai/core-infrastructure`'s `useActor`.
 *
 * The platform `useActor` internally calls `useInternetIdentity()`, which
 * throws "InternetIdentityProvider is not present" unless the tree is wrapped
 * in `InternetIdentityProvider`. ArteriQ uses a custom email + password auth
 * system (no Internet Identity), so it never mounts that provider. This hook
 * builds the same unauthenticated actor via `createActorWithConfig` — the
 * exact code path the platform hook uses when no II identity is present — but
 * without depending on the InternetIdentityProvider context.
 */
export function useActor() {
  const queryClient = useQueryClient();
  const actorQuery = useQuery({
    queryKey: [ACTOR_QUERY_KEY],
    queryFn: async () => createActorWithConfig(createActor),
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

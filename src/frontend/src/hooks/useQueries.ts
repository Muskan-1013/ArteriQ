import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { RiskReport, SessionToken } from "@/backend";
import { useActor } from "@/hooks/useActor";

/**
 * Shared React Query hooks for the ArteriQ backend. Every backend operation
 * goes through these hooks so the real actor remains the production data layer.
 *
 * Authentication (signup / login / logout / getCurrentUser) is handled by the
 * `useAuth` hook, which owns the session token lifecycle.
 */

export function useSchema() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["schema"],
    queryFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.schema();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useExecuteQuery() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (qJson: string) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.execute(qJson);
    },
  });
}

export function useGetMyReports(token: SessionToken | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myReports", token],
    queryFn: async () => {
      if (!actor || !token) throw new Error("Backend is not ready");
      const result = await actor.getMyReports(token);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    enabled: !!actor && !isFetching && !!token,
  });
}

export function useSaveReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      report,
    }: {
      token: SessionToken;
      report: RiskReport;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.saveReport(token, report);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myReports"] });
    },
  });
}

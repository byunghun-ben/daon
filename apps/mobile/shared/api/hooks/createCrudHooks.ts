import type { QueryKey } from "@tanstack/react-query";

// Helper to create standard query keys
export function createQueryKeys(resource: string): {
  all: QueryKey;
  lists: () => QueryKey;
  list: (params: unknown) => QueryKey;
  details: () => QueryKey;
  detail: (id: string) => QueryKey;
} {
  return {
    all: [resource],
    lists: () => [...[resource], "list"],
    list: (params: unknown) => [...[resource], "list", params],
    details: () => [...[resource], "detail"],
    detail: (id: string) => [...[resource], "detail", id],
  };
}

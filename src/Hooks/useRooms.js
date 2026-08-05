"use client";
import { useQuery } from "@tanstack/react-query";
import { getRooms } from "@/lib/api";

export const useRooms = (params = {}) => {
  const queryKey = ["rooms", JSON.stringify(params)];
  return useQuery({
    queryKey,
    queryFn: async () => {
      const json = await getRooms(params);
      return {
        rooms: Array.isArray(json?.data) ? json.data : [],
        total: json?.total || 0,
        page: json?.page || 1,
        limit: json?.limit || 9,
        totalPages: json?.totalPages || 1,
      };
    },
    staleTime: 30 * 1000,
  });
};

"use client";
import { useQuery } from "@tanstack/react-query";
import { getRoom } from "@/lib/api";

export const useRoom = (roomId) =>
  useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const json = await getRoom(roomId);
      if (!json?.success) throw new Error(json?.message || "Room not found");
      return json.data;
    },
    enabled: Boolean(roomId),
    staleTime: 60 * 1000,
  });

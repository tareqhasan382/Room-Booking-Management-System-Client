"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createReview, deleteReview, getReviews, updateReview } from "@/lib/api";

export const useReviews = (roomId) =>
  useQuery({
    queryKey: ["reviews", roomId],
    queryFn: async () => {
      const json = await getReviews(roomId);
      return Array.isArray(json?.data) ? json.data : [];
    },
    enabled: Boolean(roomId),
    staleTime: 60 * 1000,
  });

export const useCreateReview = (token) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createReview(payload, token),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["room", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

export const useUpdateReview = (token) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roomId, payload }) => updateReview(id, payload, token),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["room", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

export const useDeleteReview = (token) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roomId }) => deleteReview(id, token),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["room", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

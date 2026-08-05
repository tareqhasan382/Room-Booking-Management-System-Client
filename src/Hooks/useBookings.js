"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelBooking,
  createBooking,
  getBookings,
  payBooking,
} from "@/lib/api";

export const useBookings = (token) =>
  useQuery({
    queryKey: ["bookings", token],
    queryFn: async () => {
      const json = await getBookings(token);
      if (!json?.success) throw new Error(json?.message || "Failed to load bookings");
      return Array.isArray(json?.data) ? json.data : [];
    },
    enabled: Boolean(token),
    staleTime: 30 * 1000,
  });

export const useCreateBooking = (token) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createBooking(payload, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

export const useCancelBooking = (token) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => cancelBooking(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

export const usePayBooking = (token) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => payBooking(id, payload, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["allBookings"] });
    },
  });
};

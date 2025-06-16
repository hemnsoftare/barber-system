import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { AvailabilityData } from "../CreateBarberDashboardpage";
import { Barber, BarberWithServices } from "../type";
import {
  addDayOff,
  addServiceToBarber,
  deleteBarber,
  getAllBarbersWithResolvedServices,
  getBarberById,
  getBarbers,
  removeServiceFromBarber,
  updateAvailability,
  updateBarber,
  updateBarberProfile,
} from "../actionBarber";

export const COLLECTION_NAME = "barbers";
export const QUERY_KEY = ["barbers"];
const BARBERS_WITH_SERVICES_QUERY_KEY = ["barbers-with-services"];

// React Query hooks
export const useAddDayOff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addDayOff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barbersWithAvailability"] });
    },
  });
};

export const useUpdateAvailability = () => {
  return useMutation({
    mutationFn: ({
      data,
      barberId,
    }: {
      data: AvailabilityData[];
      barberId: string;
    }) => updateAvailability({ data, barberId }),

    onError: (error) => {
      console.error("Failed to update availability", error);
    },
  });
};
export const useUpdateBarberProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBarberProfile,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["barber", variables.barberId],
      });
      queryClient.invalidateQueries({ queryKey: ["barbers"] });
      queryClient.invalidateQueries({ queryKey: ["barbers-with-services"] });
    },
  });
};
export const useAddServiceToBarber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addServiceToBarber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};
export const useRemoveServiceFromBarber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeServiceFromBarber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};
export const useGetBarbers = (): UseQueryResult<Barber[], Error> => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getBarbers,
    staleTime: 5 * 60 * 1000, // ✅ Add this!
  });
};
export const useGetBarbersWithServices = (): UseQueryResult<
  BarberWithServices[],
  Error
> => {
  return useQuery({
    queryKey: BARBERS_WITH_SERVICES_QUERY_KEY,
    queryFn: async () => await getAllBarbersWithResolvedServices(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateBarber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBarber,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteBarber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBarber,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useGetBarberById = (
  barberId?: string
): UseQueryResult<Barber, Error> => {
  return useQuery({
    queryKey: ["barber", barberId],
    queryFn: () => getBarberById(barberId!),
    enabled: !!barberId, // only fetch if ID is provided
    staleTime: 5 * 60 * 1000,
  });
};
// Optional combined hook
export const useBarbers = () => {
  const getQuery = useGetBarbers();
  const update = useUpdateBarber();
  const del = useDeleteBarber();
  const barbersWithservices = useGetBarbersWithServices();
  const addService = useAddServiceToBarber();
  const removeService = useRemoveServiceFromBarber();
  return {
    barbers: getQuery.data || [],
    isLoading: getQuery.isLoading,
    isError: getQuery.isError,
    error: getQuery.error,
    refetch: getQuery.refetch,

    barbersWithServices: barbersWithservices.data || [],
    isLoadingbarbersWithServices: barbersWithservices.isLoading,
    isErrorBarbersWithServices: barbersWithservices.isError,
    errorBarbersWithServices: barbersWithservices.error,
    refetchBarbersWithServices: barbersWithservices.refetch,

    addServiceToBarber: addService.mutate,
    addServiceToBarberAsync: addService.mutateAsync,
    isAddingService: addService.isPending,
    addServiceError: addService.error,

    removeServiceToBarber: removeService.mutate,
    removeServiceToBarberAsync: removeService.mutateAsync,
    isremoveingService: removeService.isPending,
    removeServiceError: removeService.error,

    updateBarber: update.mutate,
    updateBarberAsync: update.mutateAsync,
    isUpdating: update.isPending,
    updateError: update.error,

    deleteBarber: del.mutate,
    deleteBarberAsync: del.mutateAsync,
    isDeleting: del.isPending,
    deleteError: del.error,
  };
};

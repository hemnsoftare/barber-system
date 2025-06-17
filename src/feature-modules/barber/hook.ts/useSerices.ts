import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  getServices,
  createService,
  deleteService,
  updateService,
} from "../actionServices";
import { Service } from "../type";

export const COLLECTION_NAME = "services";
const QUERY_KEY = ["services"];

// Firebase operations

// Get all services hook
export const useGetServices = (
  limt?: number
): UseQueryResult<Service[], Error> => {
  return useQuery({
    queryKey: ["services", limt],
    queryFn: () => getServices({ limt }),
    staleTime: 5 * 60 * 1000,
  });
};

// Create service hook
export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => {
      console.error("Error creating service:", error);
    },
  });
};

// Update service hook
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => {
      console.error("Error updating service:", error);
    },
  });
};

// Delete service hook
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => {
      console.error("Error deleting service:", error);
    },
  });
};

// Combined hook (optional - for convenience)
export const useServices = () => {
  const getServicesQuery = useGetServices();
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();

  return {
    // Query data
    services: getServicesQuery.data || [],
    isLoading: getServicesQuery.isLoading,
    isError: getServicesQuery.isError,
    error: getServicesQuery.error,
    refetch: getServicesQuery.refetch,

    // Create mutation
    createService: createServiceMutation.mutate,
    createServiceAsync: createServiceMutation.mutateAsync,
    isCreating: createServiceMutation.isPending,
    createError: createServiceMutation.error,

    // Update mutation
    updateService: updateServiceMutation.mutate,
    updateServiceAsync: updateServiceMutation.mutateAsync,
    isUpdating: updateServiceMutation.isPending,
    updateError: updateServiceMutation.error,

    // Delete mutation
    deleteService: deleteServiceMutation.mutate,
    deleteServiceAsync: deleteServiceMutation.mutateAsync,
    isDeleting: deleteServiceMutation.isPending,
    deleteError: deleteServiceMutation.error,
  };
};

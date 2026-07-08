import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../lib/api';
import { Property } from './useProperties';

export const SAVED_KEYS = {
  list: ['saved', 'properties'] as const,
};

export function useSavedProperties() {
  return useQuery({
    queryKey: SAVED_KEYS.list,
    queryFn: () => apiGet<Property[]>('/users/saved-properties'),
  });
}

export function useSaveProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) =>
      apiPost('/users/save-property', { propertyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SAVED_KEYS.list,
      });
    },
  });
}

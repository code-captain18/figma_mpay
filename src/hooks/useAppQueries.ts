import {
  apiGetAssistantProfile,
  apiGetDashboardData,
  apiGetProfile,
  apiGetResellerProducts,
  apiGetTransactions,
  apiGetUserProducts,
  apiGetWalletBalances,
  apiListAssistants,
} from '@/api';
import { useAuth } from '@/store/auth.store';
import { mapApiAssistant } from '@/utils/mappers';
import { useQuery } from '@tanstack/react-query';

export const QK = {
  dashboard: (start: string, end: string) => ['dashboard', start, end] as const,
  walletBalances: ['walletBalances'] as const,
  profile: (isAssistant: boolean, email: string) => ['profile', isAssistant, email] as const,
  resellerProducts: (isAssistant: boolean, accountId: string) =>
    ['resellerProducts', isAssistant, accountId] as const,
  userProducts: ['userProducts'] as const,
  assistants: (search: string) => ['assistants', search] as const,
  recentTransactions: (limit: number) => ['recent-transactions', limit] as const,
  transactions: ['transactions'] as const,
};

export function useDashboardData(startDate: string, endDate: string) {
  return useQuery({
    queryKey: QK.dashboard(startDate, endDate),
    queryFn: () => apiGetDashboardData(startDate, endDate),
  });
}

export function useWalletBalances() {
  return useQuery({
    queryKey: QK.walletBalances,
    queryFn: apiGetWalletBalances,
    staleTime: 0,
    // keep last-known balance in cache for 10 min so offline never shows GHS 0
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useProfileData() {
  const { user } = useAuth();
  const isAsst = user?.accountType?.toLowerCase() === 'assistant';
  const email = user?.email ?? user?.username ?? '';

  return useQuery({
    queryKey: QK.profile(isAsst, email),
    queryFn: () =>
      (isAsst ? apiGetAssistantProfile(email) : apiGetProfile()) as Promise<
        Awaited<ReturnType<typeof apiGetProfile>> | Awaited<ReturnType<typeof apiGetAssistantProfile>>
      >,
    enabled: !!email,
  });
}

export function useResellerProducts() {
  const { user } = useAuth();
  const isAsst = user?.accountType?.toLowerCase() === 'assistant';
  const accountId = user?.accountId ?? '';

  return useQuery({
    queryKey: QK.resellerProducts(isAsst, accountId),
    queryFn: () => apiGetResellerProducts(isAsst, accountId),
    enabled: !!accountId,
  });
}

// Wallet products (e.g. MOMOCASHIN/MOMOCASHOUT) assigned to the signed-in account
export function useUserProducts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: QK.userProducts,
    queryFn: apiGetUserProducts,
    enabled: !!user,
  });
}

export function useAssistantsList(search: string) {
  const { user } = useAuth();
  const isAsst = user?.accountType?.toLowerCase() === 'assistant';

  return useQuery({
    queryKey: QK.assistants(search),
    queryFn: async () => {
      const { assistants: list } = await apiListAssistants(1, 50, search || undefined);
      return list.map(mapApiAssistant);
    },
    enabled: !isAsst,
  });
}

export function useRecentTransactions(limit = 5) {
  const { user } = useAuth();
  const isAssistant = user?.accountType?.toLowerCase() === 'assistant';
  return useQuery({
    queryKey: QK.recentTransactions(limit),
    queryFn: () => apiGetTransactions({ source: 'recent', page: 1, pageSize: limit }, isAssistant),
    enabled: !!user,
  });
}

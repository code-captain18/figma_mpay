import { useCallback, useEffect, useState } from 'react';
import * as service from './service';
import type { FavoriteRecipient } from './types';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRecipient[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const data = await service.loadFavorites();
    setFavorites(data);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const add = useCallback(
    async (data: Pick<FavoriteRecipient, 'name' | 'phoneNumber' | 'label'>) => {
      const fav = await service.addFavorite(data);
      setFavorites(prev => [...prev, fav]);
      return fav;
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await service.removeFavorite(id);
    setFavorites(prev => prev.filter(f => f.id !== id));
  }, []);

  const update = useCallback(
    async (id: string, data: Partial<Pick<FavoriteRecipient, 'name' | 'label'>>) => {
      await service.updateFavorite(id, data);
      setFavorites(prev =>
        prev.map(f => (f.id === id ? { ...f, ...data } : f)),
      );
    },
    [],
  );

  const isFavorite = useCallback(
    (phone: string) => favorites.some(f => f.phoneNumber === phone),
    [favorites],
  );

  const getFavoriteByPhone = useCallback(
    (phone: string) => favorites.find(f => f.phoneNumber === phone) ?? null,
    [favorites],
  );

  return { favorites, loading, add, remove, update, isFavorite, getFavoriteByPhone, reload };
}

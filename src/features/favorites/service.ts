import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FavoriteRecipient } from './types';

const KEY = 'mpay_favorites';

export async function loadFavorites(): Promise<FavoriteRecipient[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FavoriteRecipient[]) : [];
  } catch {
    return [];
  }
}

async function persist(favorites: FavoriteRecipient[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(favorites));
}

export async function addFavorite(
  data: Pick<FavoriteRecipient, 'name' | 'phoneNumber' | 'label'>,
): Promise<FavoriteRecipient> {
  const favorites = await loadFavorites();
  const now = new Date().toISOString();
  const favorite: FavoriteRecipient = {
    ...data,
    id: `fav_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now,
    updatedAt: now,
  };
  await persist([...favorites, favorite]);
  return favorite;
}

export async function removeFavorite(id: string): Promise<void> {
  const favorites = await loadFavorites();
  await persist(favorites.filter(f => f.id !== id));
}

export async function updateFavorite(
  id: string,
  data: Partial<Pick<FavoriteRecipient, 'name' | 'label'>>,
): Promise<void> {
  const favorites = await loadFavorites();
  await persist(
    favorites.map(f =>
      f.id === id ? { ...f, ...data, updatedAt: new Date().toISOString() } : f,
    ),
  );
}

export async function clearFavorites(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

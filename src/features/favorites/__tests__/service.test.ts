import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addFavorite,
  loadFavorites,
  removeFavorite,
  updateFavorite,
} from '../service';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockGet = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const mockSet = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockResolvedValue(null);
  mockSet.mockResolvedValue(undefined as any);
});

describe('loadFavorites', () => {
  test('returns empty array when nothing stored', async () => {
    const result = await loadFavorites();
    expect(result).toEqual([]);
  });

  test('returns parsed favorites from storage', async () => {
    const stored = [
      { id: 'fav_1', name: 'John', phoneNumber: '0241234567', createdAt: '', updatedAt: '' },
    ];
    mockGet.mockResolvedValue(JSON.stringify(stored));
    const result = await loadFavorites();
    expect(result).toEqual(stored);
  });

  test('returns empty array on parse error', async () => {
    mockGet.mockResolvedValue('invalid json{');
    const result = await loadFavorites();
    expect(result).toEqual([]);
  });
});

describe('addFavorite', () => {
  test('adds a favorite and persists it', async () => {
    const fav = await addFavorite({ name: 'John Mensah', phoneNumber: '0241234567' });
    expect(fav.name).toBe('John Mensah');
    expect(fav.phoneNumber).toBe('0241234567');
    expect(fav.id).toMatch(/^fav_/);
    expect(mockSet).toHaveBeenCalledTimes(1);
  });

  test('appends to existing favorites', async () => {
    const existing = [
      { id: 'fav_0', name: 'Ama', phoneNumber: '0201234567', createdAt: '', updatedAt: '' },
    ];
    mockGet.mockResolvedValue(JSON.stringify(existing));

    const fav = await addFavorite({ name: 'Kwame', phoneNumber: '0551234567' });
    const persisted = JSON.parse((mockSet.mock.calls[0][1] as string));
    expect(persisted).toHaveLength(2);
    expect(persisted[1].name).toBe('Kwame');
  });

  test('stores optional label', async () => {
    const fav = await addFavorite({ name: 'Mom', phoneNumber: '0241234567', label: 'Family' });
    expect(fav.label).toBe('Family');
  });
});

describe('removeFavorite', () => {
  test('removes a favorite by id', async () => {
    const existing = [
      { id: 'fav_1', name: 'John', phoneNumber: '0241234567', createdAt: '', updatedAt: '' },
      { id: 'fav_2', name: 'Ama', phoneNumber: '0201234567', createdAt: '', updatedAt: '' },
    ];
    mockGet.mockResolvedValue(JSON.stringify(existing));

    await removeFavorite('fav_1');
    const persisted = JSON.parse((mockSet.mock.calls[0][1] as string));
    expect(persisted).toHaveLength(1);
    expect(persisted[0].id).toBe('fav_2');
  });

  test('is a no-op for non-existent id', async () => {
    mockGet.mockResolvedValue(JSON.stringify([]));
    await removeFavorite('non_existent');
    expect(mockSet).toHaveBeenCalledWith(expect.any(String), '[]');
  });
});

describe('updateFavorite', () => {
  test('updates name and label', async () => {
    const existing = [
      { id: 'fav_1', name: 'John', phoneNumber: '0241234567', createdAt: 't1', updatedAt: 't1' },
    ];
    mockGet.mockResolvedValue(JSON.stringify(existing));

    await updateFavorite('fav_1', { name: 'John Mensah', label: 'Friend' });
    const persisted = JSON.parse((mockSet.mock.calls[0][1] as string));
    expect(persisted[0].name).toBe('John Mensah');
    expect(persisted[0].label).toBe('Friend');
    expect(persisted[0].updatedAt).not.toBe('t1');
  });
});

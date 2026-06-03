import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecentKey = 'presenting' | 'mainTitle' | 'flyerInfo' | 'address' | 'dj' | 'host';

const MAX_RECENT = 5;

export async function saveRecentItem(key: RecentKey, value: string): Promise<void> {
  if (!value.trim()) return;
  try {
    const raw = await AsyncStorage.getItem(`recent_${key}`);
    let items: string[] = raw ? JSON.parse(raw) : [];
    items = items.filter(i => i.toLowerCase() !== value.trim().toLowerCase());
    items = [value.trim(), ...items].slice(0, MAX_RECENT);
    await AsyncStorage.setItem(`recent_${key}`, JSON.stringify(items));
  } catch {
    try { await AsyncStorage.removeItem(`recent_${key}`); } catch {}
  }
}

export async function getRecentItems(key: RecentKey): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(`recent_${key}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    try { await AsyncStorage.removeItem(`recent_${key}`); } catch {}
    return [];
  }
}

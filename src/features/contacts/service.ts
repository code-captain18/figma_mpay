import {
  Contact,
  ContactField,
  ContactsSortOrder,
  getPermissionsAsync,
  PermissionStatus,
  requestPermissionsAsync,
} from 'expo-contacts';
import { normalizeGhanaPhone } from '@/utils/phone';
import type { ContactPermissionStatus, NormalizedContact } from './types';

export async function getContactPermissionStatus(): Promise<ContactPermissionStatus> {
  const { status } = await getPermissionsAsync();
  if (status === PermissionStatus.GRANTED) return 'granted';
  if (status === PermissionStatus.DENIED) return 'denied';
  return 'undetermined';
}

export async function requestContactPermission(): Promise<ContactPermissionStatus> {
  const { status } = await requestPermissionsAsync();
  return status === PermissionStatus.GRANTED ? 'granted' : 'denied';
}

export async function loadContacts(): Promise<NormalizedContact[]> {
  const data = await Contact.getAllDetails(
    [ContactField.FULL_NAME, ContactField.PHONES],
    { sortOrder: ContactsSortOrder.GivenName },
  );

  const results: NormalizedContact[] = [];

  for (const c of data) {
    if (!c.fullName) continue;

    const phoneNumbers = (c.phones ?? [])
      .filter(p => !!p.number)
      .map(p => {
        const normalized = normalizeGhanaPhone(p.number!);
        return normalized
          ? { label: p.label ?? 'Mobile', number: normalized, raw: p.number! }
          : null;
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    if (phoneNumbers.length === 0) continue;

    results.push({
      id: c.id,
      name: c.fullName,
      phoneNumbers,
    });
  }

  return results;
}

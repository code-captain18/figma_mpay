import { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';
import * as service from './service';
import type { NormalizedContact } from './types';

export type ContactsState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'ready'; contacts: NormalizedContact[] }
  | { phase: 'denied' }
  | { phase: 'error'; message: string };

export function useContactPicker() {
  const [state, setState] = useState<ContactsState>({ phase: 'idle' });

  const openPicker = useCallback(async () => {
    setState({ phase: 'loading' });
    try {
      let status = await service.getContactPermissionStatus();

      if (status === 'undetermined') {
        status = await service.requestContactPermission();
      }

      if (status === 'denied') {
        setState({ phase: 'denied' });
        return;
      }

      const contacts = await service.loadContacts();
      setState({ phase: 'ready', contacts });
    } catch (e: any) {
      setState({ phase: 'error', message: e?.message ?? 'Could not load contacts' });
    }
  }, []);

  const dismiss = useCallback(() => {
    setState({ phase: 'idle' });
  }, []);

  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  const showPermissionAlert = useCallback(() => {
    Alert.alert(
      'Contacts Access Needed',
      'Contacts access is needed to choose a recipient from your phone.',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Open Settings', onPress: openSettings },
      ],
    );
  }, [openSettings]);

  return { state, openPicker, dismiss, openSettings, showPermissionAlert };
}

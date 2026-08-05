import Constants from 'expo-constants';
import type * as NotificationsNS from 'expo-notifications';
import { Platform } from 'react-native';
import type { TxRecord } from '@/types';

// expo-notifications crashes at import time in Expo Go (SDK 53+); lazy-require to avoid it
const isExpoGo = Constants.appOwnership === 'expo';

function getNotifications(): typeof NotificationsNS {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-notifications');
}

const STATUS_TITLES: Record<string, string> = {
  success: 'Transaction Successful ✓',
  pending: 'Transaction Pending',
  failed: 'Transaction Failed',
};

const SVC_LABELS: Record<string, string> = {
  airtime: 'Airtime',
  data: 'Data Bundle',
  fibre: 'Fibre',
  bulk: 'Bulk SMS',
  momo: 'Mobile Money',
};

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (isExpoGo) return null;

  const N = getNotifications();

  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('transactions', {
      name: 'Transaction Alerts',
      importance: N.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await N.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await N.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  return null; // Expo push token requires a physical device + project ID
}

export async function scheduleTransactionNotification(tx: TxRecord): Promise<void> {
  if (isExpoGo) return;

  const N = getNotifications();
  const svc = SVC_LABELS[tx.type] ?? 'Transaction';
  const title = STATUS_TITLES[tx.status] ?? 'Transaction Update';
  const body =
    tx.status === 'success'
      ? `${svc} of GH₵${tx.amount.toFixed(2)} to ${tx.phone} was successful.`
      : tx.status === 'failed'
        ? `${svc} of GH₵${tx.amount.toFixed(2)} to ${tx.phone} failed. Please try again.`
        : `${svc} of GH₵${tx.amount.toFixed(2)} is being processed.`;

  await N.scheduleNotificationAsync({
    content: { title, body, data: { txId: tx.id } },
    trigger: null,
  });
}

export function setupNotificationListeners(
  onNotification?: (notification: NotificationsNS.Notification) => void,
  onResponse?: (response: NotificationsNS.NotificationResponse) => void,
): () => void {
  if (isExpoGo) return () => {};

  const N = getNotifications();
  const notifSub = N.addNotificationReceivedListener(onNotification ?? (() => {}));
  const respSub = N.addNotificationResponseReceivedListener(onResponse ?? (() => {}));
  return () => {
    notifSub.remove();
    respSub.remove();
  };
}

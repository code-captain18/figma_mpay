import { useFavorites } from '@/features/favorites/hooks';
import type { FavoriteRecipient } from '@/features/favorites/types';
import { Colors, Radius, T } from '@/theme';
import { Heart, Star } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── SaveFavoriteRow ──────────────────────────────────────────────────────────

interface SaveFavoriteRowProps {
  phoneNumber: string;
}

export function SaveFavoriteRow({ phoneNumber }: SaveFavoriteRowProps) {
  const { isFavorite, getFavoriteByPhone, add, remove } = useFavorites();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');

  const saved = isFavorite(phoneNumber);
  const existing = getFavoriteByPhone(phoneNumber);

  const handlePress = useCallback(() => {
    if (saved && existing) {
      Alert.alert(
        'Remove Favorite',
        `Remove ${existing.name} from your favorites?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => remove(existing.id),
          },
        ],
      );
    } else {
      setName('');
      setLabel('');
      setModalVisible(true);
    }
  }, [saved, existing, remove]);

  const handleSave = useCallback(async () => {
    const trimName = name.trim();
    if (!trimName) return;
    await add({ name: trimName, phoneNumber, label: label.trim() || undefined });
    setModalVisible(false);
  }, [name, phoneNumber, label, add]);

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={S.row}
        accessibilityRole="button"
        accessibilityLabel={saved ? 'Saved to Favorites' : 'Save as Favorite'}
      >
        {saved ? (
          <>
            <Star size={16} color={Colors.warning} fill={Colors.warning} />
            <Text style={S.savedText}>Saved to Favorites</Text>
          </>
        ) : (
          <>
            <Heart size={16} color={Colors.textLight} />
            <Text style={S.saveText}>Save as Favorite</Text>
          </>
        )}
      </TouchableOpacity>

      <SaveModal
        visible={modalVisible}
        phoneNumber={phoneNumber}
        name={name}
        label={label}
        onChangeName={setName}
        onChangeLabel={setLabel}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

// ─── Save Modal ───────────────────────────────────────────────────────────────

function SaveModal({
  visible,
  phoneNumber,
  name,
  label,
  onChangeName,
  onChangeLabel,
  onSave,
  onClose,
}: {
  visible: boolean;
  phoneNumber: string;
  name: string;
  label: string;
  onChangeName: (v: string) => void;
  onChangeLabel: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const canSave = name.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={S.overlay}>
        <Pressable style={S.scrim} onPress={onClose} />
        <View style={[S.dialog, { marginBottom: insets.bottom + 24 }]}>
          <View style={S.dialogHeader}>
            <Star size={18} color={Colors.warning} fill={Colors.warning} />
            <Text style={S.dialogTitle}>Save as Favorite</Text>
          </View>

          <Text style={S.phoneDisplay}>{phoneNumber}</Text>

          <Text style={S.fieldLabel}>NAME *</Text>
          <TextInput
            style={S.input}
            placeholder="e.g. John Mensah"
            placeholderTextColor={Colors.pale}
            value={name}
            onChangeText={onChangeName}
            autoFocus
            returnKeyType="next"
          />

          <Text style={[S.fieldLabel, { marginTop: 12 }]}>LABEL (OPTIONAL)</Text>
          <TextInput
            style={S.input}
            placeholder="e.g. Mom, Business, Shop"
            placeholderTextColor={Colors.pale}
            value={label}
            onChangeText={onChangeLabel}
            returnKeyType="done"
            onSubmitEditing={canSave ? onSave : undefined}
          />

          <View style={S.dialogActions}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={[S.dialogBtn, S.cancelBtn]}>
              <Text style={S.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSave}
              disabled={!canSave}
              activeOpacity={0.8}
              style={[S.dialogBtn, S.saveBtn, !canSave && { opacity: 0.45 }]}
            >
              <Text style={S.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── EditFavoriteModal ────────────────────────────────────────────────────────

interface EditFavoriteModalProps {
  visible: boolean;
  favorite: FavoriteRecipient | null;
  onSave: (id: string, name: string, label: string) => void;
  onClose: () => void;
}

export function EditFavoriteModal({ visible, favorite, onSave, onClose }: EditFavoriteModalProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(favorite?.name ?? '');
  const [label, setLabel] = useState(favorite?.label ?? '');

  const handleSave = () => {
    if (!favorite || !name.trim()) return;
    onSave(favorite.id, name.trim(), label.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={S.overlay}>
        <Pressable style={S.scrim} onPress={onClose} />
        <View style={[S.dialog, { marginBottom: insets.bottom + 24 }]}>
          <View style={S.dialogHeader}>
            <Star size={18} color={Colors.warning} fill={Colors.warning} />
            <Text style={S.dialogTitle}>Edit Favorite</Text>
          </View>

          <Text style={S.phoneDisplay}>{favorite?.phoneNumber ?? ''}</Text>

          <Text style={S.fieldLabel}>NAME *</Text>
          <TextInput
            style={S.input}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
          />

          <Text style={[S.fieldLabel, { marginTop: 12 }]}>LABEL (OPTIONAL)</Text>
          <TextInput
            style={S.input}
            placeholder="e.g. Mom, Business"
            placeholderTextColor={Colors.pale}
            value={label}
            onChangeText={setLabel}
            returnKeyType="done"
          />

          <View style={S.dialogActions}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={[S.dialogBtn, S.cancelBtn]}>
              <Text style={S.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!name.trim()}
              activeOpacity={0.8}
              style={[S.dialogBtn, S.saveBtn, !name.trim() && { opacity: 0.45 }]}
            >
              <Text style={S.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  saveText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: Colors.textLight },
  savedText: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold', color: Colors.warning },

  overlay: { flex: 1, justifyContent: 'flex-end', padding: 20 },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(7,24,48,0.45)' },
  dialog: {
    backgroundColor: Colors.surface,
    borderRadius: Radius['2xl'],
    padding: 24,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dialogTitle: { ...T.headingSM, color: Colors.textPrimary },
  phoneDisplay: {
    ...T.bodyMD,
    color: Colors.textLight,
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: 'Urbanist_500Medium',
    color: Colors.textPrimary,
    backgroundColor: Colors.bg,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  dialogBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: Colors.bg,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cancelText: { ...T.bodyMD, fontFamily: 'Urbanist_600SemiBold', color: Colors.textSecondary },
  saveBtn: { backgroundColor: Colors.primary },
  saveBtnText: { ...T.bodyMD, fontFamily: 'Urbanist_700Bold', color: '#fff' },
});

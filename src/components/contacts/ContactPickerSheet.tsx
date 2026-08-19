import { useFavorites } from '@/features/favorites/hooks';
import type { FavoriteRecipient } from '@/features/favorites/types';
import type { NormalizedContact, ContactPhoneNumber } from '@/features/contacts/types';
import { Colors, Radius, Shadows, T } from '@/theme';
import { ghanaPhoneSchema } from '@/utils/phone';
import {
  ChevronRight,
  Search,
  Star,
  UserRound,
  X,
} from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactPickerSheetProps {
  visible: boolean;
  contacts: NormalizedContact[];
  onSelect: (phone: string) => void;
  onClose: () => void;
}

type SheetView = 'list' | 'numbers';

interface SectionItem {
  type: 'header' | 'contact';
  letter?: string;
  contact?: NormalizedContact;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildSections(contacts: NormalizedContact[]): SectionItem[] {
  const sorted = [...contacts].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );
  const items: SectionItem[] = [];
  let lastLetter = '';
  for (const c of sorted) {
    const first = Array.from(c.name)[0] ?? '#';
    const letter = /^[A-Za-zÀ-ÿ]/.test(first) ? first.toUpperCase() : '#';
    if (letter !== lastLetter) {
      items.push({ type: 'header', letter });
      lastLetter = letter;
    }
    items.push({ type: 'contact', contact: c });
  }
  return items;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FavoriteChip({
  fav,
  onPress,
}: {
  fav: FavoriteRecipient;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={S.favChip}>
      <View style={S.favAvatar}>
        <Text style={S.favAvatarText}>{fav.name[0]?.toUpperCase() ?? '?'}</Text>
      </View>
      <Text style={S.favName} numberOfLines={1}>{fav.name}</Text>
      <Text style={S.favPhone} numberOfLines={1}>{fav.phoneNumber}</Text>
    </TouchableOpacity>
  );
}

function ContactRow({
  contact,
  onPress,
}: {
  contact: NormalizedContact;
  onPress: () => void;
}) {
  const primary = contact.phoneNumbers[0];
  const hasMultiple = contact.phoneNumbers.length > 1;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={S.contactRow}>
      <View style={S.contactAvatar}>
        <Text style={S.contactAvatarText}>{contact.name[0]?.toUpperCase() ?? '?'}</Text>
      </View>
      <View style={S.contactInfo}>
        <Text style={S.contactName}>{contact.name}</Text>
        <Text style={S.contactPhone}>{primary.number}</Text>
      </View>
      {hasMultiple && <ChevronRight size={16} color={Colors.textLight} />}
    </TouchableOpacity>
  );
}

function NumberRow({
  phone,
  onPress,
}: {
  phone: ContactPhoneNumber;
  onPress: () => void;
}) {
  const isValid = ghanaPhoneSchema.safeParse(phone.number).success;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isValid}
      activeOpacity={0.7}
      style={[S.numberRow, !isValid && S.numberRowDisabled]}
    >
      <View style={S.numberInfo}>
        <Text style={S.numberLabel}>{phone.label}</Text>
        <Text style={[S.numberVal, !isValid && { color: Colors.textDisabled }]}>
          {phone.number}
        </Text>
      </View>
      {!isValid && (
        <Text style={S.invalidBadge}>Invalid</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── ContactPickerSheet ───────────────────────────────────────────────────────

export function ContactPickerSheet({
  visible,
  contacts,
  onSelect,
  onClose,
}: ContactPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const { favorites } = useFavorites();

  const [query, setQuery] = useState('');
  const [view, setView] = useState<SheetView>('list');
  const [selectedContact, setSelectedContact] = useState<NormalizedContact | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return contacts;
    const q = query.toLowerCase();
    return contacts.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.phoneNumbers.some(p => p.number.includes(q)),
    );
  }, [contacts, query]);

  const sections = useMemo(() => buildSections(filtered), [filtered]);

  const handleContactPress = useCallback((contact: NormalizedContact) => {
    if (contact.phoneNumbers.length === 1) {
      const num = contact.phoneNumbers[0].number;
      if (ghanaPhoneSchema.safeParse(num).success) {
        onSelect(num);
        setQuery('');
        setView('list');
        setSelectedContact(null);
        onClose();
      }
    } else {
      setSelectedContact(contact);
      setView('numbers');
    }
  }, [onSelect, onClose]);

  const handleFavPress = useCallback((fav: FavoriteRecipient) => {
    onSelect(fav.phoneNumber);
    setQuery('');
    setView('list');
    setSelectedContact(null);
    onClose();
  }, [onSelect, onClose]);

  const handleNumberSelect = useCallback((num: string) => {
    if (ghanaPhoneSchema.safeParse(num).success) {
      onSelect(num);
      setQuery('');
      setView('list');
      setSelectedContact(null);
      onClose();
    }
  }, [onSelect, onClose]);

  const handleClose = useCallback(() => {
    setQuery('');
    setView('list');
    setSelectedContact(null);
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={S.backdrop}>
        <Pressable style={S.scrim} onPress={handleClose} />
        <View style={[S.sheet, { paddingBottom: insets.bottom + 12 }]}>

          {/* Handle */}
          <View style={S.handleWrap}>
            <View style={S.handle} />
          </View>

          {/* Header */}
          <View style={S.header}>
            {view === 'numbers' ? (
              <TouchableOpacity onPress={() => setView('list')} style={S.backBtn} activeOpacity={0.7}>
                <ChevronRight size={18} color={Colors.primary} style={{ transform: [{ scaleX: -1 }] }} />
                <Text style={S.backText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={S.headerLeft}>
                <UserRound size={18} color={Colors.primary} />
                <Text style={S.headerTitle}>Select Contact</Text>
              </View>
            )}
            <TouchableOpacity onPress={handleClose} style={S.closeBtn} activeOpacity={0.7}>
              <X size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Number selection view */}
          {view === 'numbers' && selectedContact ? (
            <View style={{ flex: 1 }}>
              <View style={S.contactHeaderBig}>
                <View style={S.contactAvatarBig}>
                  <Text style={S.contactAvatarBigText}>
                    {selectedContact.name[0]?.toUpperCase() ?? '?'}
                  </Text>
                </View>
                <Text style={S.contactNameBig}>{selectedContact.name}</Text>
                <Text style={S.contactSubtitle}>Select a number</Text>
              </View>
              {selectedContact.phoneNumbers.map((p, i) => (
                <NumberRow key={i} phone={p} onPress={() => handleNumberSelect(p.number)} />
              ))}
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              {/* Search */}
              <View style={S.searchRow}>
                <Search size={16} color={Colors.textLight} style={S.searchIcon} />
                <TextInput
                  style={S.searchInput}
                  placeholder="Search by name or number"
                  placeholderTextColor={Colors.pale}
                  value={query}
                  onChangeText={setQuery}
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                />
              </View>

              {/* Favorites */}
              {favorites.length > 0 && !query && (
                <View style={S.favSection}>
                  <View style={S.favSectionHeader}>
                    <Star size={14} color={Colors.warning} fill={Colors.warning} />
                    <Text style={S.favSectionTitle}>Favorites</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}
                  >
                    {favorites.map(fav => (
                      <FavoriteChip key={fav.id} fav={fav} onPress={() => handleFavPress(fav)} />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Contacts list */}
              {contacts.length === 0 ? (
                <View style={S.empty}>
                  <UserRound size={40} color={Colors.textLight} />
                  <Text style={S.emptyTitle}>No contacts found</Text>
                  <Text style={S.emptyMsg}>
                    Your phone doesn&apos;t appear to have any contacts yet.
                  </Text>
                </View>
              ) : filtered.length === 0 ? (
                <View style={S.empty}>
                  <Search size={40} color={Colors.textLight} />
                  <Text style={S.emptyTitle}>No matching contacts</Text>
                  <Text style={S.emptyMsg}>Try another name or phone number.</Text>
                </View>
              ) : (
                <ScrollView
                  style={{ flex: 1 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {sections.map((item, index) =>
                    item.type === 'header' ? (
                      <Text key={`h-${item.letter}`} style={S.sectionLetter}>{item.letter}</Text>
                    ) : (
                      <ContactRow
                        key={`c-${item.contact?.id}-${index}`}
                        contact={item.contact!}
                        onPress={() => handleContactPress(item.contact!)}
                      />
                    )
                  )}
                </ScrollView>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,24,48,0.5)',
  },
  sheet: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius['3xl'],
    borderTopRightRadius: Radius['3xl'],
    maxHeight: '88%',
    minHeight: 300,
    ...Shadows.strong,
  },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.divider },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { ...T.headingSM, color: Colors.textPrimary },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { ...T.bodyMD, color: Colors.primary },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 14,
    paddingHorizontal: 12,
    backgroundColor: Colors.bg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: 'Urbanist_400Regular',
    color: Colors.textPrimary,
  },

  favSection: { marginBottom: 4 },
  favSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  favSectionTitle: {
    fontSize: 12,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.warning,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  favChip: {
    alignItems: 'center',
    width: 80,
    marginRight: 10,
  },
  favAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  favAvatarText: {
    fontSize: 16,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.warning,
  },
  favName: {
    fontSize: 11,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  favPhone: {
    fontSize: 10,
    fontFamily: 'Urbanist_400Regular',
    color: Colors.textLight,
    textAlign: 'center',
  },

  sectionLetter: {
    fontSize: 11,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.primary,
    backgroundColor: Colors.bg,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    fontSize: 14,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.primary,
  },
  contactInfo: { flex: 1 },
  contactName: {
    fontSize: 14,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 12,
    fontFamily: 'Urbanist_400Regular',
    color: Colors.textLight,
  },

  contactHeaderBig: { alignItems: 'center', paddingVertical: 24 },
  contactAvatarBig: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  contactAvatarBigText: {
    fontSize: 22,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.primary,
  },
  contactNameBig: {
    ...T.headingMD,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  contactSubtitle: { ...T.caption, color: Colors.textLight },

  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
  },
  numberRowDisabled: { opacity: 0.45 },
  numberInfo: { flex: 1 },
  numberLabel: {
    fontSize: 11,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  numberVal: {
    fontSize: 15,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.textPrimary,
  },
  invalidBadge: {
    fontSize: 11,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.error,
    backgroundColor: Colors.errorBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },

  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 8 },
  emptyTitle: { ...T.headingSM, color: Colors.textSecondary },
  emptyMsg: { ...T.bodyMD, color: Colors.textLight, textAlign: 'center' },
});

import { ContactPickerSheet } from '@/components/contacts/ContactPickerSheet';
import { SaveFavoriteRow } from '@/components/contacts/SaveFavoriteRow';
import { BundleGrid } from '@/components/services/BundleGrid';
import { GradHdr } from '@/components/services/GradHdr';
import { NetworkLogo } from '@/components/svg/NetworkLogo';
import { GRADIENTS } from '@/constants/services';
import { useContactPicker } from '@/features/contacts/hooks';
import { Colors } from '@/theme';
import type { SFState, SvcBundle } from '@/types';
import { ghanaPhoneSchema } from '@/utils/phone';
import { UserRound } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FL, SubmitBtn, frm, shr } from './ServiceFormPrimitives';

const C = Colors;
const G = GRADIENTS;

const TYPE_ORDER = ['FLEXI', 'FIXED'];
const TYPE_LABELS: Record<string, string> = { FLEXI: 'Flexi', FIXED: 'Fixed' };

export function DataForm({
    form, setForm, onNext, onBack, bundles,
}: {
    form: SFState;
    setForm: React.Dispatch<React.SetStateAction<SFState>>;
    onNext: () => void;
    onBack: () => void;
    bundles: SvcBundle[];
}) {
    const set = (k: keyof SFState, v: SFState[keyof SFState]) =>
        setForm(p => ({ ...p, [k]: v }));

    const categories = useMemo(() => {
        const seen = new Set<string>();
        const ordered: string[] = [];
        for (const t of TYPE_ORDER) {
            if (bundles.some(b => (b.bundleType ?? '').toUpperCase() === t)) {
                seen.add(t); ordered.push(t);
            }
        }
        for (const b of bundles) {
            const k = (b.bundleType ?? 'OTHER').toUpperCase();
            if (!seen.has(k)) { seen.add(k); ordered.push(k); }
        }
        return ordered;
    }, [bundles]);

    const [activeType, setActiveType] = useState<string>(() => categories[0] ?? '');
    const isFlexiTab = activeType === 'FLEXI';
    const isFixedTab = activeType === 'FIXED';

    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const fixedCategories = useMemo(() => {
        const seen = new Set<string>();
        const ordered: string[] = [];
        for (const b of bundles) {
            if ((b.bundleType ?? '').toUpperCase() !== 'FIXED') continue;
            const cat = b.category || 'Other';
            if (!seen.has(cat)) { seen.add(cat); ordered.push(cat); }
        }
        return ordered;
    }, [bundles]);

    const visibleBundles = useMemo(() => {
        if (isFixedTab) {
            if (!activeCategory) return [];
            return bundles.filter(b => (b.bundleType ?? '').toUpperCase() === 'FIXED' && (b.category || 'Other') === activeCategory);
        }
        return bundles.filter(b => (b.bundleType ?? 'OTHER').toUpperCase() === activeType);
    }, [bundles, activeType, isFixedTab, activeCategory]);

    const flexiNum = parseFloat(form.amount);
    const flexiMin = form.bundle?.priceMin ?? 0;
    const flexiMax = form.bundle?.priceMax ?? Infinity;
    const flexiTouched = form.amount !== '';
    const flexiValid = !isNaN(flexiNum) && flexiNum >= flexiMin && flexiNum <= flexiMax;

    const ok = !!form.phone && !!form.bundle && (!isFlexiTab || flexiValid);
    const { state: contactState, openPicker, dismiss, showPermissionAlert } = useContactPicker();

    const handleContactPress = useCallback(() => {
        if (contactState.phase === 'denied') showPermissionAlert();
        else openPicker();
    }, [contactState.phase, openPicker, showPermissionAlert]);
    const phoneValid = ghanaPhoneSchema.safeParse(form.phone.trim()).success;

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <GradHdr title="Data Bundle" onBack={onBack} gradient={G.wallet} />
            <ScrollView contentContainerStyle={frm.content} showsVerticalScrollIndicator={false}>
                <View style={[frm.banner, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                    <NetworkLogo id="mtn" size={28} />
                    <Text style={frm.bannerText}>MTN data bundles. Choose a plan below.</Text>
                </View>
                <FL label="RECIPIENT PHONE NUMBER *">
                    <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.border, borderRadius: 12, backgroundColor: C.bg }}>
                        <TextInput
                            keyboardType="phone-pad"
                            value={form.phone}
                            onChangeText={v => set('phone', v)}
                            placeholder="024XXXXXXX"
                            placeholderTextColor={C.pale}
                            style={[shr.input, { flex: 1, borderWidth: 0 }]}
                        />
                        <TouchableOpacity
                            onPress={handleContactPress}
                            activeOpacity={0.7}
                            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 4 }}
                            accessibilityRole="button"
                            accessibilityLabel="Choose from contacts"
                        >
                            {contactState.phase === 'loading'
                                ? <ActivityIndicator size="small" color={C.blue} />
                                : <UserRound size={18} color={C.blue} />}
                        </TouchableOpacity>
                    </View>
                    {phoneValid && (
                        <View style={{ marginTop: 6 }}>
                            <SaveFavoriteRow phoneNumber={form.phone.trim()} />
                        </View>
                    )}
                </FL>
                {categories.length > 1 && (
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                        {categories.map(type => {
                            const active = activeType === type;
                            return (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => { setActiveType(type); setActiveCategory(null); setForm(p => ({ ...p, bundle: null, amount: '' })); }}
                                    accessibilityRole="tab"
                                    accessibilityState={{ selected: active }}
                                    style={{
                                        paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20,
                                        borderWidth: 1.5,
                                        borderColor: active ? C.green : C.border,
                                        backgroundColor: active ? C.green + '14' : C.surface,
                                    }}
                                >
                                    <Text style={{ fontSize: 13, fontFamily: 'Urbanist_700Bold', color: active ? C.green : C.textMuted }}>
                                        {TYPE_LABELS[type] ?? type}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
                {isFixedTab && fixedCategories.length > 0 && (
                    <FL label="BUNDLE TYPE *">
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {fixedCategories.map(cat => {
                                const active = activeCategory === cat;
                                return (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => { setActiveCategory(cat); setForm(p => ({ ...p, bundle: null, amount: '' })); }}
                                        accessibilityRole="tab"
                                        accessibilityState={{ selected: active }}
                                        style={{
                                            paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                                            borderWidth: 1.5,
                                            borderColor: active ? C.green : C.border,
                                            backgroundColor: active ? C.green + '14' : C.surface,
                                        }}
                                    >
                                        <Text style={{ fontSize: 13, fontFamily: 'Urbanist_700Bold', color: active ? C.green : C.textMuted }}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </FL>
                )}
                {(!isFixedTab || activeCategory) && (
                    <FL label="SELECT BUNDLE *">
                        <BundleGrid
                            bundles={visibleBundles}
                            selected={form.bundle?.id ?? null}
                            accent={C.green}
                            onSelect={b => setForm(p => ({ ...p, bundle: b, amount: '' }))}
                        />
                    </FL>
                )}
                {isFlexiTab && form.bundle && (
                    <FL label={`AMOUNT  •  GHS ${flexiMin.toFixed(2)} – ${isFinite(flexiMax) ? flexiMax.toFixed(2) : '∞'}`}>
                        <TextInput
                            keyboardType="decimal-pad"
                            value={form.amount}
                            onChangeText={v => set('amount', v)}
                            placeholder={`e.g. ${flexiMin.toFixed(2)}`}
                            placeholderTextColor={C.pale}
                            style={[shr.input, flexiTouched && !flexiValid && { borderColor: '#E8334A' }]}
                        />
                        {flexiTouched && !flexiValid && (
                            <Text style={{ color: '#E8334A', fontSize: 12, fontFamily: 'Urbanist_500Medium', marginTop: 5, marginLeft: 2 }}>
                                Enter an amount between GHS {flexiMin.toFixed(2)} and GHS {isFinite(flexiMax) ? flexiMax.toFixed(2) : '∞'}
                            </Text>
                        )}
                    </FL>
                )}
                <SubmitBtn label="Review & Confirm" gradient={G.wallet} disabled={!ok} onPress={onNext} />
            </ScrollView>
            <ContactPickerSheet
                visible={contactState.phase === 'ready'}
                contacts={contactState.phase === 'ready' ? contactState.contacts : []}
                onSelect={(num) => { set('phone', num); dismiss(); }}
                onClose={dismiss}
            />
        </View>
    );
}

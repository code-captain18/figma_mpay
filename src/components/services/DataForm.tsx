import { BundleGrid } from '@/components/services/BundleGrid';
import { GradHdr } from '@/components/services/GradHdr';
import { NetworkLogo } from '@/components/svg/NetworkLogo';
import { GRADIENTS } from '@/constants/services';
import { Colors } from '@/theme';
import type { SFState, SvcBundle } from '@/types';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

    const visibleBundles = useMemo(
        () => bundles.filter(b => (b.bundleType ?? 'OTHER').toUpperCase() === activeType),
        [bundles, activeType],
    );

    const flexiNum = parseFloat(form.amount);
    const flexiMin = form.bundle?.priceMin ?? 0;
    const flexiMax = form.bundle?.priceMax ?? Infinity;
    const flexiTouched = form.amount !== '';
    const flexiValid = !isNaN(flexiNum) && flexiNum >= flexiMin && flexiNum <= flexiMax;

    const ok = !!form.phone && !!form.bundle && (!isFlexiTab || flexiValid);

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <GradHdr title="Data Bundle" onBack={onBack} gradient={G.wallet} />
            <ScrollView contentContainerStyle={frm.content} showsVerticalScrollIndicator={false}>
                <View style={[frm.banner, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                    <NetworkLogo id="mtn" size={28} />
                    <Text style={frm.bannerText}>MTN data bundles. Choose a plan below.</Text>
                </View>
                <FL label="RECIPIENT PHONE NUMBER *">
                    <TextInput
                        keyboardType="phone-pad"
                        value={form.phone}
                        onChangeText={v => set('phone', v)}
                        placeholder="024XXXXXXX"
                        placeholderTextColor={C.pale}
                        style={shr.input}
                    />
                </FL>
                {categories.length > 1 && (
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                        {categories.map(type => {
                            const active = activeType === type;
                            return (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => { setActiveType(type); setForm(p => ({ ...p, bundle: null, amount: '' })); }}
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
                <FL label="SELECT BUNDLE *">
                    <BundleGrid
                        bundles={visibleBundles}
                        selected={form.bundle?.id ?? null}
                        accent={C.green}
                        onSelect={b => setForm(p => ({ ...p, bundle: b, amount: '' }))}
                    />
                </FL>
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
        </View>
    );
}

import { Colors, FONT_FAMILY } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { height } = Dimensions.get('window');

const GRADIENT_COLORS = ['#4BAEE8', '#1878CE', '#052D6E'] as const;
const GRADIENT_START = { x: 0.15, y: 0 };
const GRADIENT_END = { x: 0.85, y: 1 };

interface Props {
    onDone: () => void;
}

export default function SplashScreenView({ onDone }: Props) {
    // ─── Animated values ────────────────────────────────────────────────────────
    const logoScale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const ringScale = useRef(new Animated.Value(0.4)).current;
    const ringOpacity = useRef(new Animated.Value(0)).current;
    const titleY = useRef(new Animated.Value(28)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const taglineY = useRef(new Animated.Value(18)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const pillsOpacity = useRef(new Animated.Value(0)).current;
    const pillsY = useRef(new Animated.Value(14)).current;

    // Loading dots
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    // Decorative circles
    const deco1 = useRef(new Animated.Value(0)).current;
    const deco2 = useRef(new Animated.Value(0)).current;
    const deco3 = useRef(new Animated.Value(0)).current;

    // Exit fade
    const screenOpacity = useRef(new Animated.Value(1)).current;

    // ─── Dot pulse helper ───────────────────────────────────────────────────────
    const pulseDot = (dot: Animated.Value, delay: number) =>
        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(dot, {
                    toValue: 1,
                    duration: 380,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(dot, {
                    toValue: 0.3,
                    duration: 380,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

    // ─── Entrance sequence ──────────────────────────────────────────────────────
    useEffect(() => {
        Animated.sequence([
            // 1. Decorative circles bloom in (staggered)
            Animated.stagger(120, [
                Animated.spring(deco1, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
                Animated.spring(deco2, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
                Animated.spring(deco3, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
            ]),
            // 2. Outer ring expands
            Animated.parallel([
                Animated.spring(ringScale, { toValue: 1, tension: 65, friction: 9, useNativeDriver: true }),
                Animated.timing(ringOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
            ]),
            // 3. Zap icon springs in
            Animated.parallel([
                Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
                Animated.timing(logoOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
            ]),
            // 4. "M-PAY" title slides up
            Animated.parallel([
                Animated.spring(titleY, { toValue: 0, tension: 70, friction: 9, useNativeDriver: true }),
                Animated.timing(titleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]),
            // 5. Tagline slides up
            Animated.parallel([
                Animated.spring(taglineY, { toValue: 0, tension: 70, friction: 9, useNativeDriver: true }),
                Animated.timing(taglineOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]),
            // 6. Feature pills slide up
            Animated.parallel([
                Animated.spring(pillsY, { toValue: 0, tension: 70, friction: 9, useNativeDriver: true }),
                Animated.timing(pillsOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]),
        ]).start(() => {
            // Start pulsing dots
            pulseDot(dot1, 0).start();
            pulseDot(dot2, 200).start();
            pulseDot(dot3, 400).start();

            // Hold for 1.2 s then fade out and call onDone
            setTimeout(() => {
                Animated.timing(screenOpacity, {
                    toValue: 0,
                    duration: 480,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }).start(() => onDone());
            }, 1200);
        });
    }, []);

    // ─── Render ─────────────────────────────────────────────────────────────────
    return (
        <Animated.View style={[styles.root, { opacity: screenOpacity }]}>

            {/* ── Gradient background ── */}
            <LinearGradient
                colors={GRADIENT_COLORS}
                start={GRADIENT_START}
                end={GRADIENT_END}
                style={StyleSheet.absoluteFill}
            />

            {/* ── Decorative circles ── */}
            <Animated.View
                style={[styles.deco, styles.deco1,
                { opacity: deco1, transform: [{ scale: deco1 }] }]}
            />
            <Animated.View
                style={[styles.deco, styles.deco2,
                { opacity: deco2, transform: [{ scale: deco2 }] }]}
            />
            <Animated.View
                style={[styles.deco, styles.deco3,
                { opacity: deco3, transform: [{ scale: deco3 }] }]}
            />

            {/* ── Centre content ── */}
            <View style={styles.content}>

                {/* Outer glow ring */}
                <Animated.View
                    style={[
                        styles.ring,
                        { opacity: ringOpacity, transform: [{ scale: ringScale }] },
                    ]}
                >
                    {/* Icon box */}
                    <Animated.View
                        style={[
                            styles.iconBox,
                            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
                        ]}
                    >
                        <LinearGradient
                            colors={['#4BAEE8', '#1878CE', '#052D6E']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.iconGrad}
                        >
                            <Zap size={38} color={Colors.white} fill={Colors.white} strokeWidth={0} />
                        </LinearGradient>
                    </Animated.View>
                </Animated.View>

                {/* App name */}
                <Animated.Text
                    style={[
                        styles.title,
                        { opacity: titleOpacity, transform: [{ translateY: titleY }] },
                    ]}
                >
                    M-PAY
                </Animated.Text>

                {/* Tagline */}
                <Animated.Text
                    style={[
                        styles.tagline,
                        { opacity: taglineOpacity, transform: [{ translateY: taglineY }] },
                    ]}
                >
                    Agent Banking Platform
                </Animated.Text>

                {/* Feature pills */}
                <Animated.View
                    style={[
                        styles.pillsRow,
                        { opacity: pillsOpacity, transform: [{ translateY: pillsY }] },
                    ]}
                >
                    {['Airtime', 'Data', 'MoMo', 'Fibre'].map((label) => (
                        <View key={label} style={styles.pill}>
                            <Text style={styles.pillText}>{label}</Text>
                        </View>
                    ))}
                </Animated.View>

                {/* Loading dots */}
                <View style={styles.dotsRow}>
                    {([dot1, dot2, dot3] as Animated.Value[]).map((dot, i) => (
                        <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
                    ))}
                </View>

            </View>

            {/* ── Footer ── */}
            <Animated.Text style={[styles.footer, { opacity: pillsOpacity }]}>
                Powered by M-PAY Financial Services
            </Animated.Text>

        </Animated.View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },

    // Decorative circles
    deco: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    deco1: { width: 320, height: 320, top: -80, right: -80 },
    deco2: { width: 220, height: 220, bottom: 60, left: -60 },
    deco3: {
        width: 140, height: 140,
        top: height * 0.35, right: -30,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },

    content: {
        alignItems: 'center',
    },

    // Outer glow ring — 136×136
    ring: {
        width: 136,
        height: 136,
        borderRadius: 68,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.22)',
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        shadowColor: '#4BAEE8',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 28,
        elevation: 16,
    },

    // Inner icon box — 96×96
    iconBox: {
        width: 96,
        height: 96,
        borderRadius: 48,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.35)',
    },
    iconGrad: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // "M-PAY"
    title: {
        fontFamily: FONT_FAMILY.extrabold,
        fontSize: 48,
        color: '#FFFFFF',
        letterSpacing: 10,
        marginBottom: 8,
        textShadowColor: 'rgba(7,24,48,0.4)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 8,
    },

    // "Agent Banking Platform"
    tagline: {
        fontFamily: FONT_FAMILY.medium,
        fontSize: 14,
        color: 'rgba(255,255,255,0.75)',
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        marginBottom: 28,
    },

    // Pill row
    pillsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 48,
    },
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
    },
    pillText: {
        fontFamily: FONT_FAMILY.semibold,
        fontSize: 11,
        color: 'rgba(255,255,255,0.88)',
        letterSpacing: 0.5,
    },

    // Loading dots
    dotsRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4BAEE8',
    },

    // Bottom credit line
    footer: {
        position: 'absolute',
        bottom: 44,
        fontFamily: FONT_FAMILY.regular,
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 0.5,
    },
});

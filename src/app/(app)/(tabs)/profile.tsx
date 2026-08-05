import type { ApiPermEntry, ApiPermissions, ProfileProduct } from '@/api';
import { apiAddAssistant, apiChangePassword, apiDeleteAssistant, apiEditAssistant, apiEditAssistantProfile, apiEditProfile, apiGetAssistantPermissions, apiGetAssistantProfile, apiGetProfile, apiListAssistants, apiSaveAssistantPermissions, apiVerifyPassword } from '@/api';
import { GradHdr } from '@/components/services/GradHdr';
import { PermMatrix } from '@/components/services/PermMatrix';
import { INIT_ASSISTANTS, makeEmptyPerms, PERM_SECTIONS } from '@/data';
import { useAuth } from '@/store/auth.store';
import { C, F, G } from '@/theme';
import type { Assistant, PermKey, PermMap, ProfileView } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Eye, EyeOff,
  FileText,
  HelpCircle,
  Key,
  LogOut,
  Package,
  Pencil,
  Shield, ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Modal,
  ScrollView, StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const ID_PROOF_LABELS: Record<string, string> = {
  GHANA_CARD: 'Ghana Card', VOTERS_ID: "Voter's ID",
  DRIVERS_LICENSE: "Driver's License", PASSPORT: 'Passport', SSNIT: 'SSNIT',
};
const ID_PROOF_TYPES = ['GHANA_CARD', 'VOTERS_ID', 'DRIVERS_LICENSE', 'PASSPORT', 'SSNIT'] as const;

function mapApiAssistant(a: { assistantId: string; firstname: string; lastname: string; email: string; phoneNumber: string; idProofType?: string; idNumber?: string; status: string; created_at?: string; resellerId?: string }): Assistant {
  return {
    id: a.assistantId, assistantId: a.assistantId,
    firstName: a.firstname ?? '', lastName: a.lastname ?? '',
    phoneNumber: a.phoneNumber ?? '', email: a.email ?? '',
    status: a.status === 'active' ? 'active' : 'inactive',
    permissions: makeEmptyPerms(),
    createdAt: a.created_at ?? new Date().toISOString(),
    idProofType: a.idProofType, idNumber: a.idNumber,
  };
}

function apiPermsToPermMap(apiPerms: ApiPermissions): PermMap {
  const pm = makeEmptyPerms();
  const get = (tab: string, mod: string) => apiPerms[tab]?.find(m => m.module === mod);
  const row = (m: ReturnType<typeof get>) => ({
    view: m?.can_view ?? false, create: m?.can_add ?? false,
    approve: m?.can_edit ?? false, export: m?.can_export ?? false, delete: m?.can_delete ?? false,
  });
  const airtime = get('Web Topup', 'Airtime Topup');
  const data = get('Web Topup', 'Data Bundle');
  const momo = get('Web Topup', 'Mobile Money Services');
  const reports = get('Reports', 'Transaction Report');
  pm['Airtime:purchase'] = row(airtime); pm['Airtime:bulk'] = row(airtime);
  pm['Data:purchase'] = row(data); pm['Data:bulk'] = row(data);
  pm['MoMo:send'] = row(momo); pm['MoMo:withdraw'] = row(momo);
  pm['Reports:transactions'] = row(reports); pm['Reports:sales'] = row(reports);
  return pm;
}

function permMapToApiPerms(perms: PermMap): ApiPermEntry[] {
  const e = (tab: string, module: string, key: string): ApiPermEntry => {
    const p = key ? perms[key] : null;
    return {
      tab, module, can_view: p?.view ?? false, can_add: p?.create ?? false,
      can_edit: p?.approve ?? false, can_delete: p?.delete ?? false, can_import: false, can_export: p?.export ?? false
    };
  };
  return [
    e('General', 'Dashboard', ''), e('General', 'My Profile', ''), e('General', 'Product Information', ''),
    e('Web Topup', 'Airtime Topup', 'Airtime:purchase'), e('Web Topup', 'Data Bundle', 'Data:purchase'),
    e('Web Topup', 'Fibre Bundle', ''), e('Web Topup', 'Bulk Topup', 'Airtime:bulk'),
    e('Web Topup', 'Mobile Money Services', 'MoMo:send'),
    e('API Topup', 'Airtime Topup', ''), e('API Topup', 'Data Bundle', ''),
    e('API Topup', 'Fibre Bundle', ''), e('API Topup', 'Mobile Money Services', ''),
    e('Reports', 'Transaction Report', 'Reports:transactions'),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ProfileScreen — state machine
// ─────────────────────────────────────────────────────────────────────────────
function ProfileScreen({ onLogout }: { onLogout: () => void }) {
  const { user, updateUser } = useAuth();
  const isAsst = user?.accountType?.toLowerCase() === 'assistant';

  const [view, setView] = useState<ProfileView>('home');
  const [assistants, setAssistants] = useState<Assistant[]>(INIT_ASSISTANTS);
  const [editingAsst, setEditingAsst] = useState<Assistant | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [products, setProducts] = useState<ProfileProduct[]>([]);
  const [canEdit, setCanEdit] = useState(true);

  // ── Edit Profile state ─────────────────────────────────────────────────────
  const [editForm, setEditForm] = useState({
    resellerid: '',
    accountName: '',
    companyName: '',
    firstName: user?.name?.split(' ')[0] ?? '',
    lastName: user?.name?.split(' ').slice(1).join(' ') ?? '',
    phoneNumber: user?.phone ?? '',
    email: user?.email ?? user?.username ?? '',
    address: '',
    ghanaCardNumber: '',
    taxId: '',
    salesExecutive: '',
    category: 'personal',
    status: 'active',
    createdAt: '',
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editDone, setEditDone] = useState(false);

  // ── Change Password state ──────────────────────────────────────────────────
  const [oldPwd, setOldPwd] = useState('');
  const [oldPwdVerified, setOldPwdVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [oldPwdError, setOldPwdError] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdDone, setPwdDone] = useState(false);

  // ── Assistant form state ───────────────────────────────────────────────────
  const [asstForm, setAsstForm] = useState({ firstName: '', lastName: '', phoneNumber: '', email: '', idProofType: 'GHANA_CARD', idNumber: '' });
  const [asstPerms, setAsstPerms] = useState<PermMap>(makeEmptyPerms());
  const [asstSaving, setAsstSaving] = useState(false);
  const [asstError, setAsstError] = useState('');
  const [assistantsLoading, setAssistantsLoading] = useState(false);
  const [assistantsSearch, setAssistantsSearch] = useState('');

  const loadAssistants = useCallback(async (search?: string) => {
    if (isAsst) return;
    setAssistantsLoading(true);
    try {
      const { assistants: list } = await apiListAssistants(1, 50, search || undefined);
      setAssistants(list.map(mapApiAssistant));
    } catch {
      // gracefully fail — keep previous list
    } finally {
      setAssistantsLoading(false);
    }
  }, [isAsst]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (isAsst) {
          const email = user?.email ?? user?.username ?? '';
          const { profile: p, products: prods } = await apiGetAssistantProfile(email);
          if (cancelled) return;
          setCanEdit(false);
          setEditForm(prev => ({
            ...prev,
            resellerid: p.resellerId,
            firstName: p.firstName ?? '',
            lastName: p.lastname ?? '',
            phoneNumber: p.phoneNumber ?? '',
            email: p.email ?? '',
            status: p.status ?? 'active',
            createdAt: p.createdAt ?? '',
          }));
          setProducts(prods.filter(pr => pr.prodCode !== 'MMONEYDB'));
        } else {
          const { profile: p, products: prods } = await apiGetProfile();
          if (cancelled) return;
          setEditForm(prev => ({
            ...prev,
            resellerid: p.resellerid ?? '',
            accountName: p.accountName ?? '',
            companyName: p.companyName ?? '',
            firstName: p.firstName ?? '',
            lastName: p.lastName ?? '',
            phoneNumber: p.phoneNumber ?? '',
            email: p.email ?? '',
            address: p.address ?? '',
            ghanaCardNumber: p.ghanaCardNum ?? '',
            taxId: p.taxId ?? '',
            salesExecutive: p.salesExecutiveId ?? '',
            category: p.category ?? 'personal',
            status: p.status ?? 'active',
            createdAt: p.createdAt ?? '',
          }));
          setProducts(prods.filter(pr => pr.prodCode !== 'MMONEYDB'));
        }
      } catch {
        // gracefully fall back to auth-store values
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isAsst, user?.email, user?.username]);

  // debounced assistant search
  useEffect(() => {
    if (view !== 'assistants') return;
    const t = setTimeout(() => loadAssistants(assistantsSearch), 500);
    return () => clearTimeout(t);
  }, [assistantsSearch]);

  const resetPwd = () => {
    setOldPwd(''); setOldPwdVerified(false); setOldPwdError('');
    setNewPwd(''); setConfirmPwd(''); setPwdDone(false);
    setShowOld(false); setShowNew(false); setShowConf(false);
  };

  // ── HOME VIEW ──────────────────────────────────────────────────────────────
  if (view === 'home') return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <GradHdr title="Profile" />
      <ScrollView contentContainerStyle={home.content} showsVerticalScrollIndicator={false}>

        {/* ── Avatar card ── */}
        <View style={home.avatarCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <LinearGradient
              colors={G.avatar.colors as [string, string]}
              start={G.avatar.start}
              end={G.avatar.end}
              style={home.avatar}
            >
              <Text style={home.avatarText}>
                {(user?.name ?? user?.username ?? 'U').split(' ').map((n: string) => n[0]).join('')}
              </Text>
            </LinearGradient>

            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={home.userName}>{user?.name ?? user?.username ?? ''}</Text>
              <Text style={home.userEmail} numberOfLines={1}>{user?.email ?? user?.username ?? ''}</Text>
              <View style={home.accountBadge}>
                <View style={home.onlineDot} />
                <Text style={home.accountBadgeText}>{user?.accountId ?? ''}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setView('edit')}
              style={home.editIconBtn}
              activeOpacity={0.8}
            >
              <Pencil size={14} color={C.blue} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Stats strip ── */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'e Top-Up', value: `GH\u20B5${Number(user?.eTopupBalance ?? 0).toFixed(2)}`, color: C.blue },
            { label: 'MoMo', value: `GH\u20B5${Number(user?.momoBalance ?? 0).toFixed(2)}`, color: C.green },
            { label: 'Status', value: editForm.status || '—', color: editForm.status === 'active' ? C.green : editForm.status === 'suspended' ? C.red : C.orange },
          ].map(s => (
            <View key={s.label} style={home.statCard}>
              <Text style={[home.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={home.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Account actions menu ── */}
        <View style={home.menuCard}>
          {[
            {
              Icon: Pencil,
              iconBg: 'rgba(24,120,206,0.08)',
              color: C.blue,
              label: 'Edit Profile',
              sub: 'Update your account info',
              onPress: () => setView('edit'),
              hidden: !canEdit,
            },
            {
              Icon: Key,
              iconBg: 'rgba(124,92,252,0.08)',
              color: C.purple,
              label: 'Change Password',
              sub: 'Update your login password',
              onPress: () => { resetPwd(); setView('password'); },
              hidden: false,
            },
            {
              Icon: Users,
              iconBg: 'rgba(13,168,112,0.08)',
              color: C.green,
              label: 'Assistant Accounts',
              sub: `${assistants.length} assistant${assistants.length !== 1 ? 's' : ''}`,
              onPress: () => { loadAssistants(''); setAssistantsSearch(''); setView('assistants'); },
              hidden: isAsst,
            },
          ].filter(r => !r.hidden).map((row, i, arr) => (
            <View key={row.label}>
              <TouchableOpacity
                onPress={row.onPress}
                activeOpacity={0.85}
                style={home.menuRow}
              >
                <View style={[home.menuIcon, { backgroundColor: row.iconBg }]}>
                  <row.Icon size={15} color={row.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={home.menuLabel}>{row.label}</Text>
                  <Text style={home.menuSub}>{row.sub}</Text>
                </View>
                <ChevronRight size={14} color={C.pale} />
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={home.menuDivider} />}
            </View>
          ))}
        </View>

        {/* ── Products & Services ── */}
        {products.filter(p => p.status === 'active').length > 0 && (
          <View style={[home.menuCard, { marginBottom: 16 }]}>
            <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Package size={13} color={C.blue} />
              <Text style={{ fontFamily: F.bold, fontSize: 12, color: C.muted, letterSpacing: 0.5 }}>PRODUCTS & SERVICES</Text>
            </View>
            {products.filter(p => p.status === 'active').map((p, i, arr) => (
              <View key={p.prodCode}>
                <View style={[home.menuRow, { paddingVertical: 11 }]}>
                  <View style={[home.menuIcon, { backgroundColor: 'rgba(13,168,112,0.08)' }]}>
                    <Package size={13} color={C.green} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={home.menuLabel}>{p.description}</Text>
                    <Text style={home.menuSub}>{p.prodCode}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(13,168,112,0.08)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
                    <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.green }} />
                    <Text style={{ fontSize: 10, fontFamily: F.bold, color: C.green }}>Active</Text>
                  </View>
                </View>
                {i < arr.length - 1 && <View style={home.menuDivider} />}
              </View>
            ))}
          </View>
        )}

        {/* ── Settings menu ── */}
        <View style={[home.menuCard, { marginBottom: 14 }]}>
          {[
            { Icon: Bell, iconBg: 'rgba(24,120,206,0.08)', color: C.blue, label: 'Notifications', sub: 'Manage push alerts' },
            { Icon: HelpCircle, iconBg: 'rgba(13,168,112,0.08)', color: C.green, label: 'Help & Support', sub: 'FAQs \u00B7 Contact us' },
            { Icon: FileText, iconBg: 'rgba(255,150,0,0.08)', color: C.orange, label: 'Privacy Policy', sub: 'Terms of service' },
          ].map((row, i) => (
            <View key={row.label}>
              <TouchableOpacity activeOpacity={0.85} style={home.menuRow}>
                <View style={[home.menuIcon, { backgroundColor: row.iconBg }]}>
                  <row.Icon size={15} color={row.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={home.menuLabel}>{row.label}</Text>
                  <Text style={home.menuSub}>{row.sub}</Text>
                </View>
                <ChevronRight size={14} color={C.pale} />
              </TouchableOpacity>
              {i < 2 && <View style={home.menuDivider} />}
            </View>
          ))}
        </View>

        {/* ── Sign out ── */}
        <TouchableOpacity
          onPress={onLogout}
          activeOpacity={0.85}
          style={home.signOutBtn}
        >
          <LogOut size={15} color={C.red} />
          <Text style={home.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );

  // ── EDIT PROFILE VIEW ──────────────────────────────────────────────────────
  if (view === 'edit') {
    type EK = keyof typeof editForm;

    const EF = ({
      label, field, disabled = false, kbt = 'default' as any,
    }: { label: string; field: EK; disabled?: boolean; kbt?: any }) => (
      <View style={{ flex: 1, marginBottom: 12 }}>
        <Text style={ep.label}>{label}</Text>
        <TextInput
          value={editForm[field]}
          editable={!disabled}
          keyboardType={kbt}
          onChangeText={v => setEditForm(p => ({ ...p, [field]: v }))}
          style={[ep.input, disabled && ep.inputDisabled]}
        />
      </View>
    );

    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <GradHdr title="Edit Profile" onBack={() => setView('home')} />
        <ScrollView
          contentContainerStyle={ep.content}
          showsVerticalScrollIndicator={false}
        >
          {!isAsst && <EF label="ACCOUNT NAME" field="accountName" />}
          {!isAsst && editForm.category === 'business' && <EF label="COMPANY NAME" field="companyName" />}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <EF label="FIRST NAME" field="firstName" />
            <EF label="LAST NAME" field="lastName" />
          </View>
          <EF label="PHONE NUMBER" field="phoneNumber" kbt="phone-pad" />
          <EF label="EMAIL ADDRESS" field="email" disabled kbt="email-address" />
          {!isAsst && editForm.category === 'business' && <EF label="ADDRESS" field="address" />}
          {!isAsst && <EF label="GHANA CARD NUMBER" field="ghanaCardNumber" />}
          {!isAsst && <EF label="TAX ID" field="taxId" />}

          <TouchableOpacity
            onPress={async () => {
              setEditSaving(true);
              try {
                if (isAsst) {
                  await apiEditAssistantProfile({
                    id: editForm.resellerid,
                    firstName: editForm.firstName,
                    lastName: editForm.lastName,
                    phoneNumber: editForm.phoneNumber,
                    email: editForm.email,
                  });
                } else {
                  await apiEditProfile({
                    id: editForm.resellerid,
                    accountName: editForm.accountName,
                    companyName: editForm.companyName,
                    firstName: editForm.firstName,
                    lastName: editForm.lastName,
                    phoneNumber: editForm.phoneNumber,
                    email: editForm.email,
                    address: editForm.address,
                    ghanaCardNumber: editForm.ghanaCardNumber,
                    taxId: editForm.taxId,
                    salesExecutive: editForm.salesExecutive,
                    category: editForm.category,
                    status: editForm.status,
                  });
                }
                // best-effort local name sync
                try { await updateUser({ name: `${editForm.firstName} ${editForm.lastName}`.trim(), phone: editForm.phoneNumber }); } catch { }
                setEditDone(true);
                setTimeout(() => { setEditDone(false); setView('home'); }, 1500);
              } catch {
                // silently stay on edit view
              } finally {
                setEditSaving(false);
              }
            }}
            activeOpacity={0.85}
            disabled={editSaving}
            style={[ep.saveBtn, editDone && ep.saveBtnDone]}
          >
            {editDone ? (
              <View style={ep.saveBtnInner}>
                <CheckCircle2 size={15} color={C.green} />
                <Text style={[ep.saveBtnText, { color: C.green }]}>Saved!</Text>
              </View>
            ) : (
              <LinearGradient
                colors={G.wallet.colors}
                start={G.wallet.start}
                end={G.wallet.end}
                style={ep.saveBtnInner}
              >
                {editSaving
                  ? <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  : null}
                <Text style={ep.saveBtnText}>
                  {editSaving ? 'Saving\u2026' : 'Save Changes'}
                </Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── CHANGE PASSWORD VIEW ───────────────────────────────────────────────────
  if (view === 'password') {
    const pwdMatch = newPwd === confirmPwd;
    const pwdOk = pwdMatch && newPwd.length >= 8;

    const strength = (() => {
      if (!newPwd) return 0;
      if (newPwd.length < 6) return 1;
      if (newPwd.length < 8) return 2;
      const hasUpper = /[A-Z]/.test(newPwd);
      const hasNum = /[0-9]/.test(newPwd);
      const hasSymbol = /[^A-Za-z0-9]/.test(newPwd);
      if (hasUpper && hasNum && hasSymbol) return 4;
      if (hasUpper || hasNum) return 3;
      return 2;
    })();
    const strengthColor = [C.border, C.red, 'rgba(255,150,0,0.85)', C.orange, C.green][strength];
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];

    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <GradHdr
          title="Change Password"
          onBack={() => { resetPwd(); setView('home'); }}
        />
        <ScrollView
          contentContainerStyle={pw.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={pw.banner}>
            <Shield size={15} color={C.blue} />
            <Text style={pw.bannerText}>
              Verify your current password before setting a new one.
            </Text>
          </View>

          <View style={pw.fieldWrap}>
            <Text style={pw.label}>CURRENT PASSWORD</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                secureTextEntry={!showOld}
                placeholder="Enter current password"
                placeholderTextColor={C.pale}
                value={oldPwd}
                onChangeText={v => { setOldPwd(v); setOldPwdError(''); }}
                editable={!oldPwdVerified}
                style={[
                  pw.input,
                  {
                    borderColor: oldPwdError
                      ? C.red
                      : oldPwdVerified ? C.green : C.border,
                    paddingRight: 44,
                    backgroundColor: oldPwdVerified
                      ? 'rgba(13,168,112,0.04)'
                      : C.bg,
                  },
                ]}
              />
              {oldPwdVerified ? (
                <CheckCircle2
                  size={16}
                  color={C.green}
                  style={pw.inputRightIcon}
                />
              ) : (
                <TouchableOpacity
                  onPress={() => setShowOld(p => !p)}
                  style={pw.inputRightBtn}
                >
                  {showOld
                    ? <EyeOff size={15} color={C.pale} />
                    : <Eye size={15} color={C.pale} />}
                </TouchableOpacity>
              )}
            </View>
            {oldPwdError ? (
              <Text style={pw.errText}>{oldPwdError}</Text>
            ) : null}
          </View>

          {!oldPwdVerified && (
            <TouchableOpacity
              onPress={async () => {
                if (!user) return;
                setVerifying(true);
                try {
                  const ok = await apiVerifyPassword(oldPwd);
                  if (ok) {
                    setOldPwdVerified(true);
                  } else {
                    setOldPwdError('Current password is incorrect.');
                  }
                } catch {
                  setOldPwdError('Verification failed. Please try again.');
                } finally {
                  setVerifying(false);
                }
              }}
              disabled={verifying || oldPwd.length < 3}
              activeOpacity={0.85}
              style={[
                pw.actionBtn,
                (verifying || oldPwd.length < 3) && { opacity: 0.45 },
              ]}
            >
              <LinearGradient
                colors={G.wallet.colors}
                start={G.wallet.start}
                end={G.wallet.end}
                style={pw.actionBtnGrad}
              >
                {verifying && (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text style={pw.actionBtnText}>
                  {verifying ? 'Verifying\u2026' : 'Verify Password'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {oldPwdVerified && (
            <>
              <View style={pw.fieldWrap}>
                <Text style={pw.label}>NEW PASSWORD</Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    secureTextEntry={!showNew}
                    placeholder="Minimum 8 characters"
                    placeholderTextColor={C.pale}
                    value={newPwd}
                    onChangeText={setNewPwd}
                    style={[pw.input, { paddingRight: 44 }]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNew(p => !p)}
                    style={pw.inputRightBtn}
                  >
                    {showNew
                      ? <EyeOff size={15} color={C.pale} />
                      : <Eye size={15} color={C.pale} />}
                  </TouchableOpacity>
                </View>

                {newPwd.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4].map(i => (
                        <View
                          key={i}
                          style={[
                            pw.strBar,
                            { backgroundColor: i <= strength ? strengthColor : C.divider },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[pw.strLabel, { color: strengthColor }]}>
                      {strengthLabel}
                    </Text>
                  </View>
                )}
              </View>

              <View style={[pw.fieldWrap, { marginBottom: 20 }]}>
                <Text style={pw.label}>CONFIRM NEW PASSWORD</Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    secureTextEntry={!showConf}
                    placeholder="Re-enter new password"
                    placeholderTextColor={C.pale}
                    value={confirmPwd}
                    onChangeText={setConfirmPwd}
                    style={[
                      pw.input,
                      {
                        paddingRight: 44,
                        borderColor: confirmPwd.length > 0
                          ? (pwdMatch ? C.green : C.red)
                          : C.border,
                      },
                    ]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConf(p => !p)}
                    style={pw.inputRightBtn}
                  >
                    {showConf
                      ? <EyeOff size={15} color={C.pale} />
                      : <Eye size={15} color={C.pale} />}
                  </TouchableOpacity>
                </View>
                {confirmPwd.length > 0 && !pwdMatch && (
                  <Text style={pw.errText}>Passwords do not match</Text>
                )}
              </View>

              <TouchableOpacity
                onPress={async () => {
                  if (!user) return;
                  setPwdSaving(true);
                  try {
                    await apiChangePassword(newPwd);
                    setPwdDone(true);
                    setTimeout(() => { resetPwd(); setView('home'); }, 1600);
                  } catch {
                    setOldPwdError('Failed to change password. Please try again.');
                    setView('password');
                  } finally {
                    setPwdSaving(false);
                  }
                }}
                disabled={!pwdOk || pwdSaving || pwdDone}
                activeOpacity={0.85}
                style={[
                  pw.actionBtn,
                  (!pwdOk && !pwdDone) && { opacity: 0.45 },
                  pwdDone && pw.actionBtnDone,
                ]}
              >
                {pwdDone ? (
                  <View style={[pw.actionBtnGrad, { backgroundColor: 'transparent' }]}>
                    <CheckCircle2 size={15} color={C.green} style={{ marginRight: 8 }} />
                    <Text style={[pw.actionBtnText, { color: C.green }]}>
                      Password Changed!
                    </Text>
                  </View>
                ) : (
                  <LinearGradient
                    colors={G.wallet.colors}
                    start={G.wallet.start}
                    end={G.wallet.end}
                    style={pw.actionBtnGrad}
                  >
                    {pwdSaving && (
                      <ActivityIndicator
                        size="small"
                        color="#fff"
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Text style={pw.actionBtnText}>
                      {pwdSaving ? 'Changing\u2026' : 'Change Password'}
                    </Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  // ── ASSISTANT LIST VIEW ────────────────────────────────────────────────────
  if (view === 'assistants') return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <GradHdr
        title="Assistant Accounts"
        onBack={() => setView('home')}
        right={
          <TouchableOpacity
            onPress={() => {
              setAsstForm({ firstName: '', lastName: '', phoneNumber: '', email: '', idProofType: 'GHANA_CARD', idNumber: '' });
              setAsstPerms(makeEmptyPerms());
              setAsstError('');
              setView('add-asst');
            }}
            style={al.headerBtn}
            activeOpacity={0.8}
          >
            <UserPlus size={14} color="#fff" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={al.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
          <TextInput
            value={assistantsSearch}
            onChangeText={setAssistantsSearch}
            placeholder="Search assistants…"
            placeholderTextColor={C.pale}
            style={{ backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontFamily: F.regular, fontSize: 14, color: C.navy }}
          />
        </View>

        {assistantsLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 32 }}><ActivityIndicator size="small" color={C.blue} /></View>
        ) : assistants.length === 0 ? (
          <View style={al.empty}>
            <View style={al.emptyIconWrap}>
              <Users size={24} color={C.pale} />
            </View>
            <Text style={al.emptyTitle}>No assistant accounts</Text>
            <Text style={al.emptySub}>
              Add an assistant to delegate transactions and manage permissions.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setAsstForm({ firstName: '', lastName: '', phoneNumber: '', email: '', idProofType: 'GHANA_CARD', idNumber: '' });
                setAsstPerms(makeEmptyPerms());
                setAsstError('');
                setView('add-asst');
              }}
              activeOpacity={0.85}
              style={al.addFirstBtn}
            >
              <LinearGradient
                colors={G.wallet.colors}
                start={G.wallet.start}
                end={G.wallet.end}
                style={al.addFirstGrad}
              >
                <Text style={al.addFirstText}>Add First Assistant</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : null}

        {!assistantsLoading && assistants.map(asst => {
          const permSections = PERM_SECTIONS.filter(sec =>
            sec.modules.some(mod =>
              sec.cols.some(col =>
                asst.permissions[`${sec.key}:${mod}`]?.[col as PermKey]
              )
            )
          );
          return (
            <View key={asst.id} style={al.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={al.cardAvatar}>
                  <Text style={al.cardInitials}>
                    {asst.firstName[0]}{asst.lastName[0]}
                  </Text>
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={al.cardName}>
                    {asst.firstName} {asst.lastName}
                  </Text>
                  <Text style={al.cardEmail} numberOfLines={1}>{asst.email}</Text>
                  <Text style={al.cardPhone}>{asst.phoneNumber}</Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 7, flexShrink: 0 }}>
                  <View style={[
                    al.statusBadge,
                    {
                      backgroundColor: asst.status === 'active'
                        ? 'rgba(13,168,112,0.1)'
                        : 'rgba(232,51,74,0.08)'
                    },
                  ]}>
                    <View style={[
                      al.statusDot,
                      { backgroundColor: asst.status === 'active' ? C.green : C.red },
                    ]} />
                    <Text style={[
                      al.statusText,
                      { color: asst.status === 'active' ? C.green : C.red },
                    ]}>
                      {asst.status}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 7 }}>
                    <TouchableOpacity
                      onPress={async () => {
                        setEditingAsst(asst);
                        setAsstForm({
                          firstName: asst.firstName,
                          lastName: asst.lastName,
                          phoneNumber: asst.phoneNumber,
                          email: asst.email,
                          idProofType: asst.idProofType ?? 'GHANA_CARD',
                          idNumber: asst.idNumber ?? '',
                        });
                        try {
                          const apiPerms = await apiGetAssistantPermissions(asst.assistantId ?? asst.id);
                          setAsstPerms(apiPermsToPermMap(apiPerms));
                        } catch {
                          setAsstPerms(makeEmptyPerms());
                        }
                        setAsstError('');
                        setView('edit-asst');
                      }}
                      style={al.editBtn}
                      activeOpacity={0.8}
                    >
                      <Pencil size={12} color={C.blue} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setDeleteConfirm(asst.id)}
                      style={al.deleteBtn}
                      activeOpacity={0.8}
                    >
                      <Trash2 size={12} color={C.red} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {permSections.length > 0 && (
                <View style={al.permChips}>
                  {permSections.map(sec => (
                    <View key={sec.key} style={al.permChip}>
                      <Text style={al.permChipText}>{sec.key}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={!!deleteConfirm}
        transparent
        animationType="slide"
        onRequestClose={() => setDeleteConfirm(null)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: C.overlay }}
          activeOpacity={1}
          onPress={() => setDeleteConfirm(null)}
        />
        <View style={al.deleteSheet}>
          <View style={{ alignItems: 'center', marginBottom: 22 }}>
            <View style={al.deleteIconBox}>
              <Trash2 size={24} color={C.red} />
            </View>
            <Text style={al.deleteTitle}>Remove Assistant?</Text>
            <Text style={al.deleteSub}>
              This will immediately revoke all access for this assistant account.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => setDeleteConfirm(null)}
              style={al.deleteCancelBtn}
              activeOpacity={0.8}
            >
              <Text style={al.deleteCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                try {
                  await apiDeleteAssistant(deleteConfirm!);
                } catch { }
                setAssistants(p => p.filter(a => a.id !== deleteConfirm));
                setDeleteConfirm(null);
              }}
              style={al.deleteConfirmBtn}
              activeOpacity={0.85}
            >
              <Text style={al.deleteConfirmText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  // ── ADD / EDIT ASSISTANT VIEW ──────────────────────────────────────────────
  const isEdit = view === 'edit-asst';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <GradHdr
        title={isEdit
          ? `${editingAsst?.firstName} ${editingAsst?.lastName}`
          : 'New Assistant'}
        onBack={() => setView('assistants')}
      />
      <ScrollView
        contentContainerStyle={asf.content}
        showsVerticalScrollIndicator={false}
      >
        {!isEdit && (
          <>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {(['firstName', 'lastName'] as const).map(k => (
                <View key={k} style={{ flex: 1, marginBottom: 12 }}>
                  <Text style={asf.label}>
                    {k === 'firstName' ? 'FIRST NAME' : 'LAST NAME'}
                  </Text>
                  <TextInput
                    value={asstForm[k]}
                    onChangeText={v => setAsstForm(p => ({ ...p, [k]: v }))}
                    style={asf.input}
                  />
                </View>
              ))}
            </View>
            {(['phoneNumber', 'email'] as const).map(k => (
              <View key={k} style={{ marginBottom: 12 }}>
                <Text style={asf.label}>
                  {k === 'phoneNumber' ? 'PHONE NUMBER' : 'EMAIL ADDRESS'}
                </Text>
                <TextInput
                  keyboardType={k === 'email' ? 'email-address' : 'phone-pad'}
                  autoCapitalize="none"
                  value={asstForm[k]}
                  onChangeText={v => setAsstForm(p => ({ ...p, [k]: v }))}
                  style={asf.input}
                />
              </View>
            ))}
            {/* ID proof type selector */}
            <View style={{ marginBottom: 12 }}>
              <Text style={asf.label}>ID TYPE</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 6 }}>
                {ID_PROOF_TYPES.map(t => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setAsstForm(p => ({ ...p, idProofType: t }))}
                    activeOpacity={0.8}
                    style={{
                      paddingHorizontal: 11, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5,
                      backgroundColor: asstForm.idProofType === t ? C.blue : C.white,
                      borderColor: asstForm.idProofType === t ? C.blue : C.border
                    }}
                  >
                    <Text style={{ fontSize: 12, fontFamily: F.medium, color: asstForm.idProofType === t ? '#fff' : C.muted }}>
                      {ID_PROOF_LABELS[t]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{ marginBottom: 12 }}>
              <Text style={asf.label}>ID NUMBER</Text>
              <TextInput
                value={asstForm.idNumber}
                onChangeText={v => setAsstForm(p => ({ ...p, idNumber: v }))}
                style={asf.input}
                autoCapitalize="characters"
              />
            </View>
            <View style={asf.divider} />
          </>
        )}

        {isEdit && editingAsst && (
          <View style={asf.statusRow}>
            <View>
              <Text style={asf.statusTitle}>Account Status</Text>
              <Text style={asf.statusSub}>Enable or disable this assistant</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                setEditingAsst(p =>
                  p ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
                )
              }
              activeOpacity={0.8}
              style={[
                asf.toggleBtn,
                {
                  backgroundColor: editingAsst.status === 'active'
                    ? 'rgba(13,168,112,0.1)'
                    : 'rgba(232,51,74,0.08)',
                },
              ]}
            >
              <Text style={[
                asf.toggleText,
                { color: editingAsst.status === 'active' ? C.green : C.red },
              ]}>
                {editingAsst.status}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={asf.permHeader}>
          <ShieldCheck size={15} color={C.blue} />
          <Text style={asf.permTitle}>Permissions</Text>
        </View>
        <Text style={asf.permSub}>
          Control exactly what this assistant can view, create, approve, export, or delete.
        </Text>

        <PermMatrix perms={asstPerms} onChange={setAsstPerms} />

        <View style={{ height: 18 }} />

        {asstError ? (
          <View style={{ backgroundColor: 'rgba(232,51,74,0.08)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <Text style={{ color: C.red, fontFamily: F.medium, fontSize: 13 }}>{asstError}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={async () => {
            setAsstSaving(true);
            setAsstError('');
            try {
              let savedId: string;
              if (isEdit && editingAsst) {
                await apiEditAssistant({
                  assistantId: editingAsst.assistantId ?? editingAsst.id,
                  firstname: editingAsst.firstName,
                  lastname: editingAsst.lastName,
                  email: editingAsst.email,
                  phoneNumber: editingAsst.phoneNumber,
                  idProofType: editingAsst.idProofType,
                  idNumber: editingAsst.idNumber,
                  status: editingAsst.status,
                });
                savedId = editingAsst.assistantId ?? editingAsst.id;
              } else {
                const res = await apiAddAssistant({
                  resellerId: editForm.resellerid || user?.accountId || '',
                  firstname: asstForm.firstName,
                  lastname: asstForm.lastName,
                  email: asstForm.email,
                  phoneNumber: asstForm.phoneNumber,
                  idProofType: asstForm.idProofType,
                  idNumber: asstForm.idNumber,
                });
                savedId = res.assistantId;
              }
              await apiSaveAssistantPermissions(savedId, permMapToApiPerms(asstPerms));
              await loadAssistants(assistantsSearch);
              setView('assistants');
            } catch (err: any) {
              setAsstError(err.message ?? 'Failed to save assistant. Please try again.');
            } finally {
              setAsstSaving(false);
            }
          }}
          disabled={asstSaving}
          activeOpacity={0.85}
          style={asf.saveBtn}
        >
          <LinearGradient
            colors={G.wallet.colors}
            start={G.wallet.start}
            end={G.wallet.end}
            style={asf.saveBtnGrad}
          >
            {asstSaving && (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={asf.saveBtnText}>
              {asstSaving
                ? 'Saving\u2026'
                : isEdit ? 'Update Assistant' : 'Add Assistant'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Expo Router default export
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileRoute() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return <ProfileScreen onLogout={handleLogout} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const home = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36 },
  avatarCard: { borderRadius: 22, padding: 18, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, shadowColor: '#071830', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, marginBottom: 14 },
  avatar: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 18, fontFamily: F.extrabold, color: '#fff' },
  userName: { fontSize: 15, fontFamily: F.extrabold, color: C.navy },
  userEmail: { fontSize: 11, color: C.muted, marginTop: 2 },
  accountBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, backgroundColor: 'rgba(24,120,206,0.07)', borderRadius: 99, paddingVertical: 3, paddingHorizontal: 10, alignSelf: 'flex-start' },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  accountBadgeText: { fontSize: 10, fontFamily: F.semibold, color: C.mid },
  editIconBtn: { width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(24,120,206,0.08)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statCard: { flex: 1, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 6, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  statValue: { fontSize: 11, fontFamily: F.extrabold, marginBottom: 2 },
  statLabel: { fontSize: 10, fontFamily: F.semibold, color: C.muted, textAlign: 'center', lineHeight: 13 },
  menuCard: { borderRadius: 18, overflow: 'hidden', backgroundColor: C.white, borderWidth: 1, borderColor: C.border, marginBottom: 12, shadowColor: '#071830', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 16, paddingVertical: 14 },
  menuIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  menuLabel: { fontSize: 13, fontFamily: F.semibold, color: C.navy },
  menuSub: { fontSize: 10, color: C.muted, marginTop: 1 },
  menuDivider: { marginLeft: 67, height: 1, backgroundColor: C.divider },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingVertical: 14, borderRadius: 14, backgroundColor: 'rgba(232,51,74,0.07)', borderWidth: 1.5, borderColor: 'rgba(232,51,74,0.2)' },
  signOutText: { fontSize: 13, fontFamily: F.bold, color: C.red },
});

const ep = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36 },
  label: { fontSize: 11, fontFamily: F.semibold, color: C.mid, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 },
  input: { borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, fontFamily: F.medium, color: C.navy, backgroundColor: C.bg },
  inputDisabled: { color: C.muted, backgroundColor: 'rgba(7,24,48,0.04)' },
  saveBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 6 },
  saveBtnDone: { borderWidth: 2, borderColor: C.green, backgroundColor: 'rgba(13,168,112,0.08)' },
  saveBtnInner: { paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnText: { fontSize: 14, fontFamily: F.extrabold, color: '#fff' },
});

const pw = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36 },
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 13, borderRadius: 14, marginBottom: 18, backgroundColor: 'rgba(24,120,206,0.06)', borderWidth: 1.5, borderColor: 'rgba(24,120,206,0.15)' },
  bannerText: { fontSize: 11, color: C.mid, fontFamily: F.medium, flex: 1, lineHeight: 17 },
  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 11, fontFamily: F.semibold, color: C.mid, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 },
  input: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 12, fontSize: 14, fontFamily: F.medium, color: C.navy, backgroundColor: C.bg },
  inputRightIcon: { position: 'absolute', right: 12, top: 13 },
  inputRightBtn: { position: 'absolute', right: 12, top: 13, padding: 2 },
  errText: { fontSize: 10, color: C.red, marginTop: 5, fontFamily: F.medium },
  strBar: { flex: 1, height: 3, borderRadius: 2 },
  strLabel: { fontSize: 9, fontFamily: F.semibold },
  actionBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 14 },
  actionBtnDone: { borderWidth: 2, borderColor: C.green, backgroundColor: 'rgba(13,168,112,0.08)' },
  actionBtnGrad: { paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { fontSize: 14, fontFamily: F.extrabold, color: '#fff' },
});

const al = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36 },
  headerBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 52 },
  emptyIconWrap: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(24,120,206,0.07)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 14, fontFamily: F.bold, color: C.navy, marginBottom: 5 },
  emptySub: { fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 17, marginBottom: 22, paddingHorizontal: 24 },
  addFirstBtn: { borderRadius: 13, overflow: 'hidden' },
  addFirstGrad: { paddingVertical: 11, paddingHorizontal: 28, alignItems: 'center' },
  addFirstText: { fontSize: 13, fontFamily: F.bold, color: '#fff' },
  card: { borderRadius: 18, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, padding: 14, paddingHorizontal: 16, shadowColor: '#071830', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, marginBottom: 12 },
  cardAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(124,92,252,0.1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardInitials: { fontSize: 14, fontFamily: F.extrabold, color: C.purple },
  cardName: { fontSize: 13, fontFamily: F.bold, color: C.navy },
  cardEmail: { fontSize: 10, color: C.muted, marginTop: 1 },
  cardPhone: { fontSize: 10, color: C.muted },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, paddingVertical: 3, paddingHorizontal: 9 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: F.bold, textTransform: 'capitalize' },
  editBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(24,120,206,0.08)', alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(232,51,74,0.08)', alignItems: 'center', justifyContent: 'center' },
  permChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 11, paddingTop: 11, borderTopWidth: 1, borderTopColor: C.divider },
  permChip: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 9, backgroundColor: 'rgba(24,120,206,0.07)', borderWidth: 1, borderColor: 'rgba(24,120,206,0.14)' },
  permChipText: { fontSize: 10, fontFamily: F.semibold, color: C.mid },
  deleteSheet: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  deleteIconBox: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(232,51,74,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  deleteTitle: { fontSize: 16, fontFamily: F.extrabold, color: C.navy, marginBottom: 6, textAlign: 'center' },
  deleteSub: { fontSize: 12, color: C.muted, textAlign: 'center', lineHeight: 18 },
  deleteCancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 13, borderWidth: 2, borderColor: C.border, alignItems: 'center' },
  deleteCancelText: { fontSize: 13, fontFamily: F.bold, color: C.muted },
  deleteConfirmBtn: { flex: 1, paddingVertical: 13, borderRadius: 13, backgroundColor: C.red, alignItems: 'center' },
  deleteConfirmText: { fontSize: 13, fontFamily: F.bold, color: '#fff' },
});

const asf = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36 },
  label: { fontSize: 11, fontFamily: F.semibold, color: C.mid, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 },
  input: { borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, fontFamily: F.medium, color: C.navy, backgroundColor: C.bg },
  divider: { height: 1, backgroundColor: C.divider, marginBottom: 18, marginTop: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 16, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, marginBottom: 18 },
  statusTitle: { fontSize: 12, fontFamily: F.bold, color: C.navy },
  statusSub: { fontSize: 10, color: C.muted, marginTop: 1 },
  toggleBtn: { borderRadius: 99, paddingVertical: 6, paddingHorizontal: 16 },
  toggleText: { fontSize: 11, fontFamily: F.bold, textTransform: 'capitalize' },
  permHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  permTitle: { fontSize: 13, fontFamily: F.bold, color: C.navy },
  permSub: { fontSize: 10, color: C.muted, marginBottom: 14, lineHeight: 16 },
  saveBtn: { borderRadius: 14, overflow: 'hidden' },
  saveBtnGrad: { paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: C.blue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 5 },
  saveBtnText: { fontSize: 14, fontFamily: F.extrabold, color: '#fff' },
});

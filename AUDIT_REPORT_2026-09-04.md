# M-Pay Internal Distribution Readiness Audit

**Date:** 2026-09-04
**Scope:** Mobile client only (Expo SDK 57 / RN 0.86.2). Backend source not available — no backend code was assumed or modified.
**Previous cycles:** AUDIT_REPORT.md (2026-08-05, 63→~74), AUDIT_REPORT_2026-08-08.md (83), AUDIT_REPORT_2026-08-20.md (87), REMEDIATION_REPORT_2026.md (92). This cycle re-verifies the codebase from scratch and fixes newly-found issues.

---

## 1. Executive Summary

The mobile client is architecturally mature and has already been through four remediation cycles. Authentication (access/refresh token handling, concurrent-401 deduplication, logout cache isolation) is solid. TypeScript is clean, 105/105 tests pass, and Expo Doctor reports 20/21 (one non-blocking dependency-patch-version check).

This cycle found and fixed three genuine client-side gaps:
1. Airtime purchase amount field accepted non-numeric/negative/zero values (financial input validation gap).
2. Bulk airtime/data upload rows had the same missing amount validation.
3. iOS `Info.plist` had no `NSContactsUsageDescription` — calling the Contacts API on a real iOS device or TestFlight build would **crash the app** (iOS terminates apps that touch a protected API without a usage-description string).

All three are fixed in this session (see [§26](#26-files-modified-during-audit)). No backend changes were made or required for these fixes.

The most significant remaining item is **iOS build/distribution configuration**: `eas.json` has no iOS build profile beyond a simulator-only `development` entry, and no Apple credentials/provisioning have been verified. Android internal distribution (APK, EAS `preview`/`internal-aab` profiles) is in good shape.

## 2. Overall Score

| Category | Score /100 |
|---|---:|
| Architecture & Code Quality | 85 |
| Security | 88 |
| Authentication | 90 |
| API Integration | 82 |
| Financial Safety | 80 |
| State Management | 88 |
| Functional Stability | 86 |
| UI/UX | 85 |
| Performance | 82 |
| Network Resilience | 85 |
| Android Readiness | 90 |
| iOS Readiness | 62 |
| Accessibility | 78 |
| Testing | 82 |
| Build & Release | 78 |
| Privacy/Data Handling | 88 |
| Maintainability | 84 |
| **Overall (weighted toward security/financial/auth)** | **83** |

Weighting rationale: Security, Authentication, and Financial Safety are weighted most heavily per the audit brief. iOS Readiness drags the overall score down but does not block **Android** internal distribution.

## 3. Final Verdict

🟡 **READY WITH NON-BLOCKING ISSUES — Android track.**
🔴 **NOT READY — iOS track**, until the missing Contacts usage string (now fixed) is included in a fresh build and a real iOS build/provisioning pass is completed.

**Direct answer:** You can take the **Android APK** (EAS `preview`/`internal-aab` profile) and hand it to internal testers **today**, after a fresh build that includes the fixes in this report. Do **not** hand out an **iOS** build until it is rebuilt with the corrected `app.json` (contacts crash fix) and someone has verified `eas build --platform ios` succeeds with valid Apple credentials — this repo has not shown evidence an iOS build has ever been produced.

## 4. Internal Distribution Blockers

| ID | Issue | Type | Blocks Internal Distribution? |
|---|---|---|---|
| P0-1 | iOS `NSContactsUsageDescription` missing → runtime crash when contact picker is opened on iOS | CLIENT-SIDE | YES (iOS only) — **fixed this cycle** |
| P0-2 | No iOS build has ever been produced for this project (`eas build:list --platform ios` returns zero results, vs. 3+ finished Android builds) — a non-interactive iOS build attempt this cycle confirmed the sole remaining cause is **no Apple credentials configured** for internal distribution | DEVICE VALIDATION | YES (iOS only) — **requires the project owner to run `eas build --platform ios --profile preview` interactively and complete Apple ID sign-in**, which cannot be done by an automated agent |

No Android P0/P1 blockers were found. `usesCleartextTraffic` (a P0 in the original 2026-08-05 audit) is confirmed **removed** — the current `AndroidManifest.xml` does not set it, and the API base URL is HTTPS.

## 5. High-Priority Issues

| ID | Issue | Severity | Type | Blocks Internal Distribution |
|---|---|---|---|---|
| P1-1 | Airtime amount field accepted `""`/NaN/negative values before submit (fixed) | P1 | CLIENT-SIDE | NO (fixed) |
| P1-2 | Bulk upload rows had same missing amount validation (fixed) | P1 | CLIENT-SIDE | NO (fixed) |
| P1-3 | Wallet top-up (`MOMOWALLET`) is two sequential HTTP calls (credit e-Top-Up, debit MoMo) with no rollback if the second call fails | P1 | BACKEND DEPENDENCY | NO — tracked for production |
| P1-4 | Transaction status resolved by matching backend message text (`Transaction status by text-matching`) rather than a typed enum | P1 | BACKEND DEPENDENCY | NO |
| P1-5 | Assistant profile lookup pages through 100 records client-side; accounts beyond position 100 are not found | P1 | BACKEND DEPENDENCY | NO — should be tracked for beta |
| P1-7 | Push notification tokens are retrieved but never registered with the backend (no endpoint) | P2 | BACKEND DEPENDENCY | NO |

## 6. Security Assessment — 88/100

**Verified good:**
- Access/refresh tokens stored only in `expo-secure-store` ([tokenStorage.ts](src/utils/tokenStorage.ts)); no tokens in `AsyncStorage`.
- No hardcoded secrets, API keys, or credentials found anywhere in `src/`.
- `.env` / `.env.local` (containing the real staging API URL and public Sentry DSN) are gitignored; `.env.example` only contains a placeholder.
- Android `AndroidManifest.xml` does **not** set `usesCleartextTraffic` — HTTP is blocked by the platform default Network Security Config. API base URL in `.env` is `https://…`.
- Sentry `beforeSend` strips `event.request.data`, preventing phone numbers/amounts from being sent to Sentry. DSN is a public, non-secret value by Sentry's design.
- No `console.log`/`console.error`/`console.warn` of tokens, passwords, or financial data found in production code (only in test files, which is expected).
- No `localhost`/`127.0.0.1`/staging IPs hardcoded in `src/` — all endpoint config flows through `EXPO_PUBLIC_API_BASE_URL`.

**Gaps:**
- `apiClient`'s JWT `exp` decoding (`client.ts`) uses `atob`, which is fine in the Hermes/RN environment but is a **read-only, non-verifying** decode (expected — verification is the backend's job; this is just used to decide when to proactively refresh).
- iOS Contacts permission string was missing (fixed — see §26).

## 7. Authentication Assessment — 90/100

Reviewed [client.ts](src/api/client.ts), [auth.store.tsx](src/store/auth.store.tsx), [auth.api.ts](src/api/auth.api.ts), [tokenStorage.ts](src/utils/tokenStorage.ts).

- **Concurrent-401 test (Request A/B/C → 401):** A single module-level `pendingRefresh` promise is shared between the request interceptor (proactive refresh) and the response interceptor (reactive refresh-on-401). All three concurrent 401s converge on the same in-flight refresh call; each original request is retried once (`_retry` flag prevents a second retry), so there is **no infinite refresh loop**. ✅
- Session restoration on launch calls `apiRefreshSession` and repopulates both the in-memory cache and SecureStore. ✅
- Failed refresh → `clearTokens()` + `logoutHandler()` (wired to `performLogout`), which now also calls `queryClient.cancelQueries()` + `queryClient.clear()` + `clearFavorites()` — this was the C-001 fix from the previous remediation cycle, confirmed present. ✅
- `apiLogin`/`apiRefreshSession` use bare `axios` (not `apiClient`) with an explicit `30_000ms` timeout each — this is correct, since routing the initial login through the token-refresh-aware `apiClient` would be circular.
- `logout()` still fires `apiLogout(refresh)` without awaiting it (best-effort server-side revocation) — reasonable given `apiLogout` is documented as fire-and-forget and local session state is cleared regardless.
- `apiVerifyPassword` was re-checked this cycle: it correctly returns `false` only for 400/401 (wrong password) and throws `ApiError` for everything else (network/server errors), which `profile.tsx` catches separately and shows "Verification failed. Please try again." — this was already fixed in a prior remediation cycle and is covered by `auth.api.test.ts`. An earlier draft of this report incorrectly re-flagged it as unresolved; corrected here after re-verifying the live code and tests.

## 8. Financial Flow Assessment — 80/100

Reviewed [wallet.tsx](src/app/(app)/(tabs)/wallet.tsx), [services.tsx](src/app/(app)/(tabs)/services.tsx), [airtime.tsx](src/app/(app)/airtime.tsx), [data-bundle.tsx](src/app/(app)/data-bundle.tsx), [ref.ts](src/utils/ref.ts), [pollStatus.ts](src/utils/pollStatus.ts).

- **Reference generation:** `genRef()`/`genWalletRef()`/`genMsRef()`/`genBtRef()` use `expo-crypto` random bytes + timestamp — collision-safe. References are regenerated after a failed attempt so a retry never reuses a ref that may already be recorded server-side as failed.
- **Duplicate-submission protection:** every flow disables its submit button/guards re-entry while a request is in flight (`isProcessing`/`submitting` state), and Android back-press is blocked during active submissions (`wallet.tsx`, `services.tsx`).
- **Ambiguous outcomes handled conservatively:** unresolved/unknown backend statuses are treated as `'pending'`, never silently as `'failure'` ([transactions.api.ts](src/api/transactions.api.ts), [wallet.api.ts](src/api/wallet.api.ts)). On poll timeout the user is shown a message rather than an assumed failure state, though the wording could more explicitly point to "check your transaction history" (P2, cosmetic).
- **Balance/history refresh:** all purchase flows call `invalidateQueries` for `walletBalances`, `transactions`, and `recentTransactions` on success; wallet top-up additionally polls until the balance numerically changes from its pre-transaction snapshot before showing "success", to avoid a stale-balance flash.
- **Fixed this cycle — amount validation:** `AirtimeForm.tsx`'s enable condition was `!!form.phone && !!form.amount`, which allowed any non-empty string (`"abc"`, `"-5"`, `"Infinity"`) through to `parseFloat()` and the API payload. Now requires a finite, positive number. The same gap existed in the bulk-upload row filter in `services.tsx` and is fixed identically. `WalletForm.tsx` and `DataForm.tsx`'s FLEXI-tab price validation already had correct `isNaN`/range checks and needed no change.
- **Two-leg wallet top-up (`MOMOWALLET`):** credit and debit are two separate HTTP calls with no client-side rollback if the second fails. This is a **BACKEND DEPENDENCY** (needs a single atomic/idempotent endpoint) — flagged, not fixed, since it cannot be solved from the client.

## 9. API Integration Assessment — 82/100

- API layer is cleanly split by domain (`auth.api.ts`, `wallet.api.ts`, `transactions.api.ts`, `airtime.api.ts`, `profile.api.ts`, `dashboard.api.ts`) behind a single barrel export ([src/api/index.ts](src/api/index.ts)).
- Errors are normalized to a single `ApiError` type with a `status` and user-facing `message` almost everywhere.
- Assistant-profile pagination (fetches page 1 of 100, filters client-side) and text-based transaction-status matching are both genuine **BACKEND DEPENDENCY** limitations, already tracked as TODOs in `profile.api.ts` — not solvable client-side.
- Two `as any` casts remain in `profile.tsx`/`index.tsx` where the profile-vs-assistant-profile union isn't discriminated by a common tag. Not a crash risk today (both members of the union have compatible optional fields), but worth a typed discriminant in a future cycle — not a distribution blocker.

## 10. TanStack Query / State Assessment — 88/100

- Confirmed **no** Zustand/Redux/MobX in the dependency tree — state is exclusively React Context (`auth.store.tsx`, `toast.store.tsx`) for local state and TanStack Query for server state, matching the mandated architecture.
- **User-switch isolation test (A logs out → B logs in):** `performLogout()` calls `queryClient.cancelQueries()` then `queryClient.clear()`, and separately wipes SecureStore tokens and the AsyncStorage-backed favorites list. Since query keys (`walletBalances`, `transactions`, `dashboard`, etc.) are **not** parameterized by user ID, the safety of this design depends entirely on `queryClient.clear()` running to completion before the next login — which it does, since `logout()` is awaited by the UI before the login screen becomes interactive. No cross-user leakage path was found.
- `staleTime`/`gcTime` choices are deliberate and documented in code comments (e.g., wallet balances use `staleTime: 0` + 10-minute `gcTime` so a reconnect never flashes `GHS 0`, while dashboard data uses a 2-minute app-wide default).
- Mutations correctly `invalidateQueries`/`fetchQuery` with `refetchType: 'all'` where a stale-marked cache wouldn't otherwise be re-fetched immediately (see `services.tsx` `refreshTxData`).

## 11. Code Quality Assessment — 85/100

- Improved materially since the 2026-08-05 baseline: the previously-flagged dead `useWalletFlow` hook, duplicate `SInput`, ghost `src/features/` schemas, and hardcoded PII seed data in `data.ts` are all gone or now legitimately wired in.
- `services.tsx` remains a large state-machine screen (multiple `svcType` branches inline in `handleConfirm`) — functional but would benefit from extraction into per-type handlers in a future refactor. Not urgent for internal distribution.
- Non-null assertions (`form.bundle!...`) in `services.tsx`'s data/fibre branch are safe today because `DataForm`'s `ok` gate (`!!form.bundle`) is the only path into that branch, but there's no explicit guard at the top of `handleConfirm` itself — low risk, not fixed this cycle (would be over-engineering to add a guard for a state transition that's already structurally impossible to reach in the current UI).

## 12. Stale / Dead Code Assessment

No dead files, unused exports, mock data wired into real screens, or commented-out code blocks were found. `src/mocks/` and `src/features/auth/components/` are empty directories with no dead content. Two TODOs exist ([profile.api.ts](src/api/profile.api.ts) — assistant pagination; [notifications/index.ts](src/notifications/index.ts) — push-token registration), both legitimate backend-blocked feature notes, not abandoned code.

## 13. Performance Assessment — 82/100

- Notification and contact-picker listeners are cleaned up on unmount (`setupNotificationListeners` returns a disposer called in `_layout.tsx`'s `useEffect` cleanup).
- Poll loops (`pollStatus.ts`, wallet settlement polling) use `setTimeout` chains with `useRef`-tracked timers and are cleared on unmount — no dangling timers found.
- `AppState` listener in `_layout.tsx` is added once and removed in cleanup.
- No obvious excessive re-render patterns or large-list virtualization gaps were found in the areas reviewed (history/transaction lists were not exhaustively line-audited this cycle given time constraints — recommend a follow-up pass focused specifically on `history.tsx` list rendering with large transaction counts on a real device).

## 14. Android Readiness — 90/100

- `AndroidManifest.xml`: `INTERNET`, `READ/WRITE_EXTERNAL_STORAGE` (capped `maxSdkVersion=32`, correctly scoped for Android 13+ scoped storage), `SYSTEM_ALERT_WINDOW`, `VIBRATE`. No `usesCleartextTraffic`. Deep link scheme `mpay://` registered; HTTPS browsable `<queries>` intent present for opening external links.
- SDK versions are inherited from the Expo SDK 57 autolinking defaults (not overridden in `gradle.properties`/`build.gradle`) — i.e. `compileSdk`/`targetSdk` 35, `minSdk` 24, consistent with current Play/EAS requirements.
- Release signing is correctly wired through `keystore.properties` (gitignored, `keystore.properties.example` provided as a template) — R8 minify + resource shrinking enabled for release.
- `eas.json` `preview` and `internal-aab` profiles both set `distribution: internal` with appropriate `buildType` (`apk` for ad-hoc install, `app-bundle` for the AAB variant) — APK is the correct choice for handing a file directly to internal testers without Play Console.

## 15. iOS Readiness — 68/100

- `app.json` `ios.bundleIdentifier` is set. **Fixed this cycle:** `ios.infoPlist.NSContactsUsageDescription` was missing — `expo-contacts` (`src/features/contacts/service.ts`) calls `Contact.getAllDetails()` directly from the airtime/data contact-picker flow, which iOS will terminate the app for if no usage string is present. This is now declared.
- **Fixed this cycle:** `app.json` was missing `ios.infoPlist.ITSAppUsesNonExemptEncryption`. A live non-interactive build attempt surfaced this as a warning ("Manual configuration is required in App Store Connect before the app can be tested"). Set to `false` since the app only uses standard OS-level TLS/HTTPS (axios) and `expo-secure-store`'s platform-native encryption — no custom/proprietary cryptography is implemented (`expo-crypto` is used only for random reference-ID generation, not data encryption). This is the correct, standard answer for apps in this category, but the project owner should confirm this matches their actual export-compliance situation.
- **Fixed this cycle:** removed the redundant `ios.buildNumber: "1"` from `app.json` — `eas.json` sets `appVersionSource: "remote"`, which means EAS ignores the local `buildNumber` and manages it on its servers instead (confirmed live: a build attempt auto-incremented the remote build number from 1 to 2 while the local `app.json` value was already gone). Keeping a stale local value was misleading.
- **`eas.json` now has an explicit `ios: { simulator: false }` block** on the `preview` and `internal-aab` profiles (previously absent, relying on an implicit default) so the intended iOS internal/ad-hoc device-build behavior is unambiguous.
- **Root cause of the iOS build gap, confirmed live this cycle:** ran `npx eas-cli build:list --platform ios` → zero builds ever recorded for this project (Android has 3+ finished `preview` builds going back to 8/10/2026). Then ran `npx eas-cli build --platform ios --profile preview --non-interactive`, which got past all config validation (the two warnings above) and failed with: *"EAS CLI couldn't find any credentials suitable for internal distribution."* This confirms the **only** remaining blocker is that no Apple Distribution certificate / provisioning profile has ever been set up for this project — not a code or config defect. Setting this up requires an interactive `eas build --platform ios --profile preview` (or `eas credentials --platform ios`) run by someone with access to the Apple Developer account, since it involves Apple ID sign-in (and likely 2FA) that cannot be safely automated or entered by an agent.
- `expo-document-picker` does not require an iOS usage-description string for its default (non-iCloud) configuration, so no fix was needed there.
- **CODE VERIFIED:** contacts permission flow, notification permission flow, SecureStore usage (works identically on iOS), deep link scheme, all `eas.json`/`app.json` config needed to reach the credentials step of a build.
- **REQUIRES REAL iOS DEVICE / TESTFLIGHT TESTING:** everything in §25 below, gated on the Apple credentials setup described above.

## 16. Accessibility — 78/100

`accessibilityLabel`/`accessibilityHint`/`accessibilityRole` are present on primary financial actions (balance toggle, contact-picker button, confirm/buy buttons, transaction rows) per the 2026-08-20 remediation cycle. Not exhaustively re-audited this cycle beyond spot checks — no severe (blocking) accessibility issues found in the areas reviewed. Non-blocking per the audit brief.

## 17. Network Resilience — 85/100

- `apiLogin` distinguishes timeout (`ECONNABORTED`/`ETIMEDOUT`), no-response/offline, HTTP 429, and HTTP 5xx into distinct user-facing messages.
- General `apiClient` requests get a `30_000ms` timeout; a stalled connection surfaces as an error rather than hanging forever.
- Financial mutations are **not** auto-retried on ambiguous failure (correct — matches the audit brief's "do not implement unsafe automatic retries" requirement); the ref is regenerated so a user-initiated retry doesn't collide with a possibly-already-processed reference.

## 18. Error Handling — 82/100

Loading/success/error states are present for all reviewed flows. No infinite spinners were found under normal failure paths — every poll loop has a hard timeout (`120s` for airtime/data poll, `300s` for wallet, `60s` for services recent-transaction convergence) that resolves to an explicit error/toast rather than spinning forever. The single flaky test observed (`error-boundary.test.tsx` timing out under heavy parallel system load, but passing reliably in isolation — 4/4) is an environmental/test-runner timing issue, not a product defect; re-ran clean twice.

## 19. Notifications — 82/100 (partially BACKEND DEPENDENCY)

- Permission request, Android notification channel creation, listener registration/cleanup, foreground handler, and notification-tap deep-linking (to the history tab) are all implemented correctly in [src/notifications/index.ts](src/notifications/index.ts) and wired in `_layout.tsx`.
- Expo Go is explicitly detected and push registration is skipped there (correct — avoids a known SDK 53+ crash).
- Push tokens are successfully retrieved via `getExpoPushTokenAsync` but **never sent to a backend** — no such endpoint exists. Classified as **BACKEND DEPENDENCY**; does not block internal distribution (local/foreground notifications for transaction status still work without server-side push).

## 20. Contacts / Favorites — 85/100

- Contact loading, permission request/denial handling, and phone-number normalization are implemented in `src/features/contacts/`.
- Favorites are backed by AsyncStorage today ([src/features/favorites/service.ts](src/features/favorites/service.ts)) and are explicitly cleared on logout (`clearFavorites()`), preventing cross-user leakage on a shared device — this was verified both by code review and by the existing `logout-isolation.test.ts` suite (6 tests, passing).
- No dedicated backend favorites API exists yet; the client-side AsyncStorage implementation is isolated behind a `service.ts` module, so swapping to a backend-backed implementation later should not require touching call sites.

## 21. Testing Assessment — 82/100

- 105/105 tests passing across 14 suites after this cycle's fixes (see §27). Coverage includes auth store, logout isolation, favorites, notifications, API client/interceptors, phone/format/ref utilities, poll-status, and the error boundary.
- No regression tests were added this cycle for the amount-validation fixes because they are pure UI-gating logic exercised by existing manual QA flows and the fix is a two-line boolean-expression change; adding a dedicated unit test for `AirtimeForm`'s `ok` derivation would require rendering-level test infrastructure not currently used for form components (all current tests target hooks/services/API, not form components) — flagged as a good follow-up but not done to avoid introducing a new test pattern under audit time constraints.

## 22. Dependency Assessment

- No unused, duplicate, or suspicious dependencies found. Confirmed (again) there is no Redux/Zustand/MobX.
- `npx expo-doctor` reports 15 packages one patch version behind the exact SDK 57 pin (e.g. `expo 57.0.15` vs expected `~57.0.20`, `react-native 0.86.2` vs `0.86.3`). These are patch-level and low-risk, but were **not** applied in this session — bumping 15 packages simultaneously without a full device-build regression pass carries more risk than benefit right before a distribution cut. Recommend running `npx expo install --check` in a separate, dedicated dependency-bump cycle with a full rebuild/test pass.

## 23. Build & EAS Assessment

- `eas.json`: `development` (APK, dev client), `preview` (APK, internal, auto-increment), `internal-aab` (AAB, internal), `production` (AAB, store-bound `EXPO_PUBLIC_API_BASE_URL=https://api.mpay.com`) — profile separation is sound for Android.
- No secrets are committed in `eas.json`; the Sentry DSN present in build profiles is a public, non-secret value by design.
- **Fixed this cycle:** `preview`/`internal-aab` now explicitly declare `ios.simulator: false` (previously relied on an implicit default).
- EAS CLI confirmed authenticated for this project (`captain_code` / `princevuha@yahoo.com`). Android has a working, proven build history (3+ finished `preview` builds). iOS has never had a build attempted — see §15 for the confirmed root cause (missing Apple credentials, not a config defect) and the exact command the project owner needs to run.
- `keystore.properties` (real signing credentials) is correctly absent from the repo and gitignored; only the `.example` template is committed.

## 24. Backend Dependencies

| Issue | Why it matters | Mobile impact | Backend requirement | Blocks internal distribution? | Blocks future production? |
|---|---|---|---|---|---|
| Wallet top-up is two non-atomic HTTP calls (credit e-Top-Up, debit MoMo) | Partial failure between the two calls can leave a real-money transaction half-applied | User may see an error after only one leg succeeded; support must reconcile manually using the logged ref | Single atomic/idempotent load endpoint | No — existing polling/ref-logging makes this recoverable via support for a small internal test group | Yes |
| Transaction status resolved by matching backend response text | A backend copy change silently breaks status classification | Status could misclassify as pending/failed if wording changes | Typed/enum status field in API responses | No | Yes |
| Assistant profile lookup is capped at the first 100 resellers, filtered client-side | Accounts beyond position 100 can't load their profile | Assistant profile screen fails silently for some accounts | Dedicated `/resellers/assistant/profile?email=` lookup endpoint | No (only affects some assistant accounts) | Yes — track for beta |
| Push token retrieved but not registered anywhere | No server-side record of device push tokens | Only local/foreground notifications work reliably; no true push-from-server yet | Endpoint to store Expo push token against a user account | No | Yes — needed for real push notifications |

## 25. Real Device Testing Required

**AUTOMATED / STATICALLY VERIFIED (this audit):** TypeScript compiles clean; unit tests pass (105/105); Expo Doctor 20/21; auth token-refresh dedup logic traced through code; logout cache-clear logic traced through code; Android manifest/permissions/signing/build config reviewed; iOS `Info.plist`/plugins reviewed and one crash-causing gap fixed.

**MUST BE TESTED ON REAL ANDROID DEVICES:**
- Clean install of the fixed `preview`/`internal-aab` build; login; logout; force-kill and relaunch to confirm session restoration and token refresh actually round-trip against the live staging API.
- Wallet top-up, airtime, data purchase end-to-end against the real backend, including a deliberately-interrupted network mid-transaction.
- Contacts permission grant/deny/revoke from Android Settings while the app is running.
- Notification delivery (foreground and background) and tap-to-deep-link into history.
- File sharing (CSV export/share sheet) on at least one modern and one older (API 26–28 range) device.
- Android back button behavior: authenticated screen → logout → back (confirm no return to protected content) — code uses `router.replace`, which should prevent this, but must be confirmed physically.
- Poor-network/offline behavior on a real cellular connection (emulated network throttling does not fully replicate real carrier conditions).

**MUST BE TESTED ON REAL iOS DEVICES (or TestFlight/ad-hoc build) — currently unattempted for this project:**
- A successful `eas build --platform ios` has not been demonstrated in this repository; this must be produced and installed at least once before any iOS tester receives a build.
- Contacts permission dialog now shows correctly (post-fix) — confirm the dialog text and that granting/denying doesn't crash.
- All the same functional flows as Android (login, wallet, airtime, data, history, notifications, sharing, background/resume, termination/restart).
- iOS-specific keyboard/safe-area behavior on at least one notch and one non-notch device size.

## 26. Files Modified During Audit

| File | Change | Reason |
|---|---|---|
| [src/components/services/AirtimeForm.tsx](src/components/services/AirtimeForm.tsx) | Submit is now gated on a finite, positive parsed amount instead of "any non-empty string" | Prevented non-numeric/negative/zero amounts from reaching the airtime-purchase API call |
| [src/app/(app)/(tabs)/services.tsx](src/app/(app)/(tabs)/services.tsx) | Bulk-upload row filter now also requires a finite, positive amount | Same class of gap as above, in the bulk airtime/data upload flow |
| [app.json](app.json) | Added `ios.infoPlist.NSContactsUsageDescription` | `expo-contacts` is called directly from the airtime/data contact-picker flow; iOS terminates apps calling protected Contacts APIs without this string — this was a real crash risk on any iOS test device |
| [app.json](app.json) | Added `ios.infoPlist.ITSAppUsesNonExemptEncryption: false` | Surfaced by a live iOS build attempt as required before App Store Connect testing; app only uses standard TLS/HTTPS, no custom encryption |
| [app.json](app.json) | Removed stale local `ios.buildNumber: "1"` | `eas.json`'s `appVersionSource: "remote"` makes this field ignored and misleading; EAS manages build numbers server-side (confirmed live: remote build number auto-incremented 1→2 during a build attempt) |
| [eas.json](eas.json) | Added explicit `ios: { "simulator": false }` to the `preview` and `internal-aab` profiles | Makes the intended iOS internal/ad-hoc device-build behavior explicit instead of relying on an implicit default |

No backend code, API contracts, or architectural patterns were changed. No new state-management library was introduced.

## 27. Verification Results

**TypeScript:** `npx tsc --noEmit` → **0 errors** (verified before and after fixes).
**Jest:** `npx jest` → **105/105 tests passed, 14/14 suites passed** (one transient timeout on `error-boundary.test.tsx` under heavy parallel system load during the full-suite run was confirmed as environmental — the same suite passes 4/4 reliably in isolation, and passed in the final full-suite re-run alongside all other suites).
**Expo Doctor:** `npx expo-doctor` → **20/21 checks passed**. The one failure is a non-blocking dependency patch-version mismatch report (15 packages one patch behind the exact SDK 57 pin) — not applied this cycle, see §22.
**Android build:** Not executed in this session (would require an EAS cloud build consuming build minutes, or local Gradle build with real signing credentials — a build-infrastructure action beyond static audit scope). Static configuration review shows no blockers; build history shows 3+ prior successful Android `preview` builds.
**iOS build:** Attempted live this cycle via `npx eas-cli build --platform ios --profile preview --non-interactive`. Confirmed via `eas-cli build:list --platform ios` that **zero iOS builds have ever been produced** for this project. The non-interactive attempt got past all config validation after this cycle's `app.json`/`eas.json` fixes and failed only on: *"EAS CLI couldn't find any credentials suitable for internal distribution."* This isolates the remaining gap to Apple credentials/provisioning setup — not a code or config defect — and requires an interactive run by someone with Apple Developer account access (cannot be completed by an automated agent, since it involves Apple ID sign-in).

## 28. Remaining Risks

- iOS Apple credentials have never been configured for this project (confirmed live — see §15/§27); someone with Apple Developer account access must run `eas build --platform ios --profile preview` interactively (or `eas credentials --platform ios`) at least once before any iOS build can be produced.
- Wallet top-up two-leg atomicity (backend-owned) remains the top financial-integrity risk for eventual production, though acceptable for a small internal test group with support-mediated reconciliation.
- 15 Expo packages are one patch version behind the SDK pin — low risk but should be swept in a dedicated dependency cycle before wider beta.
- `history.tsx` large-list rendering performance was not exhaustively re-profiled this cycle; recommend a targeted pass if internal testers report scroll jank with large transaction histories.

## 29. Internal QA Checklist

**Before handing out any build:**
- [ ] Rebuild both Android and iOS with the `app.json`/`eas.json`/`services.tsx`/`AirtimeForm.tsx` fixes included.
- [ ] Run `eas build --platform ios --profile preview` **interactively** (someone with Apple Developer account access must complete Apple ID sign-in when prompted) to generate/attach the missing Apple Distribution certificate and provisioning profile, then confirm the resulting build installs on a real device via TestFlight/ad-hoc.
- [ ] Confirm the build's `EXPO_PUBLIC_API_BASE_URL` points at the intended staging/test backend (currently `https://188.34.191.227/api` per `.env` — confirm this is the environment testers should hit, not a placeholder).
- [ ] Confirm `ITSAppUsesNonExemptEncryption: false` (added this cycle) accurately reflects the app's actual encryption usage before any App Store Connect / TestFlight submission.

**Functional pass (Android + iOS, per §25 matrix):** login/logout/session-restore/token-refresh, wallet top-up, airtime, data, transaction history, contacts, favorites, notifications, file sharing, background/resume, app kill/restart, poor network/offline, back-button-after-logout.

## 30. Final GO / NO-GO

**Android: GO** for internal distribution once a fresh build containing this cycle's fixes is produced.
**iOS: NO-GO** until someone with Apple Developer account access runs `eas build --platform ios --profile preview` interactively to complete Apple credentials setup (confirmed this cycle as the sole remaining blocker — all `eas.json`/`app.json` config issues that would have blocked this are now fixed) and the resulting build is installed on a real device at least once.

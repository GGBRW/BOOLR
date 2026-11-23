# REEO platform builds

All versions share the **original interface** and the Vite `dist/`. There are no separate UI rewrites.

## Browser / Vercel

```sh
bun install
bun run build:web
bun run preview
```

Vercel reads `vercel.json` at the repository root. Connect the repository in your Vercel account to obtain an actual deployment URL. The build is static; Bun is used at build time, not as a serverless runtime. See [the complete Vercel setup](VERCEL.md) for dashboard settings, CLI deployment, security/caching policies, and verification.

## Windows, macOS, Linux

```sh
bun install
bun run desktop:dev
bun run desktop:pack
```

`desktop:dev` builds first and opens Electron; it does not run a second development UI. Packaged artifacts go to ignored `releases/`.

| Host    | Default artifacts           |
| ------- | --------------------------- |
| Linux   | AppImage and Debian package |
| Windows | NSIS installer              |
| macOS   | DMG and ZIP                 |

The manual **REEO desktop packages** GitHub workflow builds on all three operating systems and uploads artifacts. It does not publish a GitHub release or upload to any store. Cross-compiling every platform from Linux is not supported by this setup.

The renderer has `nodeIntegration: false`, `contextIsolation: true`, and `sandbox: true`. Only quit and development-tools IPC are exposed by the preload. Renderer storage is a localStorage-backed adapter, **not** a filesystem or shell bridge. Existing desktop save files must be imported.

For public distribution, configure code-signing certificates with your CI provider's secret store. macOS notarization requires Apple credentials; Windows signing requires an appropriate signing service/certificate. Do not put credentials in source files. Unsigned artifacts may trigger operating-system warnings. `CSC_IDENTITY_AUTO_DISCOVERY=false` in the sample workflow explicitly allows unsigned testing builds.

## Android

Install a current Android Studio/SDK and JDK supported by Capacitor 8 (JDK 21+), then:

```sh
bun install
bun run build
bun run mobile:add:android  # once, generates ignored android/
bun run mobile:android
bunx cap open android
```

Use Android Studio to select a device/emulator and build. For a local debug APK:

```sh
cd android
./gradlew assembleDebug
```

The generated APK is at `android/app/build/outputs/apk/debug/`. The manual mobile workflow also creates a debug APK. A Play Store release needs a release keystore, signed AAB, store listing, privacy/distribution review, and physical-device testing. The debug APK is not a production/store release.

## iOS / iPadOS

A **Mac with a compatible Xcode installation** is required:

```sh
bun install
bun run build
bun run mobile:add:ios  # once, generates ignored ios/
bun run mobile:ios
bunx cap open ios
```

Set the signing team and bundle identifier in Xcode before building to a real iPhone/iPad. The manual workflow builds an unsigned **simulator app**, not an installable/signed IPA. TestFlight and App Store distribution require Apple Developer enrollment, signing/provisioning, store metadata, and review.

The default bundle ID `app.reeo.logic` is a project default, not a claim that the identifier or domain has been registered. Change it before publishing under your account, and regenerate/sync the native projects if necessary.

## Icons and device verification

Source identity assets are in `public/brand/`; platform-sized rasters are in `assets/native/`. Electron uses the REEO icons. The mobile sync scripts run `bun run mobile:assets`, which applies REEO Android launcher/adaptive foreground assets and splash images, plus the iOS 1024px icon and splash images, instead of leaving Capacitor template branding. Review the generated assets on actual launchers/devices before publishing.

Automated viewport checks cover a phone at 390×844, a tablet at 800×1280, and a laptop at 1366×768, plus Chromium touch events. These checks are **not** certification on a physical A11 tablet or a substitute for Safari/WebKit, real-device, accessibility, or app-store testing. No physical A11 device was available in this environment.

## Related

- [Releasing](RELEASING.md) — versions, packaging, signing limits, and rollback.
- [Testing](TESTING.md#browser-and-device-matrix) — what is and is not certified.
- [Vercel](VERCEL.md) — browser deployment.

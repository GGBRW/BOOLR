# Security policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 2.x     | Yes       |
| 1.x     | No        |

REEO is a local-first static application. There is no REEO account service, database, or hosted collaboration server in this repository.

## Reporting a vulnerability

**Do not open a public issue for a security problem.**

Report privately through GitHub’s **Security → Advisories → Report a vulnerability** flow for this repository:

<https://github.com/abdou-da0wew/REEO/security/advisories/new>

If private advisories are unavailable, contact the maintainer [@abdou-da0wew](https://github.com/abdou-da0wew) through GitHub and ask for a private channel. Do not include exploit details in a public issue, discussion, or pull request.

Please include:

- affected version/commit or deployment URL,
- platform and browser,
- a minimal reproduction, ideally an exported `.board` or exact console command,
- impact and any known preconditions,
- whether the issue is already public.

Do not access other people’s data, run denial-of-service tests against public deployments, or modify repositories/systems you do not own. Use a local build.

## Scope

In scope:

- Board import/validation bypasses that lead to code execution, prototype pollution, unbounded resource use, or storage compromise.
- Stored/reflected script injection through component names, board fields, console output, chat, or translated strings.
- Storage-path traversal or reading/writing keys outside the REEO namespace.
- Electron renderer escape (enabling Node, bypassing `contextIsolation`/sandbox, arbitrary navigation, unrestricted `shell.openExternal`).
- CSP or header regressions that make the deployed app exploitable.
- Dependency vulnerabilities that are reachable in the shipped app.

Usually out of scope:

- The absence of a hosted collaboration server or authentication for a server you deploy yourself.
- Self-XSS that requires the victim to paste attacker code into their own DevTools.
- Denial of service from a board the user deliberately imports despite the documented limits.
- Missing code signing/notarization (documented release limitation).
- Browser/OS vulnerabilities, or issues only reproducible with modified app code.
- Reports that require physical access to an unlocked device.

The optional legacy WebSocket client has **no authentication or authorization**. A relay you expose publicly is your responsibility; REEO does not ship or operate one.

## Security model

- **Untrusted board data.** Imports are size/depth/field allowlisted and parsed as data, never executable constructor expressions. There is no `eval`/`new Function` in the typed runtime.
- **Local storage only.** Boards and saved components live in the origin’s `localStorage` under a restricted adapter. There is no cloud sync.
- **Restricted renderer bridge.** `window.require` exposes only a storage-shaped `fs` and an Electron devtools hook, not general Node modules. Electron runs with `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true`.
- **Navigation.** Electron blocks in-window navigation and opens only `https://` links externally; permission requests are denied.
- **CSP.** `vercel.json` sets a restrictive policy. Adding a new external host requires a reviewed change to that file.

## Handling and disclosure

Maintainers will aim to acknowledge a report within a few days and coordinate a fix and disclosure date. This is a volunteer project, so no response-time or bounty guarantee is made.

Please give us a reasonable window to fix the issue before publishing details. Credit is offered unless you ask to remain anonymous.

## Dependency updates

Dependabot monitors Bun dependencies and GitHub Actions weekly. Review and test updates rather than merging blindly; run `bun run check`, `bun run build:vercel`, and the e2e suite for runtime changes.

See [Contributing](CONTRIBUTING.md) for non-security bugs and [Support](SUPPORT.md) for usage questions.

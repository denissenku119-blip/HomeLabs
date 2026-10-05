<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- My Lab (real owned lab) is a Project-shaped record stored under `homelab-architect:mylab`, never in the project index; the builder takes a `storage` adapter so it can edit My Lab. Why: reuse all calculations/canvas while keeping My Lab and Projects fully separate.
- My Lab Lab Health / What to Check are derived on the fly by src/features/mylab/labHealth.ts from the existing calculation + analysis engines; nothing is persisted. Why: one source of truth, always current, no duplicate scoring.
- My Lab Plan Change: the Proposed Lab is a deep copy under `homelab-architect:mylab:proposal` edited via the builder storage adapter; only applyProposal() writes My Lab and appends to `homelab-architect:mylab:history`. Why: the real lab can never change by experimenting.
- All /app/my-lab/* pages are wrapped by the src/routes/app/my-lab.tsx layout gate (MyLabProGate) using the existing verified entitlement. Why: one gate for every My Lab page, no data touched for Free users.
- Report downloads (Project and My Lab) serialize the on-screen ReportPage DOM via src/features/report/reportExport.ts into a self-contained HTML file; in the native app it is written with Capacitor Filesystem and handed to the Share sheet, and Print falls back to this because the WebView cannot print. Why: one report source, no duplicate calculations, Android gets a useful outcome.
- Canvas pinch-zoom is handled in ArchitectureCanvas capture-phase pointer handlers sharing the +/− scale/pan state; a `homelab:canvas-pinch` window event cancels in-progress node drags. Why: two-finger gestures must never move nodes or create connections.
- Deleted project ids are tombstoned under `homelab-architect:project:deleted`; saveProject() ignores tombstoned ids and only an explicit backup restore (src/features/backup/backup.ts) clears them. Why: late autosaves or recovery must never resurrect a project the user deleted.
- Recovery after uninstall relies on the user-controlled, versioned backup file (src/features/backup), validated before an all-or-nothing restore that excludes the Pro flag. Why: app-private storage is not guaranteed to survive uninstall and there are no accounts/cloud; Pro comes only from Google Play.
- Expanded hardware entries (src/data/hardware/expanded.ts) use typicalPrice 0 ("price not provided") and typical/estimated power with notes; only published specs are entered. Why: no fabricated prices or exact wattages; reports flag missing prices as "More information needed".
- Report downloads are offline-only HTML (scripts/links/web fonts/url() stripped, images inlined, CSP default-src 'none'); native saves to Documents/HomeLab Architect, falling back to app storage + share sheet. Why: the file must open with no network and no app.

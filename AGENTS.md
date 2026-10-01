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

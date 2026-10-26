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


## KrishiConnect architecture
- Keep demo farmer data in the single `src/lib/kc-store.ts` local-storage store; why: prevent inconsistent booking and profile state across screens.
- Keep centre discovery in `src/routes/centres.index.tsx` and detail views at the sibling dynamic route; why: preserve `/centres/$id` navigation.
- Translate display text through the shared i18n layer while retaining canonical data values; why: language changes must not alter selections or stored data.
- Scope demo data storage by signed-in demo account and reject writes for other accounts; why: avoid mixing browser-local farmer records.

# PRACTICE — Working Agreement

These rules apply to every change made in this repository, by anyone working on it, including Claude.

## The rule

**Every change is committed, pushed, and documented in the repository.** No change stays local-only and none goes undocumented.

## Workflow for every change

1. **Make the change.** Keep one logical change per commit (a feature, a fix, a doc edit). Do not bundle unrelated work.
2. **Review before committing.** Run `git status` and `git diff`. Stage files by name rather than with `git add -A`, so nothing unintended is included.
3. **Document it.** Add an entry to [`CHANGELOG.md`](CHANGELOG.md) in the same commit as the change (see format below). If the change affects usage or setup, update [`README.md`](README.md) too. If it changes a requirement or a recorded decision, update [`SPEC.md`](SPEC.md) in the same commit, so the spec never describes behavior the code no longer has.
4. **Commit.** Use a clear, imperative message (see conventions below).
5. **Push.** Run `git push` to `origin` right after the commit. Confirm the push succeeded.
6. **Pull request and merge, only when the owner asks.** Pushing a branch does not change the live site, which is served from `main`. Open a pull request, and merge it into `main`, only when the owner asks for it, and merge through the pull request (merge commit). Never merge on your own initiative. After a pull request is merged, restart the working branch from the latest `main` before the next change, so the merged history is not reused.
7. **Report.** Tell the user what was committed and pushed (and merged, if asked), with the commit hash, and say clearly what is live and what is not.

If the push fails, report the error and stop. Do not force-push, and do not skip hooks.

## Commit message conventions

- First line: imperative mood, at most 72 characters, no trailing period. Example: `Add customer edit modal`.
- Use a prefix when it helps: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Add a body when the reason for the change is not obvious from the diff.
- Commits made with Claude's help end with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Changelog format

[`CHANGELOG.md`](CHANGELOG.md) lists entries newest first, grouped by date. Each entry states what changed and why it matters to a reader:

```
## YYYY-MM-DD

### Added | Changed | Fixed | Removed
- Short description of the change.

### Verification
- What was tested and how, and what could not be verified.
```

When several entries share a date, add a short topic in brackets after the date, for example `## 2026-10-09 (weather refreshed once a day)`. The `Verification` subsection is optional but expected when a change depends on something that is hard to test, such as an external service.

## Changes outside the repository

Some work happens outside the repo, for example in the Airtable base (tables, fields, interface pages) or in an Apify run. Document it in the same commit as the related code change:

- Record in [`CHANGELOG.md`](CHANGELOG.md) what was created or changed, where (base, table, run ID) and why.
- Record anything the page depends on in [`SPEC.md`](SPEC.md), including the date and result of a check such as the competitor-sale scrape.
- Never change customer data itself (for example satisfaction ratings) unless the owner asked for exactly that.
- If a tool cannot do exactly what was asked, say so plainly, do the closest thing, and state the difference in the report.

## Verifying a change

- **UI changes:** open `index.html` in a browser and check it at desktop and phone widths (for example 1400 px and 390 px), in Hebrew and in English: no console errors, no horizontal page scroll, no clipped fields.
- **External services (Airtable, Open-Meteo):** state which parts were verified against the live service and which only against mocked responses. If the working environment cannot reach the service (for example a network proxy returning 403), say so in the report and in `CHANGELOG.md`, and ask the owner to run the live check in a normal browser.
- Never claim something works live that was only tested with mocks.

## Exceptions: files that stay local

Some files are intentionally never pushed. They are excluded through `.git/info/exclude` (a local file that is not itself part of the repo), so they cannot be staged by accident.

| File | Reason |
|---|---|
| `SPEC.he.md` | Hebrew working copy of the spec. Only the English `SPEC.md` is published. |

Do not add secrets, credentials, personal customer data, or exported real-customer CSV files to the repository. The files in this repo may only contain mock data.

## Checklist

- [ ] Change is complete and does what was asked
- [ ] `git diff` reviewed, only intended files staged
- [ ] `CHANGELOG.md` updated (and `README.md` if usage changed, `SPEC.md` if a requirement changed)
- [ ] Checked as described in "Verifying a change", with live and mocked checks kept apart
- [ ] Work outside the repo (Airtable, Apify) documented
- [ ] Committed with a clear message
- [ ] Pushed to `origin`, and the push succeeded
- [ ] Pull request opened or merged only if the owner asked, and the report says what is live

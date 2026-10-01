# PRACTICE — Working Agreement

These rules apply to every change made in this repository, by anyone working on it, including Claude.

## The rule

**Every change is committed, pushed, and documented in the repository.** No change stays local-only and none goes undocumented.

## Workflow for every change

1. **Make the change.** Keep one logical change per commit (a feature, a fix, a doc edit). Do not bundle unrelated work.
2. **Review before committing.** Run `git status` and `git diff`. Stage files by name rather than with `git add -A`, so nothing unintended is included.
3. **Document it.** Add an entry to [`CHANGELOG.md`](CHANGELOG.md) in the same commit as the change (see format below). If the change affects usage or setup, update [`README.md`](README.md) too.
4. **Commit.** Use a clear, imperative message (see conventions below).
5. **Push.** Run `git push` to `origin` right after the commit. Confirm the push succeeded.
6. **Report.** Tell the user what was committed and pushed, with the commit hash.

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
```

## Exceptions: files that stay local

Some files are intentionally never pushed. They are excluded through `.git/info/exclude` (a local file that is not itself part of the repo), so they cannot be staged by accident.

| File | Reason |
|---|---|
| `SPEC.he.md` | Hebrew working copy of the spec. Only the English `SPEC.md` is published. |

Do not add secrets, credentials, personal customer data, or exported real-customer CSV files to the repository. The files in this repo may only contain mock data.

## Checklist

- [ ] Change is complete and does what was asked
- [ ] `git diff` reviewed, only intended files staged
- [ ] `CHANGELOG.md` updated (and `README.md` if usage changed)
- [ ] Committed with a clear message
- [ ] Pushed to `origin`, and the push succeeded

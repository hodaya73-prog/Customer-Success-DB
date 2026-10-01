# Changelog

All notable changes to this project are documented here, newest first. See [PRACTICE.md](PRACTICE.md) for how this file is maintained.

## 2026-10-01

### Added
- `mock-customers.csv`: 40 fictitious customers for the dashboard (30 active, 8 at risk of which 3 are inactive, 13 with open tickets). Emails use `example.com`; phone numbers are fictitious.
- `SPEC.md`: full product specification in English (Customer Retention Dashboard): scope, business definitions, data model, functional and non-functional requirements, acceptance criteria and recorded decisions. The Hebrew working copy is kept local and is not published.
- `PRACTICE.md`: working agreement. Every change is committed, pushed, and documented.
- `CHANGELOG.md`: this file.
- `README.md`: initial project description (first commit).

### Changed
- `SPEC.md`: defined the stored `lastProduct` keys (`entry`, `interior`, `safe_room`, `sliding`, `security`, `accessories`) and that import also accepts English or Hebrew labels.

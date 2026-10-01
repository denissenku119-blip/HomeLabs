# Complete localization audit and fix

## Scope
Localize every user-visible string while preserving the current interface, routes, data, calculations, connections, sharing, payments, and project behavior.

## Implementation
1. Inventory all visible text across pages, controls, dialogs, validation, notifications, accessibility labels, generated reports, hardware details, analysis findings, guides, legal content, feedback, sharing, and mobile-only states.
2. Replace hardcoded presentation text with keys through the existing `useI18n()` / `translate()` system. Keep stored IDs, enum values, project data, and business logic unchanged.
3. Expand the English source dictionary to cover the complete application, including parameterized messages and dynamic labels.
4. Give every selectable language a full dictionary with the exact same key set. Preserve existing correct translations and language names; add complete dictionaries for the 32 languages that currently fall back entirely to English.
5. Localize generated text at the display boundary so saved projects, reports, calculations, connections, and entitlements remain structurally unchanged.
6. Add an automated localization audit that checks dictionary parity, missing keys, unresolved keys, and likely hardcoded visible English.

## Validation
- Compare every selectable language against the English key set with zero missing keys.
- Check language switching on the home page, projects, workspace, hardware, connections, report, guide, settings, Pro upgrade, feedback, share, dialogs, and action/error states.
- Confirm routes, saved projects, reports, and connections behave unchanged.
- Run the project type check and production build, then review runtime errors.

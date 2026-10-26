# Krishi Connect Checkup

Audit and test my existing KrishiConnect website in both English and Hindi. Fix only confirmed bugs with minimal code changes.

Test these areas in BOTH languages:

Language switcher, page navigation, refresh, and language preference persistence.

Login, signup, farmer profile, logout, form validation, and CAPTCHA (if implemented).

All 10 states, 40 districts, dependent dropdowns, and procurement centre search/filtering.

Centre details, crop compatibility, available slots, booking creation, unique booking IDs, booking history, and status updates.

Dashboard, notifications, tracking, payments display, checklists, operator/admin dashboards, buttons, links, search, and empty/error/success states.

Hindi translation coverage: all headings, labels, buttons, placeholders, validation messages, dynamic messages, dates, and status labels must switch correctly. No untranslated English UI should remain in Hindi mode, except proper names, IDs, and user-entered data.

Verify that switching languages does not reset selections, duplicate bookings, corrupt data, or break functionality.

Execution rules:

First inspect the existing code and identify actual issues.

Run available build, lint, and automated tests. Add only lightweight tests if needed.

Fix only reproducible bugs; do not redesign the website or rewrite working components.

Do not add paid APIs, dependencies, backend services, or unrelated features.

Do not claim a feature passed unless it was actually tested. If browser testing is unavailable, clearly list the manual checks still required.

Finish with a concise report: PASS, FAIL/FIXED, and NOT TESTED for each area, in English.

Prioritize functionality, data consistency, and both-language coverage. Minimize changes to conserve Lovable credits.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://krishi-connect-checkup.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/efbc8be4-7d28-47ef-bf3a-2eb0e733ee6e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

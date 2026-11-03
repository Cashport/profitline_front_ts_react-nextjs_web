# Profitline Frontend — agent rules

## Every visible text in Spanish and English

The platform is bilingual (rule MOD-013 in the Cashport Brain). Read `docs/i18n/README.md` before
touching UI text.

- Never write user-visible text directly in a component. Add a key to the module's catalog in
  `src/i18n/messages/es/<namespace>.json` **and** `src/i18n/messages/en/<namespace>.json`, and
  render it with `useTranslations("<namespace>.<section>")` (or `getTranslator` outside React).
- Reuse `common` keys for generic actions, statuses and fields before creating new ones.
- Run `yarn i18n:check` before finishing; it must pass.

## Business terms come from the glossary, never invented

Rule MOD-014 in the Cashport Brain. Spanish and English business terms come from the Brain glossary
(`Cashport Brain/00-vision/glosario.md`) and its technical mirror `docs/i18n/glosario.md`; if the
two differ, the Brain wins.

- Translate the business concept as the accounts-receivable and collections market says it,
  never word for word.
- If a business term is not in the glossary, do not invent one. Stop and ask the product leaders
  how to name it in Spanish and English, giving its business context (what it is, who uses it,
  which screen) and a proposal with alternatives. Until they answer, use the proposal as
  provisional and list it in the PR description; it does not go to production undecided.
- Once decided, add it to both glossaries.

## URLs

Routes are English kebab-case. When renaming a route, add the old path to `legacy-routes.js` so
saved links keep working.

# beacon-health

`beacon-health` is an original clean-room TypeScript CLI for a synthetic, non-clinical appointment readiness beacon. It organizes fictional outreach tasks, transport needs, and reminder gaps for made-up appointment slots.

## Explicit Non-Regulated Disclaimer

This project is not medical advice, diagnosis, treatment, triage, billing support, clinical decision support, a diagnostic device, or a medical device. It is not HIPAA/PHI handling, not for clinical decisions, not care coordination for real patients, and must not be used with PHI, real patient data, credentials, scraped data, external services, or regulated healthcare workflows.

All data is synthetic and fictional. This implementation has no affiliation with any real company, healthcare provider, or YC.

## Requirements

- Node.js 20 or newer.
- No runtime dependencies.
- Development dependencies are limited to TypeScript and Node typings.

## Run

```bash
npm install
npm start
```

## Validate

```bash
npm test
npm run build
npm run validate
```

## What The CLI Shows

- A readiness score for each fictional appointment slot.
- A `ready`, `watch`, or `action` band based only on synthetic operational gaps.
- Open fictional outreach, transport, reminder, and paperwork tasks.
- An explicit non-regulated disclaimer in the command output.

## Project Structure

- `PLAN.md`: implementation plan created before implementation.
- `src/index.ts`: CLI report formatter.
- `src/readiness.ts`: deterministic non-clinical readiness scoring.
- `src/seed.ts`: synthetic appointment slots and tasks.
- `tests/beacon.test.ts`: Node test-runner validation for scoring, seed safety, and CLI disclaimers.
- `scripts/validate.ts`: extra repository validation for required files and disclaimers.

## Clean-Room Notes

The app is built only from the public task prompt and repository name. It does not use proprietary materials, real healthcare records, scraped datasets, external services, or credentials.

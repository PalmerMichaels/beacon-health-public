# Beacon Health

Beacon Health is an original clean-room TypeScript CLI for synthetic operations visibility. It models fictional queue load and staffing pressure without touching clinical, patient, billing, or regulated workflows.

## What It Does

- Reviews fictional operations queues and prints a non-clinical beacon.
- Includes synthetic staffing and queue pressure data in source files.
- Suggests non-clinical next actions for fictional teams.
- Includes tests and validation for scoring, sorting, synthetic data, and disclaimers.

## Usage

```bash
npm start
```

Node 22 executes the TypeScript files directly. No runtime dependencies are required, and `npm install` is not needed to run the app, tests, or validation.

## Validation

```bash
npm test
npm run validate
```

## Synthetic Data Statement

All data in this repository is synthetic seed data created for this demo. Queue names, staffing counts, targets, and fallback teams are invented. Do not enter or store real personal, patient, operational, confidential, or regulated data in this project.

## Clean-Room Disclaimer

This repository is a clean-room public implementation. It does not use proprietary code, private materials, confidential workflows, or non-public product details from any organization.

## Non-Regulated Disclaimer

This demo is not medical advice, not medical software, not clinical decision support, not patient triage, not diagnosis, not treatment guidance, not billing software, not HIPAA/PHI handling, and not a medical device. It is not care coordination for real patients and is not for clinical decisions.

## No-Affiliation Statement

There is no affiliation, endorsement, sponsorship, or connection between this public demo and any company, healthcare provider, payer, regulator, or proprietary product.

# 8thCPCSalary.com Next.js SaaS Platform

Production-oriented Next.js conversion of the original single-file calculator into a scalable salary, pension, DA and government employee finance platform.

## What is included

- Next.js App Router project structure
- TypeScript salary and pension calculation engines
- Premium homepage and 8th CPC calculator route
- Dashboard concept for saved reports, alerts and analytics
- Programmatic SEO pages for pay levels 1-18
- AdSense trust pages: About, Contact, Privacy, Terms, Editorial Policy, Disclaimer
- Prisma/PostgreSQL schema for users, calculations, subscriptions, alerts and content
- Auth.js and Razorpay-ready architecture placeholders
- Original SVG logo copied to `public/gemini-svg.svg`

## Run locally

This shell did not have `npm`/`npx` available, so dependencies were not installed here.

```bash
npm install
npm run validate:formulas
npm run typecheck
npm run build
npm run dev
```

## Environment

Copy `.env.example` to `.env` and fill values before enabling persistence, Auth.js or Razorpay.

## Scaling notes

- Keep calculator formulas in `src/lib` so they can be reused by UI, API routes, PDFs and tests.
- Use Prisma migrations for all schema changes.
- Add official circular data and state/department salary content through `ContentPage`.
- Gate premium features through `Subscription` records and Razorpay webhooks.

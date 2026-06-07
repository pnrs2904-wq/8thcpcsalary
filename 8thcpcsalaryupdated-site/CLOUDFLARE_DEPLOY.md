# Cloudflare Deploy

This project is prepared for Cloudflare Workers deployment using OpenNext for Cloudflare.

## Steps

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
copy .dev.vars.example .dev.vars
```

Fill the database, auth and Razorpay values before enabling live persistence or payments.

3. Preview in the Cloudflare Workers runtime:

```bash
npm run cf:preview
```

4. Deploy:

```bash
npm run cf:deploy
```

## Notes

- Cloudflare currently recommends OpenNext for full-stack Next.js on Workers.
- The older `@cloudflare/next-on-pages` path is not used.
- `wrangler.jsonc` points to `.open-next/worker.js`, which is produced by the OpenNext build.
- Static assets are cached through `public/_headers`.

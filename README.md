# Reward Me Website

Independent, locally stored copy of the public Reward Me website. It preserves
the captured routes, four language variants, responsive layout, theme switcher,
mobile navigation and contact form.

## Local development

```powershell
npm install
npm run dev -- --host 0.0.0.0 --port 4173 --strictPort
```

## Production

```powershell
npm run build
```

Deploy the repository to Vercel and configure the variables from `.env.example`.
Run `supabase/website_contact_submissions.sql` once in the intended Supabase
project before enabling the contact form in production.

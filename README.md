# DeliveryHub

DeliveryHub is a Next.js 16 application for customers, captains, and shipping
offices. It uses the App Router, Redux Toolkit for application data,
`next-intl` for request-scoped localization, and Tailwind CSS for styling.

## Project Structure

```text
public/                Static assets
src/
  app/                 Routes, route groups, layouts, and global styles
  constants/           Route names and stable application constants
  i18n/                Locale configuration and feature-based message catalogs
  lib/                 Framework-agnostic API, validation, and utility code
  modules/             Domain code grouped by auth, customer, and captain
    captain/
      api/              Captain API adapters
      data/             Mock and fallback domain data
      store/            Captain slices, thunks, and selectors
      types/            Captain domain models
  shared/              Reusable layout, providers, hooks, and UI
  store/               Root Redux composition and typed hooks only
```

Keep route files thin. Domain-specific components belong in `modules`, while
code reused by multiple domains belongs in `shared` or `lib`.

## Redux Toolkit

The root store is created by `src/store/index.ts` and mounted through
`src/shared/providers/store-provider.tsx`. The provider creates one store per
mounted application tree instead of exporting a mutable singleton.

Redux logic belongs to the domain that owns it. For example, captain state is
kept in `src/modules/captain/store/`, with API adapters, fallback data, domain
types, and selectors beside it. Components consume named selectors instead of
depending directly on the root state shape.

Use the typed `useAppDispatch`, `useAppSelector`, and `useAppStore` hooks from
`src/store/hooks.ts`. New domains should export their reducer to the root store
and keep actions, thunks, selectors, and models inside their own module.

## Localization

English and Arabic are configured in `src/i18n/request.ts`. The active locale
is stored in the `deliveryhub-locale` cookie. All message catalogs live in
`src/i18n/messages/` and are split by feature for straightforward updates.
Use `useTranslations` in Client Components and `getTranslations` in async
Server Components.

## Theme

The global theme provider is in `src/shared/providers/theme-provider.tsx`.
Light and dark mode are persisted in the `deliveryhub-theme` cookie and applied
to the root HTML element before the page is rendered.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Run the quality checks with:

```bash
npm run lint
npm run typecheck
npm run build
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

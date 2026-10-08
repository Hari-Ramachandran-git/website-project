# Om Muruga Sarees

A React saree store demo with heritage styling, a full catalogue, product pages, wishlist, cart and simulated checkout. **The frontend runs independently with local mock data. No backend, API keys or environment variables are required.**

## Run locally

Use Node.js 22.12+ (Node 24 LTS recommended).

```sh
cd frontend
npm ci
npm run start
```

Open **http://localhost:5173**. From the repository root you can also run `npm run install:frontend` followed by `npm start`.

## Deploy the frontend on Vercel

Import this repository into Vercel and use:

| Setting | Value |
| --- | --- |
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js | 24.x |
| Environment Variables | None |

`frontend/vercel.json` includes the build settings and SPA rewrite. This lets direct links and refreshes work on `/sarees`, product details, `/wishlist`, `/our-story` and unknown-page routes. This matches the [official Vercel Vite SPA guidance](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas).

Alternatively, keep Vercel's Root Directory at the repository root: the root `vercel.json` installs/builds only `frontend` and serves `frontend/dist`. Use one of these configurations; do not enter the frontend-specific commands while selecting the repository root.

To deploy using an already installed Vercel CLI:

```sh
cd frontend
vercel
```

These files prepare the project for hosting; they do not publish a deployment automatically.

## Mock data and interactions

- The catalogue lives in **`frontend/src/data/products.json`**. Edit this file to change names, prices, stock or images.
- **`frontend/src/mock-store.js`** handles checkout and newsletter simulation in the browser. It makes no network requests.
- Cart and wishlist persist in localStorage. Stock is a per-order demo limit, not inventory tracking.
- Checkout validates delivery inputs and computes totals from the mock catalogue. It briefly simulates loading, then shows a demo receipt and clears the bag.
- Only the latest receipt is saved under `oms-last-demo-order`; customer names, emails, phone numbers and addresses are not persisted. Use sample details when trying checkout.
- Newsletter signup validates the input and stores only a `joined` flag under `oms-demo-newsletter`. Email addresses are not saved and no emails are sent.
- No payments are collected and no orders are shipped. All products, prices, policies and photography are illustrative.
- Browser storage restrictions do not prevent the simulated interactions; persistence depends on browser permissions.
- Images are served locally as optimized WebP files. Google Fonts is optional; local font fallbacks work if it is unavailable.

## Pages and UX

- `/` — home
- `/sarees` — full catalogue with search, filters and sorting
- `/sarees/1/the-kumkum-silk` — example product page; every saree has its own URL
- `/sarees?category=Kanchipuram` — collection filter
- `/sarees?occasion=Wedding` — wedding edit
- `/wishlist` — saved favourites
- `/our-story` — brand story

Included: sticky navigation, mobile menu, live search suggestions, mobile filter sheet with draft selections and result counts, mobile purchase bar, cart-removal undo, checkout breakdown and retained form fields, accessible dialogs and browser Back scroll restoration.

## Verify and preview the build

```sh
cd frontend
npm test
npm run build
npm run preview
```

`dist` is the complete static deployment artifact. With the frontend running, optional browser tests are available with `npx playwright test`.

From the repository root, `npm run preview:standalone` creates `artifacts/preview.html`, a self-contained preview. It uses hash routing and supports mock checkout without a server.

## Optional .NET backend

The original ASP.NET Core **.NET 10** API remains under `backend/` for future integration. It is not imported, called or deployed by the frontend. Its separate catalogue is `backend/Data/products.json`.

```sh
dotnet run --project backend
```

The API runs at `http://localhost:5080` and exposes `/api/health`, `/api/products`, `/api/products/{id}`, `/api/collections`, `/api/orders` and `/api/newsletter`. Its own demo data is written to `backend/Data` and excluded from Git. To verify it separately with the API running, use `npm --prefix backend test`. Connecting it to the frontend later requires replacing the mock adapter and configuring an API URL/proxy.

## Layout

```text
frontend/
  src/data/products.json   Independent mock catalogue
  src/mock-store.js        Local checkout/newsletter adapter
  src/                     React UI, routing, styling and tests
  public/images/           Local demo photography
  vercel.json              Deploy with Root Directory = frontend
backend/                   Optional .NET API
vercel.json                Alternative repository-root deployment
scripts/                   Standalone preview and optional API checks
```

Photography prompts are recorded in [frontend/public/images/PROMPTS.md](frontend/public/images/PROMPTS.md).

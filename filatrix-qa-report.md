# Filatrix — Debug & QA Report

**Target:** https://filatrix.netlify.app/
**Backend:** https://filatrix-backend.onrender.com/api (Node/Express + MongoDB, on Render)
**Date:** 11 September 2026
**Method:** Live browser session against the deployed site (desktop 1440×900 and mobile 375×812, console, network and resource-timing instrumentation) plus a full read of the shipped production bundle — 593 KB across 12 JS files, all retrieved and analysed.

---

## 1. Executive summary

Filatrix is an Angular 17+ standalone-component SPA (esbuild, Angular Material, signals, lazy routes) on Netlify, backed by a Node API on Render. The code is well organised — guards on nearly every protected route, a clean HTTP interceptor, tidy component structure. The defects are not sloppiness; they are **missing halves of features** and **no handling for anything going slowly or wrong**.

The headline problem is measured, not inferred:

> **On a cold load, `/products` showed nothing at all for 41 seconds** — blank content area, no spinner, no skeleton, no message — then rendered normally. In an earlier load the same page sat on a spinner for over 55 seconds and only recovered when I clicked something. A first-time visitor sees a broken site.

Behind that, three issues stop the product working as a business:

1. **Orders can never leave "pending"** — no component anywhere calls an order-status update, and there is no admin order screen.
2. **Checkout takes no payment** — "Place Order" creates the order directly; the bundle still carries *"Payment integration with Stripe coming soon."*
3. **The upload the homepage sells doesn't exist** — the landing page promises "Send us your STL or OBJ file"; the seller product form has no file or image input at all, yet the order screen has a "mark downloaded" action.

**Counts:** 4 critical, 9 high, 8 medium, 5 low. One hypothesis from static analysis was **tested and disproven** (see D-1) — worth noting, because it is the reason the rest of these were tested rather than just asserted.

---

## 2. How to read the evidence tags

| Tag | Meaning |
|---|---|
| **LIVE** | Reproduced in a browser against the deployed site. Measurements are real. |
| **CODE** | Read from the shipped production bundle; the fragment is quoted. The runtime path was not executed. |
| **NEEDS-CONFIRM** | Depends on server behaviour I could not reach without credentials. A hypothesis to test, not a confirmed defect. |

**Not covered.** No test credentials were supplied, so nothing behind login was exercised: cart contents, checkout, orders, wishlist, profile, and all seller and admin screens are CODE-only. Section 8 lists what to run next.

---

## 3. Architecture as built

**Client:** Angular 17+ standalone components, esbuild, Angular Material + CDK, Tailwind utility classes, signals for state, `loadComponent` lazy routes, `provideZoneChangeDetection({eventCoalescing:true})`. Critters inlines critical CSS at build time.

**Auth:** JWT from `POST /api/auth/login`, stored in `localStorage.token`; the full user object including `role` in `localStorage.user`. A functional interceptor attaches `Authorization: Bearer <token>` and, on any 401, calls `logout()` and navigates to `/auth/login`.

**Route map** (decompiled from the route table):

| Path | Guard | Component |
|---|---|---|
| `/` | — | Landing |
| `/products` | — | Marketplace |
| `/product/:id` | — | ProductDetail |
| `/auth/login`, `/auth/register` | guest-only | Login, Register |
| `/cart` | **none** ⚠ | Cart |
| `/checkout` | auth | Checkout |
| `/orders`, `/order/:id` | auth | Orders, OrderDetail |
| `/wishlist` | auth | Wishlist |
| `/seller/dashboard\|products\|products/new\|products/edit/:id\|orders` | isSeller | Seller screens |
| `/admin/dashboard\|products\|users` | isAdmin | Admin screens |
| `/profile` | auth | Profile |
| `**` | — | `redirectTo: ""` ⚠ |

---

## 4. Critical

### C-1 — `/products` is blank or spinning for 40–55 seconds on a cold load  ·  LIVE

**Measured, two separate failures on the same page.**

*Load A (spinner never resolves).* Opened `/products`. The app issued `GET /api/products?page=1&limit=12` at t=7.2 s. At **t=62 s** the DOM still held one `<mat-spinner>` and zero product cards. A manual `fetch` of the identical URL from the page returned **HTTP 200 with valid product JSON in 1.5 s**, so the API was healthy the whole time. Clicking the search button re-ran the request and six cards rendered immediately.

*Load B (blank outlet).* Reloaded `/products` at 1440×900. At **t=38.5 s**: `document.querySelector('app-marketplace')` was **null** — the routed component had never mounted, `<main>` was empty, no spinner, no API call yet. Resource timing showed the marketplace chunk arriving in 156 ms but its six dependency chunks each taking **13.6–13.9 s**. The component finally mounted and fired its API call at **t=41.6 s**; cards rendered by t=72 s.

**Root cause — three compounding gaps:**

1. **No route-level loading UI.** Angular's `loadComponent` leaves the router outlet empty while lazy chunks download. For 41 seconds the user saw a header, a footer, and nothing in between. There is no `NavigationStart`/`NavigationEnd` progress bar and no skeleton.
2. **No HTTP timeout or retry.** `loadProducts()` subscribes with no `timeout()` operator. If the request stalls — Render's free tier idles a service after ~15 minutes and takes tens of seconds to wake — neither `next` nor `error` ever fires and the spinner runs forever (Load A). The user's only recovery is to click something at random.
3. **Slow chunk delivery.** 13.9 s for a 19 KB chunk points at a cold Netlify edge or a throttled connection; either way nothing in the app degrades gracefully around it.

**Fix.**
```ts
// 1. Route-level progress: a top progress bar driven by router events.
// 2. Every API call gets a deadline and a retry:
this.productService.getProducts(params).pipe(
  timeout(15000),
  retry({ count: 2, delay: (_, n) => timer(1000 * 2 ** n) })
).subscribe({ next: ..., error: () => this.error.set(true) });
// 3. Add <link rel="modulepreload"> for the chunks of the most-visited routes.
```
Add a distinct error state with a Retry button (see H-1), and if the API is on Render's free plan, either upgrade it or add an explicit "waking the server up…" message after 3 seconds so the delay is legible rather than looking like a broken page.

---

### C-2 — Any redeploy permanently blanks open tabs (stale-chunk trap)  ·  LIVE

**Proof, run against production:**
```js
const r = await fetch('/chunk-OLDHASH1.js');
// → status 200, content-type: text/html; charset=UTF-8
// → body: "<!doctype html>\n<html lang=\"en\" data-critters-container>…"
await import('/chunk-OLDHASH1.js');
// → TypeError: Failed to fetch dynamically imported module
```

Netlify's SPA fallback serves `index.html` with **HTTP 200** for *every* unmatched path, including `.js` files. Chunk filenames are content-hashed, so the moment you deploy, the old hashes stop existing.

**Impact.** Every user with the app open when you deploy — and every user whose browser holds a cached `index.html` — requests a chunk filename that no longer exists, receives HTML with a 200 status, fails to parse it as a module, and the route silently never renders. Angular emits a `NavigationError`; nothing in the app handles it, so the user is left on a permanently blank page with no error and no prompt to reload. This is the single most likely cause of "it works for me but a user says the page is blank" reports.

**Fix.** Two parts, both required.
```toml
# netlify.toml — stop the SPA fallback swallowing asset 404s
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  # exclude real assets so a missing chunk returns a true 404
  force = false
```
Simplest reliable form: give built assets their own directory (`/assets/*`, `/js/*`) and only apply the `/*  →  /index.html  200` rule to paths that are not under it. Then handle the error in the app:
```ts
router.events.subscribe(e => {
  if (e instanceof NavigationError && /dynamically imported module/.test(String(e.error))) {
    window.location.reload();   // pick up the new deploy
  }
});
```

---

### C-3 — Orders can never progress past "pending"  ·  CODE

There is no order-status transition anywhere in the client. `SellerOrdersComponent` makes exactly one call and renders:
```
this.orderService.getSellerOrders().subscribe({next:e=>{…},error:()=>this.loading.set(!1)})
```
No status control, no update call. The admin area has only `dashboard`, `products` and `users` — no order management route exists. `OrderDetailComponent` offers only `markDownloaded(orderId, itemId)`.

Meanwhile the data model clearly supports a lifecycle: order detail recognises and styles `pending`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`.

**Impact.** Every order sits at `pending` forever. Buyers see a permanently pending order, sellers cannot mark anything shipped, nobody can cancel. Five of the six status styles are dead code. Combined with C-4, an order can never reach `paid` either — by any path in the system.

**Fix.** Add `PATCH /api/orders/:id/status` with server-enforced transition rules (seller: `shipped`/`delivered` on own orders; buyer: `cancelled` while `pending`; admin: any), then wire a status control into the seller order row and a "Cancel order" action on `/order/:id`. Guard each transition with a confirmation and a legal-transition check, not a free dropdown.

---

### C-4 — Checkout creates orders without taking payment  ·  CODE

`CheckoutComponent` validates six shipping fields, then calls `orderService.createOrder(this.shippingAddress)` and navigates to the order. No payment step, no payment method, no amount confirmation. Strings shipped in production:
```
"Payment integration with Stripe coming soon."
'For demo purposes, clicking "Place Order" will simulate a successful payment.'
```

**Impact.** If this is live, orders enter the system unpaid, the admin dashboard's `totalRevenue` is fiction, and sellers see "earnings" never collected. If it is a demo, the caption is far too quiet for something that looks exactly like a real checkout.

**Fix.** Integrate the payment provider and create the order only on a confirmed payment intent — or, if this is deliberately a demo build, put an unmissable banner on checkout and suppress the revenue figures on both dashboards so they cannot be mistaken for money.

---

## 5. High

### H-1 — Every API failure is silent, and an error looks identical to "no results"  ·  CODE + LIVE
Eight components swallow errors with no user-facing message:

| Component | Handler |
|---|---|
| Marketplace | `error:()=>{this.loading.set(!1)}` — falls through to the empty state |
| Orders, Seller orders, Seller dashboard | `error:()=>this.loading.set(!1)` |
| Admin dashboard, Admin users (load), Admin products (load) | `error:()=>this.loading.set(!1)` |
| Wishlist (load) | `error:()=>this.loading.set(!1)` |

Admin role-change and status-toggle have **no error callback at all**.

The marketplace consequence is the worst: when the API errors, the spinner clears and the page displays *"No products found — Try adjusting your filters or search terms."* A visitor is told, in confident product copy, that the catalogue is empty. Every dashboard renders as all-zeros when the backend is unreachable, reading as "you have no sales" rather than "we couldn't load your sales".

**Fix.** Give each component a real error state — message plus Retry — distinct from its empty state, and never let an error fall through to empty-state copy. Add error callbacks to the admin mutations that revert the optimistic UI.

### H-2 — Mobile layout is broken at 375 px  ·  LIVE
Screenshot at 375×812 on `/products` shows, in one viewport:

- The brand mark is **clipped at the left edge** (`vi◖ Filatrix`) — the header overflows horizontally.
- The Material floating labels **overlap their own values**: "Category" sits on top of "All Categories", "Sort By" on top of "Newest", the "Search products…" label across the input. This is the classic symptom of Tailwind's preflight reset fighting Angular Material's MDC form-field styles, and both are present in the bundle.
- The search button label is clipped to `se:`.
- The "Add to Cart" icon overlaps its own text (`sh↓ Add to Cart`).
- The content column renders roughly 240 px wide inside a 375 px viewport, leaving a dead gutter, with a large empty band below the fold.

**Fix.** Scope Tailwind's preflight away from Material components (or disable preflight and use a targeted reset), then re-test every form field at 375 px. Add `min-width: 0` on the flex children in the filter row so they shrink rather than overflow.

### H-3 — `/cart` has no guard and hangs for a minute when logged out  ·  LIVE + CODE
`/cart` is the only protected-looking route without `canActivate`, while `/checkout`, `/orders`, `/wishlist`, `/profile` and all of `/seller` and `/admin` have one. `CartComponent` calls `cartService.getCart()` on init, which requires a token.

**Reproduced:** with `localStorage.token === null`, opened `/cart`. The page rendered the "Shopping Cart" heading with an **infinite spinner** and stayed on `/cart`. The `GET /api/cart` XHR did not resolve until **t≈60 s**, returned `401 {"message":"Not authorized, no token"}`, and only then did the interceptor bounce to `/auth/login`. For a full minute the user stares at a spinner on a page they were never allowed to see.

**Fix.** Add the auth guard to `/cart`, matching its siblings, so the redirect is instant and no request is made. (If an anonymous cart is wanted, build it deliberately against local storage.) The timeout work in C-1 covers the hang itself.

### H-4 — Role gating derives from client-editable storage  ·  CODE · NEEDS-CONFIRM
```
loadUserFromStorage(){let t=localStorage.getItem("token"),e=localStorage.getItem("user");
  t&&e&&this.currentUserSignal.set(JSON.parse(e))}
isSeller(){let t=this.currentUserSignal();return t?.role==="seller"||t?.role==="admin"}
isAdmin(){return this.currentUserSignal()?.role==="admin"}
```
The `isAdmin` guard consults only this signal. Any logged-in buyer can edit `localStorage.user`, set `role:"admin"`, reload, and reach `/admin/users` — which offers "change role to Admin" and "deactivate user".

Whether this is a full privilege escalation or a cosmetic one depends entirely on whether the API re-derives the role from the JWT. **This is the single most important thing to verify** (procedure in section 8). If `GET /api/admin/users` trusts the request rather than the token's claims, any registered user can take over the platform.

**Fix.** Server-side: every `/api/admin/*` and `/api/seller/*` handler must read the role from verified JWT claims or re-load the user by the token's subject — never from the request. Client-side: treat guards as UX only and derive the role from token claims rather than a separate mutable object.

### H-5 — `returnUrl` is set by the guards and never read by the login page  ·  CODE
Both guards preserve the destination:
```
i.navigate(["/auth/login"],{queryParams:{returnUrl:t.url}})
```
`LoginComponent` ignores it and hardcodes `this.router.navigate(['/'])`.

**Repro.** Logged out, open `/checkout` → redirected to login with `?returnUrl=/checkout` → log in → land on the homepage with an abandoned cart and no explanation. Every deep link into a protected page leaks the same way.

**Fix.**
```ts
const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
this.router.navigateByUrl(returnUrl);
```
Validate that it is a relative path first, so it cannot become an open redirect.

### H-6 — The product form has no file or image upload  ·  CODE + LIVE
`ProductFormComponent` collects title, description, price, category, tags, **file type (STL/OBJ/Both)**, and width/height/depth. There is no image field and no file input — it asks the seller to declare a file type for a file it never accepts.

Confirmed live in the API response: `"previewImages":[]` on the seeded products, and the marketplace renders a grey "3d" placeholder where every product image should be. Meanwhile `OrderDetailComponent` calls `markDownloaded(...)` and the homepage promises "Send us your STL or OBJ file."

**Fix.** Add image upload (or at minimum an image-URL field, matching how Profile handles avatars) plus an STL/OBJ upload to object storage, with downloads served as signed, expiring URLs gated on order ownership and paid status.

### H-7 — Landing copy describes a different business from the one built  ·  LIVE
The homepage reads as a **print bureau**: "Premium 3D printing — in-house manufacturing, custom designs, guaranteed quality", "Every print is produced in our own facility … no third-party outsourcing", "quality prints delivered to your door."

The application is a **seller marketplace**: users self-register as sellers, list their own products (live data shows a product by seller "Tata 3d"), buyers add to cart and then *mark items downloaded*. The `<meta name="description">` contradicts the visible copy with "Buy and sell 3D printed objects."

**Impact.** Visitors arrive expecting to upload a design and receive a printed part, and find a catalogue of other people's listings and no upload button (H-6). This mismatch will cost more conversions than any single bug here.

**Fix.** Pick one model and rewrite the landing page and meta description to match. If both are intended, give the homepage two distinct entry points and actually build the custom-print flow.

### H-8 — Deleted or unavailable products are silently priced at zero  ·  CODE
Cart and checkout share the same defaulting:
```
this.items().reduce((t,o)=>t+(o.product?.price||0)*o.quantity,0)
```
If a product in a cart has been deleted, rejected by an admin, or fails to populate server-side, `o.product` is null and the line contributes **0** rather than raising an error. A cart can show a plausible subtotal that omits an item's cost, and checkout submits against it.

**Fix.** Treat a null product as an error: drop the line with "This item is no longer available" and block checkout until the cart is clean. Never let a missing price become zero. Server-side, always recompute the order total from current product records at creation time.

### H-9 — No 404 page: unknown URLs return 200 and silently land on the homepage  ·  LIVE
```
GET /this-page-does-not-exist-12345  → 200, app shell, router lands on "/"
GET /robots.txt   → 200, text/html (the app, not a robots file)
GET /sitemap.xml  → 200, the app
```
Netlify's SPA fallback plus `{path:"**", redirectTo:""}` means every wrong URL is a soft-404. A user with a stale link is teleported to the homepage with no explanation; a deleted product's URL quietly becomes the homepage; and search engines see 200s for every nonexistent path. This is also the enabling condition for C-2.

**Fix.** A `NotFoundComponent` at `**` that explains what happened and offers search and `/products`. Add a real `robots.txt` and `sitemap.xml` to the publish directory, served ahead of the fallback rule.

---

## 6. Medium

**M-1 — Missing security response headers.** `LIVE` — Netlify serves `strict-transport-security` and nothing else. **No `Content-Security-Policy`, no `X-Frame-Options` / `frame-ancestors`, no `X-Content-Type-Options`, no `Referrer-Policy`, no `Permissions-Policy`.** With no frame protection the site can be iframed, and the admin controls that fire on a single click with no confirmation (M-8) are a ready-made clickjacking target. Add a `netlify.toml` `[[headers]]` block; this is a ten-minute fix.

**M-2 — Destructive admin actions have no confirmation and no error feedback.** `CODE`
```
changeRole(e,n){let o=n.target.value;this.adminService.updateUserRole(e,o)…}
toggleStatus(e){this.adminService.toggleUserStatus(e)…}
```
Both fire on the raw event, with "Admin" in the dropdown. A scroll wheel over a focused `<select>` instantly promotes someone or deactivates an account, with a 2-second snackbar as the only trace. **An admin can demote or deactivate themselves and permanently lose access** — there is no recovery path in the product. Add confirmation dialogs naming the user and the change, block self-demotion and self-deactivation on both sides, refuse to remove the last admin, and add an audit log.

**M-3 — `environment.production = false` shipped to production.** `CODE` — the bundled environment object is `{production:!1, apiUrl:"https://filatrix-backend.onrender.com/api"}`; the build used the development environment file. Fix `fileReplacements` in the production configuration and verify the deployed bundle reports `production: true`.

**M-4 — JWT and full user object in `localStorage`.** `CODE` — readable by any script on the origin, so one XSS (a malicious product title, the free-text avatar URL in M-7) yields complete account takeover, and the token cannot be revoked server-side. The stored `role` is also what drives the guards in H-4. Prefer an `httpOnly; Secure; SameSite=Strict` refresh cookie with a short-lived in-memory access token.

**M-5 — Any registered user can make themselves a seller.** `CODE` — the registration form offers `buyer` and `seller` and posts the choice straight to `/api/auth/register`. No verification, no approval. Admin product approval is the only backstop, and the admin products screen has no delete and no bulk tools, so a spam run is cleared one click at a time. Register everyone as `buyer`, add a seller application with email verification and admin approval, and hard-reject any other role in the registration payload server-side. **Also verify the server rejects `role:"admin"` here.**

**M-6 — No stock or quantity control.** `CODE` — the product page has no quantity selector (`addToCart(id, 1)` only). In the cart the decrement is correctly guarded (`t.quantity>1`, disabled at 1) but the increment has **no upper bound and no stock check**; a buyer can order 9,999 of a one-off. Add a quantity input, enforce `min 1 / max stock`, and re-validate at order creation.

**M-7 — Weak account security.** `CODE` — registration enforces only "all fields non-empty" and password ≥ 6, with no confirm field, no strength rule and no real email validation. `ProfileComponent` edits exactly two fields, `name` and `avatar` — **no password change, no email change**, and there is no forgot-password route anywhere in the route table. `avatar` is an unvalidated free-text URL rendered as an image, which leaks viewer IPs to any host the user names and risks stored injection.

**M-8 — Search only fires on Enter or button click.** `CODE` — no debounce, no input-triggered search, no loading indicator while results load. Typing a query then clicking a category filter loses the typed text. Add `debounceTime(300)`, a skeleton state, and preserve the term across filter changes — the component already uses `queryParamsHandling:"merge"`, so the plumbing exists.

---

## 7. Low

**L-1 — Material icon ligatures are read aloud by screen readers.** `LIVE` — the accessibility tree of the homepage reads `img "view_in_ar"`, `img "precision_manufacturing"`, `img "upload_file"`, `img "verified"`, `img "bolt"`. A screen reader announces "view underscore in underscore a r" for your logo. Add `aria-hidden="true"` to decorative `<mat-icon>`s and `aria-label` to meaningful ones.

**L-2 — Login form fields expose no accessible name in the tree.** `LIVE` — `/auth/login` reads as bare `textbox type="email"` and `textbox type="password"` with no name, and the password-visibility toggle is an unnamed `button`. Verify the `mat-label` associations and add `aria-label` to the toggle.

**L-3 — The header shows "Login" and "Sign Up" while you are on the login page.** `LIVE` — minor, but it makes the current location ambiguous. Suppress or mark the active one.

**L-4 — Currency is hardcoded `"$"` with inconsistent precision.** `CODE` — `"$" + v.toFixed(2)` in the wishlist and order detail, `toFixed(0)` on the seller dashboard. No `CurrencyPipe`, no locale, no per-product currency. Fix now while it is small.

**L-5 — Order numbers are the last 8 characters of a Mongo ObjectId.** `CODE` — not human-readable, not collision-safe when read over the phone, not searchable. Issue a sequential prefixed number (`FLX-2026-00417`) server-side. Snackbar durations are also inconsistent (2000 ms vs 3000 ms for equivalent messages) — standardise in one helper.

---

## 8. Disproven — and why it matters

**D-1 — "The 401 interceptor eats the login error message."** `TESTED, FALSE`
Static analysis suggested a real bug: the interceptor is global and unconditional —
```
r.status===401 && (e.logout(), i.navigate(["/auth/login"]))
```
and `logout()` itself navigates to `/`. A failed login returns 401, so the chain should have destroyed and recreated `LoginComponent`, wiping its error signal before the user could read it.

**I tested it.** Submitted `qa.claude.test@example.com` with a wrong password and sampled the DOM every 600 ms for 5.4 seconds: `"Invalid credentials"` appeared immediately in `.error-message`, persisted for the whole window, and the path stayed on `/auth/login` throughout. No navigation occurred. The bug does not exist.

Worth one line of follow-up anyway: a 401 from the *login* endpoint still triggers a global `logout()` side-effect, which happens to be harmless today only because the guest guard keeps authenticated users off that page. Excluding `/auth/*` from the interceptor's 401 branch removes the fragility:
```ts
if (err.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) { … }
```

I include this because it is the difference between a report you can act on and a list of plausible-sounding guesses. Findings above tagged **CODE** carry the same uncertainty D-1 did — they are well-evidenced but unexecuted. The **NEEDS-CONFIRM** items in section 9 should be tested before anyone acts on them.

---

## 9. What to verify next

**Priority 1 — server-side authorization (settles H-4).**
1. Log in as a plain buyer. In the console: `const u=JSON.parse(localStorage.user); u.role='admin'; localStorage.user=JSON.stringify(u);` then reload and open `/admin/users`.
2. If the screen loads, watch the network tab: did `GET /api/admin/users` return **403** (client-only, medium) or **200 with real user data** (critical breach — fix before anything else)?
3. Repeat with `role='seller'` against `POST /api/products`.
4. Separately, `POST /api/auth/register` with `role:"admin"` in the body and check what gets created.

**Priority 2 — reproduce C-1 deliberately.** Leave the backend idle 20 minutes, then load `/products` in a fresh profile with the network throttled to Fast 3G. Record what is on screen at 5 s, 15 s, 30 s and 60 s. This is the first impression every returning visitor gets.

**Priority 3 — the full buyer journey.** Register → browse → filter → product detail → add to cart → adjust quantity → wishlist → checkout → order detail → download. Note where it breaks.

**Priority 4 — the seller and admin journeys.** Create a product → confirm it appears as pending → approve as admin → confirm it reaches the marketplace → buy it → confirm the seller can do nothing at all with the resulting order (expected, per C-3).

**Priority 5 — API hardening.** Confirm CORS allows only the Netlify origin rather than `*`; confirm rate limiting on `/api/auth/login` and `/api/auth/register`; confirm the server recomputes order totals rather than trusting client prices (relevant to H-8).

---

## 10. Test strategy

The app has no visible automated tests. Given the failure pattern — missing halves of flows, silent errors, nothing degrading gracefully — the leverage is in end-to-end and contract tests, not unit tests.

**End-to-end (Playwright), ~15 specs,** one per journey in section 9, against a seeded environment on every deploy. Assert specifically the things broken today: a deep link survives login; an API 500 (stub the route) shows an error state, not an empty state; an unknown URL renders a 404 page; a stale chunk request triggers a reload rather than a blank screen.

**Component tests for error and empty states.** Every component in H-1 needs two: renders the empty state on `[]`, renders the *error* state on 500. That these are currently indistinguishable is the bug.

**Contract tests on the API** so a server change cannot silently break a screen.

**Authorization suite — the highest-value set.** For every protected endpoint: no token → 401; valid token, wrong role → 403; correct role → 200. This is what makes H-4 impossible to regress.

**Performance budget in CI.** Fail the build if the lazy-route chunk graph for `/products` exceeds a set transfer size, and add a synthetic check that loads `/products` cold and asserts first meaningful paint under 5 seconds. C-1 would have been caught the day it appeared.

**Unit tests** only for pricing (including the null-product case in H-8), order-status transition rules once they exist, and validation helpers. Skip the rest.

---

## Appendix — API surface used by the client

Base: `https://filatrix-backend.onrender.com/api` — verified reachable, CORS allows the Netlify origin, healthy responses in ~1.5 s once warm.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/profile`, `PUT /auth/profile` |
| Products | `GET /products` (`page`, `limit`, `category`, `search`, `sortBy`), `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`, seller product list |
| Cart | `GET /cart`, add, update item, `DELETE /cart/:itemId`, `DELETE /cart` |
| Wishlist | get, add, remove |
| Orders | create, list, get by id, seller order list, mark item downloaded |
| Seller | `GET /seller/dashboard/stats` |
| Admin | stats, list users, update user role, toggle user status, list products, update product status (`approved`/`rejected`) |

Sample product record returned live:
```json
{"_id":"69dc39cdb0f7e3af87a4557e","title":"3D Printed Gear","price":499,
 "category":"other","tags":["gear","mechanical"],"previewImages":[],
 "modelFile":"/uploads/models/sample.stl","fileType":"stl","status":"approved",
 "seller":{"name":"Tata 3d","avatar":""},"downloadCount":0,"averageRating":0}
```
Categories: Art & Sculpture, Toys & Games, Home & Decor, Tools & Parts, Jewelry, Other.
Sort options: `price_asc`, `price_desc`, `rating`, `popular`.
Order states in the model: `pending`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`.

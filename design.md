# WoolTrace Landing Page Design System

## 1. Direction

The supplied screenshots establish a modern agricultural editorial style: a pale grey outer canvas, a narrow white website frame, a black capsule navigation bar, oversized agricultural photography, restrained black typography, lime calls to action, compact metric cards, rounded image panels, and generous white space.

WoolTrace applies that visual language without copying the reference brand or page content. The page remains specifically about wool traceability, farmer-controlled buyer offers, quality verification, logistics, and the complete farm-to-fabric lifecycle.

Design thesis: **a premium agricultural platform that feels simple enough for a farmer and trustworthy enough for a buyer.**

## 2. Visual Principles

1. **Photography carries emotion.** Use one strong rural image as the hero and crop it intentionally for supporting panels.
2. **Information stays structured.** Metrics, services, lifecycle steps and buyer offers use compact cards with clear hierarchy.
3. **Lime means action or verified progress.** It is not a general background colour.
4. **Black creates authority.** The navigation and buyer-offer panel use near-black surfaces to signal focus and trust.
5. **White space is functional.** Sections use large vertical gaps so complex supply-chain information never feels dense.
6. **Farmers remain central.** Copy must explain control, earnings, verification and practical support rather than abstract technology.

## 3. Colour Tokens

| Token | Value | Usage |
|---|---:|---|
| Canvas | `#E8EBEA` | Desktop background outside the website frame |
| Paper | `#FFFFFF` | Primary website and card surface |
| Ink | `#11120F` | Headlines, body emphasis, black panels |
| Muted ink | `#62665C` | Supporting copy and metadata |
| Line | `#E6E7E0` | Dividers and subtle card borders |
| Action lime | `#C8FB39` | Primary CTA, logo mark and best-value state |
| Forest | `#173F2C` | QR passport section and traceability accents |
| Warm cream | `#F7F5EE` | Farmer-benefit band and warm supporting surfaces |
| Cool mist | `#EDF3F0` | Secondary agricultural service surfaces |

Lime text on white is avoided because contrast is too weak. Lime is paired with near-black text or used as a small accent.

## 4. Typography

- Primary typeface: **Manrope**.
- Hero headline: `clamp(3.8rem, 7.4vw, 7rem)`, weight 650, line height 0.91, tight tracking.
- Section headline: `clamp(2.25rem, 4vw, 4.3rem)`, weight 560, line height 1.02.
- Card heading: 1.45rem, weight 650.
- Body copy: 0.9-1.05rem, line height 1.65-1.7.
- Kicker: 0.72rem uppercase with 0.14em tracking.

Headlines are sentence case. Paragraphs should stay under roughly 70 characters per line.

## 5. Layout

- Desktop outer padding: 0; the site occupies the full laptop viewport.
- Maximum website width: none; page width is 100%.
- Website frame radius: 0, with a small radius retained only at the bottom of the hero transition.
- Section horizontal padding: `clamp(28px, 6vw, 82px)`.
- Standard section vertical padding: 88px.
- Card grid gap: 10-18px.
- Major panel radius: 22-24px.
- Small card/control radius: 12-16px.

The page is edge-to-edge at every breakpoint. On laptops, the hero image fills the complete first viewport behind the floating glass navigation.

## 6. Components

### Navigation

- Navigation floats directly over the hero image with no full-width header bar.
- Brand on the left, compact glass-morphism pill navigation in the centre, lime-tinted glass login on the right.
- Glass surfaces use a translucent dark fill, 16-20px backdrop blur, a soft white inner highlight and a restrained shadow so the photograph remains visible behind them.
- Mobile replaces centre navigation with a circular glass button and floating glass menu.

### Hero

- Full-bleed agricultural image, minimum 610px tall.
- Left-to-right dark overlay on desktop; bottom-weighted overlay on mobile.
- Large white headline, short supporting copy and lime pill CTA.
- Verification badge sits at the bottom-right on desktop.

### Metrics

- Four-column white tray with compact inner cards.
- Icon first, large value second, explanatory label last.
- Collapse to two columns on tablet and one on narrow mobile.

### Service Cards

- Three cards with a strong visual top and text bottom.
- Use green/lime, cream and mist as controlled surface variations.
- Number cards consistently (`01`, `02`, `03`).

### Lifecycle Accordion

- Large image on the left and four thin accordion rows on the right.
- Only one row is expanded at a time.
- The accompanying image contains a small batch-ID status chip.

### Farmer Benefits

- Warm cream band with four evenly weighted benefits.
- Simple line icons, short uppercase labels and no paragraphs.

### Buyer Offers

- Near-black panel to distinguish market activity from informational content.
- The best net-value offer uses a lime surface.
- Show buyer verification and practical terms, not price alone.

### QR Passport

- Forest-green section with a light QR card.
- Explain public visibility and privacy protection together.
- QR artwork is illustrative until real QR generation is connected.

## 7. Imagery

- Prefer authentic Indian wool farmers, sheep, shearing, clean fleece, warehouses and processing environments.
- Use natural daylight and realistic rural textures.
- Avoid generic corporate teams, artificial studio light, oversaturated greens and staged costume-like farming scenes.
- Crop people with care; faces and hands should remain visible whenever they are the focal point.
- All meaningful images require descriptive alt text. Decorative overlays do not.

## 8. Responsive Behaviour

### Desktop: over 900px

- Three-column services.
- Two-column lifecycle, farmer story and QR sections.
- Four-column metrics and benefits.

### Tablet: 601-900px

- Services become horizontal image-and-copy cards.
- Lifecycle, farmer story and QR sections stack.
- Metrics and benefits use two columns.

### Mobile: 600px and below

- Full-width frame with 7px hero inset.
- Hero copy is centred near the bottom of the image.
- Single-column metrics and services.
- Two-column compact benefits.
- Farmer avatar becomes a wide image.
- Footer and all complex content stack vertically.

## 9. Accessibility and Interaction

- Minimum interactive target is approximately 40px; primary buttons are 47-48px tall.
- Keyboard-visible focus is inherited from the shared UI primitives.
- Login uses the accessible dialog primitive.
- Lifecycle controls expose `aria-expanded`.
- Mobile menu exposes its open state.
- Reduced-motion preferences disable smooth scrolling and transitions.
- Supporting grey text maintains readable contrast on white and cream surfaces.

## 10. Content Rules

- Say **buyer offers** or **competitive selling** in farmer-facing UI; avoid unexplained auction terminology.
- Never claim that all intermediaries disappear. WoolTrace removes avoidable trading dependency while keeping useful assessors, logistics, warehouses and processors visible.
- Present estimated net earnings alongside offer price.
- Separate verified facts from farmer-entered and partner-entered events in future trace views.
- Do not expose exact private farm coordinates, phone numbers or documents on public QR pages.

## 11. Current Implementation Notes

- The landing page is implemented in `app/page.tsx`.
- Global tokens and responsive rules live in `app/globals.css`.
- The login modal is a UI prototype; authentication and OTP delivery are not yet connected.
- Buyer offers and batch history are representative demo data.
- The QR graphic is illustrative and must later be replaced with a signed batch verification URL.
# Product application extension

The marketing landing page remains the public entry point and keeps the approved farmer hero photograph unchanged. The product now extends behind a dedicated authentication screen and a responsive workspace.

## Required product modules

- Role-ready accounts for farmers, buyers, assessors, transporters, warehouses, processors, and administrators.
- Farmer wool registration with a unique batch ID and QR passport created at shearing.
- Farm-to-fabric event history covering origin, quality, auction, ownership, transport, storage, processing, yarn, and fabric.
- WoolKart listings and reverse bidding, with price, pickup, deductions, payment terms, and buyer verification shown together.
- Quality records for grade, micron, staple length, clean yield, contamination, and downloadable certificates.
- Transport and warehouse discovery/booking workflows with custody tracking.
- Services marketplace for shearing, veterinary, breeding, assessment, logistics, and processing.
- Market intelligence with grade-level prices, demand signals, price history, and reserve guidance.
- English/Hindi interface switch and a layout designed to extend to additional Indian languages.
- Public, mobile-friendly QR passport that reveals provenance without exposing private farmer information.

## Authentication and data

Google OAuth uses server-side authorization-code exchange, state validation, signed HTTP-only session cookies, and a 14-day session. Credentials are supplied only as production environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `AUTH_SECRET`.

The D1 schema contains users, farms, wool batches, batch events, buyer bids, service listings, and bookings. The generated migration is stored in `drizzle/` and the production binding is named `DB`.

## Visual system

The authenticated workspace continues the landing page's deep forest green, warm white, pastel moss, and lime accent. Dense operational information uses compact white panels, restrained status chips, clear typographic hierarchy, and responsive tables. The public batch passport uses the same system so that a QR scan still feels like WoolTrace.

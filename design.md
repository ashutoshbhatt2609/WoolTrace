# WoolTrace design system

## Direction
A farmer-first agricultural interface inspired by the supplied pastoral reference: mint countryside, deep blue-green type, cream surfaces and sunshine-yellow actions. Borrow the visual language only, not Havens branding, copy, cows or testimonials. Preserve public/wooltrace-hero.png. Original decorative SVG hills and sheep connect public sections; workspaces keep decoration restrained so tasks remain readable.

## Tokens
- Workspace canvas: #F2F8F3
- Deep teal/sidebar: #0B3E49
- Primary action: #FFDA52 with #163F46 text
- Mint hero: #D6EEE5
- Secondary pastel surface: #E5F3E9
- Selected navigation: #D5ECDF
- Borders: #D8E9DF
- Cream: #FFFEF8. Yellow is an action accent, never light text on white.

## Layout
Shared AppShell across account screens. Desktop has a 240px navigation rail and a flexible content area. Below 800px the rail becomes a labelled menu. Forms collapse to one column; controls remain at least 43px high. Rounded 8–16px surfaces, restrained shadows and no excessive decorative gradients.

## Role-specific workspaces and demo
- A single role configuration controls the sidebar, dashboard guidance and allowed workspace pages. Buyers never receive shearing forms; partner roles see assigned stage tools. Direct links to another role redirect to the selected workspace.
- Onboarding previews all seven roles with native accessible radio controls. Roles are self-selected, not certification or automatic batch access.
- Demo entry is available at /demo without Google or database credentials. Each role has a short interactive walkthrough using sessionStorage, separated by role and browser tab. No real API mutations, payments or authentication cookies are created.
- Demo numbers and actions are labelled sample. A demo QR opens the fixed illustrative public passport, not the locally edited sample history. Real dashboards continue to use account records only.
- Pastoral overrides live in app/pastoral.css; functional layout and responsive rules live in app/globals.css. Keep the decorative SVG aria-hidden and respect reduced-motion preferences.

Landing imagery is not replaced. Floating cards explain the product instead of inventing demand or price metrics.

## Public landing page refinement
- Public-only styles live in app/landing.css under the wool-home root, without changing account forms or workspaces.
- Use an editorial cream canvas, deep teal headings, restrained mint panels and yellow calls to action. Serif italic accents soften headings; body copy remains a readable system sans-serif.
- Preserve the current farmer photo. Keep a single example-passport card rather than overlapping market-statistic cards or fictional customer avatars.
- The wool journey is a selectable ten-chapter explorer. Desktop offers compact chapter buttons; phones use a native select. Previous/next controls, meaningful stage details and the recorded-by label make the lifecycle easier to understand.
- The example QR opens the fixed illustrative passport and is generated against the current site origin. It is not certification or a real participant record.
- Every role card opens its matching isolated demo. Native FAQ disclosures explain permission boundaries, certification limits and seller-confirmed UPI payments.
- Avoid unsupported claims about farm verification, laboratory accreditation, guaranteed product authenticity or automatic payment verification.

## Components and interactions
- Every icon-only action has an accessible name.
- Every form has labelled inputs, fieldset busy state, server-backed validation and announced success/error feedback.
- Group longer forms into named steps. Use comfortable input heights, example placeholders, units, optional/required labels and field-level errors for both text inputs and dropdowns. Focus the first invalid field and prevent duplicate submission while saving.
- Keep the primary yellow button label dark teal for legible contrast. Mobile form inputs use 16px text and a single-column layout.
- Photo uploads show a compressed preview, filename and remove action before the user submits.
- Dashboard numbers come from account-linked database records. Empty accounts get a useful empty state, not sample trading figures.
- Sample passports are prominently labelled illustrative and do not name real laboratories as fictional partners.
- Dangerous sale confirmation requires an explicit acknowledgement and transaction reference.
- Public QR pages distinguish original farmer, current owner and stage contributor.
- Stage notes and dates remain visible together; dates include years and India timezone.
- Color never alone communicates a status; use text labels.
- Focus outlines and reduced-motion preferences are respected.

## Content rules
The visual identity uses an original SVG sheep-face mark in navigation, login, demos, passports and the favicon. Cream paper, quiet mint, soft yellow and a small illustrated flock add warmth without replacing the original farmer photograph. Prefer plain explanations over stacked marketing slogans. Decorative illustrations have no focus stops or announcements.

My assignments shows exactly the batch and stage granted to the signed-in email. A partner opens a job to enter its matching workspace; transporter navigation calls its stage tools Logistics. Do not show farmer sale controls to logistics roles. Support multiple invited roles without making one invitation unlock every batch. Empty portals offer a useful next step instead of an unusable form.

Forms use readable 16px input text on laptop and phone, meaningful labels, comfortable targets, and responsive single columns at constrained widths. Long batch IDs, email addresses, stage notes and payment references wrap. The mobile drawer remains scrollable on short screens. Narrow phones show metrics as rows rather than three cramped cards.

Say farmer-recorded, participant-submitted and seller-confirmed. Do not say government certified, verified farm, guaranteed authentic, blockchain or automatic bank verification.
Google proves account control, not farm ownership. The event hash chain is a consistency check, not independent certification.
Service plans do not book providers; lab listings are outreach leads. Weather is optional and attributed to its source.

The account toolbar keeps a clearly labelled role dropdown above every workspace, including demos. It is keyboard-friendly, uses comfortable mobile targets and displays loading/error feedback. Role changes preserve the account and records. Weather & wool insights is shared across roles with a separate district picker; asking prices, source times and unavailable external feeds are labelled explicitly. The AI question field requires opt-in and never visually impersonates a measurement or certification.

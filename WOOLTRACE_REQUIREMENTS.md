# WoolTrace - Build Requirements Specification

## 1. Product Summary

WoolTrace is a role-based, multilingual platform for monitoring wool from sheep farming through shearing, sorting and quality assessment, trading, transportation, storage, processing, and fabric production.

Every wool batch must have one persistent digital identity. Authorized stakeholders add records to that identity as the batch changes owner, location, quality state, or processing stage. The platform also provides market intelligence, digital trading, reverse bidding, transport visibility, warehouse discovery and booking, digital quality records and certificates, and a location-based services marketplace.

### Core product promise

WoolTrace is farmer-first. Its two defining experiences are:

1. **Scan the batch QR and see the wool's complete life:** where and when it was shorn, who produced it, the sheep/breed and farm of origin, quality results, every ownership/custody hand-off, transport and storage events, processing transformations, and the resulting yarn or fabric.
2. **Let farmers sell directly to competing buyers:** the farmer publishes a verified batch, buyers submit competing purchase offers, and the farmer selects the best acceptable offer without requiring a traditional intermediary.

The platform does not claim that every intermediary is unnecessary: transporters, warehouses, assessors, and processors still provide real services. Its purpose is to remove avoidable trading dependency and hidden information while making every paid service and hand-off visible.

## 2. Product Goals

1. Create an integrated farm-to-fabric monitoring platform.
2. Provide current and historical wool market prices and trends.
3. Connect farmers and sellers with buyers.
4. Create digital quality-assessment records and certificates.
5. Provide batch-level traceability across the supply chain.
6. Show wool transportation and storage status.
7. Connect users with wool-related service providers.
8. Improve communication and transparency among stakeholders.
9. Provide role-based, multilingual access.

## 3. Stakeholders and Roles

### 3.1 Platform roles

| Role | Primary capabilities |
|---|---|
| Farmer / Producer | Manage farm profile, sheep/flock information, wool production, batches, quality requests, listings, bids, sales, pickup, storage, and service bookings |
| Buyer | Search wool, inspect traceability and quality records, place orders or bids, participate in reverse bidding, and track fulfilment |
| Trader | Buy and resell wool, manage inventory/ownership, create listings, and arrange logistics/storage |
| Transporter | Accept transport requests, update pickup/transit/delivery status, share location/proof of delivery, and report exceptions |
| Warehouse operator | Publish facility and capacity, accept bookings, record check-in/out, and manage stored batches |
| Processor | Receive batches, record processing steps, create derived lots/products, and link output to source batches |
| Service provider | Offer shearing, veterinary, breeding, testing, and processing services; manage availability and bookings |
| Quality assessor / Certifier | Record test results, grades, evidence, and issue or revoke digital certificates |
| Administrator | Verify users, manage reference data and translations, moderate marketplace content, resolve disputes, and audit activity |

Some users may hold multiple roles. Sensitive roles such as certifier and administrator require explicit approval.

### 3.2 Access model

- Role-based access control must restrict actions and sensitive fields.
- Ownership or custody must control who may update a batch.
- Public or buyer-facing trace views must expose only approved information.
- Every material record change must be attributable to a user and timestamp.

## 4. End-to-End Lifecycle

The canonical journey is:

`Sheep farming -> Shearing -> Sorting and quality -> Trading -> Transport -> Storage -> Processing -> Fabric`

A batch may skip or repeat transport and storage stages. Processing may split one batch into several outputs or combine several batches into one processed lot. The system must preserve all parent-child links so provenance is never lost.

### 4.1 Minimum batch states

- Draft
- Created / available at origin
- Awaiting quality assessment
- Quality assessed / certified
- Listed for sale
- Reserved / sale agreed
- Awaiting pickup
- In transit
- Received at warehouse
- In storage
- Released from storage
- Received by processor
- In processing
- Processed / transformed
- Converted to fabric / completed
- Rejected, disputed, recalled, or archived

State changes must be validated; users cannot jump to an impossible state without an administrator override and reason.

## 5. Functional Requirements

### FR-01 Authentication and user management

- Register and sign in using mobile number or email with OTP/password according to the chosen policy.
- Select one or more roles and create the corresponding profile.
- Verify mobile/email and support password/credential recovery.
- Support administrator approval and identity/business verification for privileged roles.
- Allow profile, address, language, notification, and privacy preferences.
- Suspend, reactivate, or delete accounts according to retention rules.

### FR-02 Farmer and production management

- Create and maintain farm, location, flock, breed, and production details.
- Record shearing event details: date, method, quantity, source flock, shearer, and notes.
- Record sorting and grading information.
- Create one or more wool batches from a production/shearing event.
- View owned batches, their current state, value, location, and history.
- Provide a farmer dashboard showing total wool, available/sold batches, current offers, expected revenue, upcoming services, active shipments, storage, and alerts.
- Allow farmers to upload batch photos, voice notes, and supporting documents using a mobile-friendly guided flow.
- Let farmers compare a received offer with recent market prices and estimated transport/storage costs before accepting it.
- Let farmers manage cooperative/group lots when several small producers intentionally combine wool, while preserving each producer's contribution and provenance.

### FR-03 Digital batch identity and traceability

- Generate a globally unique, human-readable batch ID.
- Generate a QR code for the batch trace page; optional physical labels may also include barcode/NFC later.
- Maintain origin, producer, breed, dates, quantity, unit, quality, current owner, current custodian, current location, status, and processing history.
- Store an append-only timeline of lifecycle events with actor, timestamp, location, supporting document, and notes.
- Transfer ownership and custody only through validated transactions or hand-offs.
- Support batch split, merge, transformation, and parent-child genealogy.
- Provide a timeline/map view and QR-accessible trace summary.
- Flag gaps, contradictory events, expired certificates, or suspicious edits.

#### QR scan experience

- Scanning must work in an ordinary phone camera/browser without requiring the viewer to install an app.
- The QR identifies the batch through a non-guessable public token; it must not expose a raw database identifier or private credentials.
- The public trace page must clearly show:
  - batch ID and current product form (raw wool, clean wool, yarn, or fabric);
  - farm/region of origin and producer display name, subject to privacy settings;
  - sheep breed/type, shearing date, shearing method, initial quantity, and batch-creation date;
  - quality grade, key test results, assessor, certificate status, and verification link;
  - chronological lifecycle timeline covering creation, quality, sale, pickup, transport, storage, processing, and final product;
  - a map at an appropriate privacy-preserving level for recorded movement events;
  - current lifecycle stage, last verified event, and whether the trace contains gaps;
  - all split, merge, and transformation relationships needed to trace the current lot back to its source batch or batches.
- Each event must distinguish verified facts from farmer-entered, service-provider-entered, automatically captured, or administrator-corrected information.
- Sensitive information such as personal phone numbers, exact home/farm coordinates, prices, documents, and private transaction details must remain hidden unless the viewer has permission.
- The public page must be fast, mobile-first, multilingual, shareable, and printable.
- If a QR label is copied, the page must still show the canonical record and current status; administrators must be able to revoke and replace a compromised QR token without changing the immutable batch ID.

### FR-04 Market intelligence

- Display wool prices by date, market/source, region, breed/type, grade, and unit.
- Show current price, historical series, trends, and simple comparisons.
- Search and filter market data.
- Show data source and last-updated timestamp.
- Allow administrators to import or enter validated price data.
- Optionally notify users about selected price/market changes.

### FR-05 WoolKart digital marketplace

- Sellers can create listings linked to available batches.
- A listing includes quantity, grade, certificate status, location, price, sale method, photos/documents, availability, and terms.
- Buyers can search, filter, sort, compare, save, and inspect listings.
- Support direct purchase/order or enquiry according to the agreed MVP scope.
- Track order stages: initiated, accepted, payment pending/recorded, pickup, delivered, completed, cancelled, disputed.
- Prevent the same quantity from being sold twice.
- Provide transaction history, invoice/receipt metadata, and contact or in-app conversation.

### FR-06 Reverse bidding

- A farmer can publish a verified batch for competitive direct sale with quantity, quality, reserve/target price, pickup location/region, start time, and closing deadline.
- Verified buyers can submit, revise, or withdraw competing purchase offers before closing.
- For a farmer selling wool, offers normally compete upward; this is technically a seller auction even if the project uses the name "reverse bidding." The UI should use farmer-friendly wording such as **Buyer Offers** or **Competitive Bidding** and document the exact rule.
- The farmer retains control: accept the highest offer, accept another offer with a stated reason such as pickup terms or buyer reliability, negotiate where enabled, or reject all offers below expectations.
- Offer comparison must show effective farmer proceeds, including offered price, quantity, pickup responsibility, transport/storage deductions, payment terms, and buyer rating/history.
- Buyer identities may be hidden from other buyers, but the farmer must see sufficient verified information before accepting an offer.
- The farmer can set a confidential minimum acceptable price; offers below it cannot auto-win.
- The system must prevent collusive or spam bidding through verified buyer accounts, rate limits, bid deposits or penalties if adopted, suspicious-pattern flags, and administrator review.
- When an offer is accepted, the platform creates the sale/order, reserves the quantity, locks incompatible listings, and starts payment/pickup/ownership-transfer workflows.
- The system records the complete bid history, closing result, farmer decision, and resulting transaction in an auditable form.
- Bid visibility, ranking, minimum increment, tie-breaking, cancellation, withdrawal, extension, no-show, and dispute rules must be configured and displayed before participation.
- The platform must report the market reference price, winning price, number of valid buyers, and farmer's estimated net proceeds so the benefit of direct competition can be measured.

### FR-06A Farmer empowerment features

- Local-language onboarding with icons, guided steps, optional voice prompts, and help content.
- Daily/recent market prices with grade- and region-relevant comparisons rather than a single generic price.
- Price alerts and notifications when a farmer's batch receives an offer or reaches a target price.
- Cost and earnings estimator covering expected value, transport, storage, testing, platform fee, and net proceeds.
- Access to verified nearby shearers, veterinarians, breeders, assessors, transporters, warehouses, and processors.
- Group selling/cooperative lots for farmers who cannot individually meet buyer quantity requirements.
- Downloadable/shareable batch card, certificate, sale summary, receipt, and delivery proof.
- Simple grievance and dispute workflow with evidence upload and status tracking.
- Training content on wool handling, contamination prevention, grading, storage, and market preparation.
- Assisted mode that lets an approved cooperative/field agent help a farmer while every delegated action remains visible and requires appropriate consent.
- Optional welfare or scheme directory for relevant government/industry programs; eligibility claims must link to an authoritative source and be kept current.

### FR-07 Quality assurance and digital certification

- Request an assessment for a batch.
- An authorized assessor records sampling method, parameters, results, grade, lab/assessor, assessment date, evidence, and remarks.
- Minimum candidate parameters: fibre diameter/micron, staple length, strength, colour, vegetable matter/contamination, moisture, clean yield, weight, and grade. The academic team must confirm the final standard and units.
- Issue a unique, versioned digital certificate linked to batch and assessment.
- Certificate must show issuer, issue/expiry dates, status, result summary, and verification code/QR.
- Support correction/versioning, expiry, suspension, and revocation without erasing the old audit record.
- Anyone with permission can verify authenticity and current certificate status.

### FR-08 Transport management and tracking

- Create a transport request linked to one or more batches/orders.
- Capture pickup/drop addresses, schedule, vehicle/driver/transporter, quantity, and contact details.
- Transporters can accept assignments and update status: assigned, arrived, picked up, in transit, delayed, delivered, failed.
- Record pickup and delivery proof, including timestamp, quantity, receiver, image/document, and optional signature/OTP.
- Show latest location and tracking timeline.
- Notify relevant users about pickup, delay, arrival, delivery, or exception.
- GPS source and update frequency remain an explicit product decision; manual checkpoints are sufficient for an MVP.

### FR-09 Warehouse discovery and storage management

- Search/map warehouses by location, distance, capacity, accepted wool types, services, rate, and availability.
- Warehouse operators manage facility profile, contact details, photos, capacity, pricing, operating hours, and service areas.
- Users request or book storage for a batch and date range.
- Operators accept/reject bookings and record batch check-in, storage location, condition, and check-out.
- Update available capacity and storage status.
- Record storage charges and supporting documents; online payment is optional pending scope confirmation.

### FR-10 Location-based services marketplace

- Support service categories including shearing, veterinary, breeding, quality testing, transport, warehousing, and processing.
- Providers publish profile, verification, service areas, rates, availability, experience, and contact details.
- Users search/filter by service, location, distance, availability, price, and rating.
- Users submit booking/enquiry requests and providers accept, reject, reschedule, start, and complete them.
- Record completion evidence and permit ratings/reviews after a completed service.
- Provide moderation and abuse-reporting controls.

### FR-11 Processing and fabric provenance

- Processors receive and confirm source batches.
- Record cleaning, scouring, carding, spinning, dyeing, weaving/knitting, and other configurable processing events.
- Capture input quantity, output quantity, waste/loss, date, facility, operator, process parameters, and evidence.
- Create derived lots such as clean wool, yarn, or fabric and preserve links to every input batch.
- Provide a finished-product provenance view suitable for buyer/consumer verification.

### FR-12 Communication and notifications

- Provide in-app notifications and a notification centre.
- Candidate channels: push, SMS, email, and WhatsApp; MVP channels must be selected based on cost and availability.
- Notify on assessment, certificate, bid, order, ownership transfer, transport, warehouse, booking, dispute, and administrative events.
- Users can configure non-critical notification preferences.
- If chat is included, conversations must be attached to a listing, order, booking, or support case and support moderation/reporting.

### FR-13 Multilingual and accessible experience

- All user-interface strings must use translation keys, not hard-coded text.
- Users can choose and persist their language.
- The MVP must support English plus at least one target Indian language; Kannada and Hindi are candidates requiring confirmation.
- User-entered content may remain in its original language; automatic translation is optional.
- Dates, numbers, currency, units, and pluralization must be localized.
- Core flows should meet WCAG 2.1 AA principles: keyboard access, readable contrast, labels, error messaging, scalable text, and screen-reader semantics.

### FR-14 Administration and governance

- Dashboard for users, roles, verification, batches, listings, transactions, certificates, transport, warehouses, services, and reports.
- Manage breeds, wool types, grades, units, lifecycle stages, service categories, markets, price sources, and translations.
- Approve/reject privileged profiles and moderate listings/reviews.
- View audit logs and export operational data.
- Manage disputes, fraud flags, certificate revocation, account suspension, and content reports.
- Configure platform rules such as fees, bidding windows, retention, and notification templates.

### FR-15 Search, reporting, and analytics

- Global or module-specific search by batch ID, QR, user, listing, order, certificate, vehicle/shipment, warehouse, and location.
- Role-specific dashboards and filters.
- Export authorized data in CSV/PDF where needed.
- Minimum operational reports: batch inventory/status, traceability completion, marketplace transactions, price trends, quality/grade distribution, transport performance, warehouse utilization, and service bookings.

## 6. Core Data Model

| Entity | Essential fields / relationships |
|---|---|
| User | ID, name, mobile/email, roles, language, status, verification |
| Organization | Type, registration details, addresses, members, verification |
| Farm | Owner, geolocation/address, flock/breed references |
| Shearing event | Farm/flock, date, method, shearer, quantity |
| Wool batch | Batch ID, QR token, origin, type/breed, quantity/unit, status, owner, custodian, location |
| Batch event | Batch, event type, actor, time, location, details, evidence, previous hash/version if used |
| Batch relation | Parent batch/lot, child batch/lot, split/merge/transform quantity |
| Quality assessment | Batch, assessor/lab, sample, parameters, result, grade, evidence |
| Certificate | Assessment, issuer, serial number, version, validity, status, verification token |
| Market price | Source, market/region, wool type/grade, price, unit, date, verification status |
| Listing | Seller, batch, quantity, sale method, price, location, status |
| Bid / offer | Listing/auction, buyer, amount, quantity, time, status |
| Order / transaction | Parties, listing, batch/quantity, agreed value, statuses, ownership transfer |
| Shipment | Order/batches, transporter, vehicle/driver, route, status, checkpoints, proofs |
| Warehouse | Operator, location, capacity, rates, features, availability |
| Storage booking | Warehouse, batch, dates, quantity, status, check-in/out, charges |
| Service listing | Provider, category, service area, rate, availability, verification |
| Service booking | Requester, service, schedule/location, status, evidence, price |
| Process event | Inputs, outputs, process type, facility, quantities, dates, evidence |
| Fabric/product lot | Processor, source lineage, description, quantity/unit, status |
| Notification | User, event type, channel, content key, delivery/read status |
| Conversation / message | Context, participants, content, timestamp, moderation state |
| Review / dispute | Related transaction/booking, parties, evidence, status, resolution |
| Audit log | Actor, action, target, timestamp, before/after metadata, IP/device where lawful |

## 7. Business Rules and Integrity Controls

1. Batch IDs and certificate serial numbers are immutable and unique.
2. Batch event history is append-only; corrections create a new version or compensating event.
3. Quantity conservation must be checked on split, merge, sale, storage, and processing events, with recorded process loss/waste where applicable.
4. Ownership and custody are distinct and can change independently.
5. Only the current owner or an authorized delegate may list or transfer available quantity.
6. Only approved assessors/certifiers may issue certificates.
7. A certificate always refers to the exact batch/version that was assessed.
8. Listings, bids, bookings, and assignments use explicit status transitions and are safe against duplicate submissions.
9. Every hand-off requires sender and receiver evidence or a defined exception workflow.
10. Historical trace records remain visible to authorized users after transfer or transformation.
11. Administrative overrides require a reason and are audited.
12. Personal contact and precise location information must not be exposed publicly by default.

## 8. Non-Functional Requirements

### 8.1 Security and privacy

- Use TLS in transit and encryption for sensitive data at rest.
- Store passwords only with a modern adaptive password hash if passwords are used.
- Enforce server-side authorization on every operation; never rely only on hidden UI controls.
- Protect OTP, login, bid, and search endpoints with rate limits and abuse controls.
- Validate uploads, restrict file types/sizes, scan where possible, and store them outside executable paths.
- Use short-lived signed links or equivalent access controls for private documents.
- Protect against OWASP Top 10 risks and common API authorization flaws.
- Record security-relevant audit events without logging passwords, OTPs, tokens, or excessive personal data.
- Provide consent, privacy notice, retention, account deletion/request handling, and backup policies aligned with applicable Indian law and institutional requirements.

### 8.2 Reliability and data integrity

- Use transactional updates for ownership, available quantity, order, and inventory changes.
- Make repeat API submissions idempotent for payments, status updates, and hand-offs.
- Back up the database and uploaded evidence; document and test restoration.
- Preserve audit and genealogy records across batch splits, merges, and transformations.
- Queue retryable notification and background tasks and expose failed-job monitoring.

### 8.3 Performance targets for MVP

- Typical authenticated API response: p95 under 2 seconds, excluding third-party services and large exports.
- Initial dashboard/list page usable within 3 seconds on a typical 4G connection.
- Paginate all potentially large lists and timelines.
- QR trace lookup should respond within 2 seconds under normal load.
- Images should be compressed and delivered in responsive sizes.

### 8.4 Availability and scale

- Design for horizontal API scaling and object storage for documents/images.
- Define measurable uptime after hosting choice; a practical student MVP target is 99.5% during demonstration/pilot periods.
- Avoid architecture that prevents later separation of marketplace, tracking, and analytics workloads.

### 8.5 Rural and low-bandwidth usability

- Mobile-first responsive UI with large touch targets and simple forms.
- Minimize required typing; use defaults, pickers, saved locations, and guided steps.
- Compress payloads and avoid large mandatory downloads.
- Preserve unsent form data during temporary connection loss.
- A full offline mode is a later enhancement unless explicitly added to MVP.

### 8.6 Observability and maintainability

- Structured application logs, error tracking, health checks, and basic metrics.
- Separate development, test/staging, and production configuration.
- Database migrations, seeded reference data, API documentation, and automated test execution.
- No secrets in source control; use environment/secret configuration.

## 9. Suggested Technical Architecture

This section is an implementation recommendation, not a requirement stated in the source brief.

### 9.1 Practical student-project stack

- Front end: React or Next.js with TypeScript, responsive/PWA-ready UI, and an i18n library.
- Back end: Node.js with NestJS/Express or Python with Django REST Framework/FastAPI.
- Database: PostgreSQL with PostGIS for nearby warehouse/service queries.
- Cache/queues: Redis for rate limits, caching, and background jobs.
- Files: S3-compatible object storage for photos, certificates, and proofs.
- Maps: OpenStreetMap-based tiles and geocoding, subject to provider terms.
- Authentication: secure session or short-lived access tokens with refresh-token rotation; OTP provider if mobile login is selected.
- QR: signed public verification token that reveals approved trace data only.
- Deployment: containerized web/API/worker services with managed PostgreSQL and automated backups.

### 9.2 Recommended architecture boundary

Start as a modular monolith with modules for identity, batches/traceability, quality, marketplace, logistics, warehouse, services, processing, notifications, and administration. This is faster and safer for a mini project than microservices while keeping clear boundaries for later extraction.

### 9.3 Blockchain decision

Blockchain is not required by the source brief. A relational database with append-only audit events, signed verification URLs, controlled roles, and backups is sufficient for an MVP. Add distributed-ledger technology only if the academic evaluation explicitly requires decentralized trust and its governance is defined.

## 10. External Services and Dependencies

- OTP/SMS/email/WhatsApp provider, depending on selected login and notification channels.
- Map, geocoding, and routing provider.
- Object storage and optional antivirus scanning.
- Market-price dataset/source and import agreement.
- Quality grading standard and authorized certificate issuer model.
- Optional payment gateway and refund/dispute process.
- Optional GPS/telematics provider for live vehicle tracking.
- PDF/QR generation library for certificates and labels.

## 11. MVP Scope

### Must have

1. Authentication, profiles, roles, and admin approval.
2. Farmer/farm records and batch creation with unique ID and QR.
3. Public mobile QR trace page showing the complete verified lifecycle from shearing through processing/fabric, with privacy controls and provenance across splits/merges.
4. Quality assessment record and verifiable digital certificate.
5. Farmer-to-buyer batch listing, competitive buyer offers, offer comparison, farmer-controlled selection, order creation, and transaction state.
6. Manual market-price entry/import plus price list and history chart.
7. Transport assignment with manual status checkpoints and delivery proof.
8. Warehouse directory, availability, booking, check-in, and check-out.
9. Service provider directory and booking/enquiry.
10. Processor events and derived-lot provenance back to every contributing farm batch.
11. English plus one confirmed local language.
12. Farmer dashboard, market/offer alerts, cost-and-earnings estimate, notifications, administration, and audit log.

### Should have after the core MVP

- Reverse bidding with closing rules.
- Map-based nearby discovery.
- Split/merge user interface beyond basic processing genealogy.
- Ratings/reviews and in-context messaging.
- CSV/PDF exports and richer analytics.
- PWA installation and stronger intermittent-connectivity support.

### Later / optional

- Integrated online payments and escrow.
- Live GPS/telematics tracking.
- NFC/RFID or IoT weighing/sensor integration.
- Automatic translation and voice-assisted entry.
- ML price forecasting, fraud/anomaly detection, or quality prediction.
- Consumer-facing product passport.
- Blockchain or external government/industry integrations.

## 12. Minimum Screens

### Shared

- Landing/about, sign up/sign in/OTP, role onboarding, profile, language selector, notification centre, help/support.

### Farmer/seller

- Dashboard, farm/flock, production/shearing, batch list/detail/create, QR label, assessment request, listing create/manage, bids/offers, orders, shipment, storage booking, service search/booking.

### Buyer/trader

- Marketplace, filters, listing detail, trace view, certificate verification, order/bid flow, purchases/inventory, shipments, storage.

### Assessor/certifier

- Assessment queue, assessment form, certificate preview/issue, certificate history/revocation.

### Transporter

- Available/assigned jobs, job detail, checkpoint update, map/location, delivery proof.

### Warehouse

- Facility/capacity, booking queue, check-in/out, stored inventory, charges.

### Service provider

- Services/profile, calendar/availability, requests, booking detail, completion proof.

### Processor

- Incoming lots, processing record, output lot creation, genealogy, finished product trace.

### Administrator

- Overview, approvals, users/roles, master data, prices, moderation, certificates, disputes, audit logs, reports, configuration.

## 13. API Capability Checklist

- Identity: register, authenticate, verify, recover, refresh/logout, roles, organizations.
- Farms/production: CRUD farm/flock/shearing records.
- Batches: create/read/update allowed fields, events, split/merge, ownership/custody transfer, QR/trace.
- Quality: request, assign, assess, issue/version/revoke/verify certificate.
- Market: price import/admin CRUD, query, history, trend aggregates.
- Marketplace: listings, search, offers/bids, orders, cancellations/disputes.
- Logistics: shipment request/assignment, checkpoints, location, pickup/delivery proofs.
- Warehouses: facilities, availability, booking, check-in/out, capacity.
- Services: provider listings, nearby search, availability, booking, reviews.
- Processing: input receipt, process events, outputs, genealogy.
- Communication: notifications, preferences, optional conversations/messages.
- Admin/reporting: approvals, reference data, audit, moderation, exports, metrics.

API contracts must be versioned, validated, documented with OpenAPI, paginated consistently, and return stable error codes.

## 14. Acceptance Criteria for an Academic MVP

The MVP is demonstrably complete when all of the following pass:

1. A farmer registers, creates a farm/shearing record, and generates a wool batch with a unique ID and QR.
2. Scanning the QR in a normal mobile browser shows the permitted full timeline from shearing onward, verified quality/certificate status, custody/movement events, processing lineage, and current lifecycle state without exposing private data.
3. An approved assessor records results and issues a certificate whose current status can be verified.
4. The farmer lists the assessed batch, at least two verified buyers submit competing offers, and the farmer compares price, terms, estimated deductions, and net proceeds before selecting or rejecting an offer.
5. Ownership changes exactly once, sold quantity cannot be sold again, and the audit trail identifies both parties.
6. A transporter records pickup, transit, and delivery with proof; the batch timeline reflects each event.
7. A warehouse can be discovered and booked, and check-in/out changes inventory and batch state.
8. A wool-related service can be found by category/location and booked through completion.
9. A processor consumes a source batch, creates an output lot, and the output trace resolves back to the original farm batch.
10. Market prices display source, date, region/type/grade, current values, and historical trend.
11. Role permissions prevent unauthorized certificate, ownership, administrative, and status changes.
12. The critical flows work in English and the selected local language on mobile and desktop layouts.
13. Automated tests cover authorization, batch state transitions, quantity conservation, certificate verification, and double-sale prevention.
14. Backup/restore, seed/demo data, deployment instructions, and an end-to-end demo script are documented.
15. A copied or revoked QR cannot alter provenance, a private viewer cannot access sensitive fields, and every displayed event identifies its source/verification status.
16. The demonstration reports whether direct competitive selling improved the farmer's price or net proceeds relative to the displayed reference price; it must not claim middlemen were eliminated without evidence.

## 15. Testing Requirements

- Unit tests for business rules, state transitions, calculations, validation, and permissions.
- API integration tests for every critical role flow.
- End-to-end test of the complete farm-to-fabric happy path.
- Negative tests for unauthorized access, invalid transitions, over-selling, invalid quantities, duplicate submissions, and revoked certificates.
- Concurrency test for competing purchases/bids against the same batch quantity.
- Upload security and privacy tests.
- Accessibility checks and keyboard-only critical flows.
- Responsive checks on small mobile, tablet, and desktop widths.
- Localization tests for overflow, missing translation keys, number/date/currency/unit formatting.
- Basic load test for marketplace search, dashboards, and QR trace lookup.
- User acceptance testing with at least representative farmer, buyer, transporter/warehouse, assessor, and processor personas.

## 16. Project Deliverables

- Approved software requirements specification and finalized scope.
- User personas, journey maps, use-case diagram, and role-permission matrix.
- Wireframes/design system and responsive screen designs.
- Architecture diagram, database ER diagram, batch state diagram, and sequence diagrams for key hand-offs.
- API/OpenAPI specification and database migrations.
- Source code, configuration examples, seed/demo data, and automated tests.
- Deployment/operations guide, backup/restore guide, and user/admin manuals.
- Demo accounts, demo script, test report, known-limitations list, and final presentation/report.

## 17. Decisions Required Before Coding

These points are not specified in the supplied project brief and should be agreed before implementation:

1. Exact MVP deadline, team capacity, hosting budget, and pilot user count.
2. Web/PWA only, native mobile app, or both.
3. First local language(s), translation owner, and content-review process.
4. Login identifier and OTP provider; whether email/password fallback is required.
5. Identity/business verification documents for each role.
6. Authoritative wool grading standard, required test parameters/units, and who may certify.
7. Authoritative market-price sources, refresh frequency, and data-entry/import responsibility.
8. Direct purchase, enquiry, auction, reverse bidding, or which combination is in MVP.
9. Whether online payments, platform fees, invoicing, tax, escrow, refunds, and disputes are in scope.
10. Whether transport tracking is manual checkpoints, phone GPS, or vehicle telematics.
11. Map/geocoding provider, service radius rules, and location privacy.
12. Warehouse pricing, capacity units, booking/cancellation, and liability rules.
13. Exact batch lifecycle, split/merge rules, allowable process loss, and label-printing method.
14. Public trace fields versus role-protected trace fields.
15. Document retention, account deletion, consent, grievance/contact, and backup policies.
16. Notification channels and per-message operating cost.
17. Whether chat, ratings, reviews, disputes, exports, and blockchain are evaluated requirements or optional extensions.
18. Success metrics such as trace completeness, time-to-sale, delivery visibility, price uplift, or adoption.

## 18. Suggested Build Order

1. Confirm decisions, roles, lifecycle, grading data, and MVP acceptance criteria.
2. Design the ER model, batch state machine, permission matrix, wireframes, and API contract.
3. Set up authentication, roles, organizations, localization, audit, uploads, and admin reference data.
4. Build farm/shearing, batch identity, QR, genealogy, and trace timeline.
5. Add quality assessment and certificate verification.
6. Add market intelligence and WoolKart transaction flow.
7. Add transport, warehouse, services, and processing flows.
8. Add notifications, reports, moderation, accessibility, and low-bandwidth refinements.
9. Run security, concurrency, end-to-end, localization, and acceptance testing.
10. Prepare deployment, backups, demo data, documentation, and final academic demonstration.

## 19. Traceability to the Source Brief

| Source module/objective | Covered in this specification |
|---|---|
| Farmer module | FR-02, FR-03 |
| Market intelligence | FR-04 |
| WoolKart | FR-05 |
| Quality assurance | FR-07 |
| Transport tracking | FR-08 |
| Warehouse discovery | FR-09 |
| Services marketplace | FR-10 |
| Reverse bidding | FR-06 |
| Multilingual access | FR-13 |
| Batch traceability | FR-03, FR-11 |
| Role-based stakeholder network | Section 3, FR-01, FR-14 |
| End-to-end farm-to-fabric monitoring | Sections 4, 6, and 14 |

This document expands the presentation into implementable requirements. Items labelled as recommendations, candidates, options, or decisions required are not confirmed by the source brief.

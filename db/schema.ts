import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  picture: text("picture"),
  role: text("role", { enum: ["farmer", "buyer", "partner", "admin"] }).notNull().default("farmer"),
  locale: text("locale").notNull().default("en"),
  upiVpa: text("upi_vpa"),
  upiName: text("upi_name"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const farms = sqliteTable("farms", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  village: text("village").notNull(),
  district: text("district").notNull(),
  state: text("state").notNull(),
  flockSize: integer("flock_size").notNull().default(0),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
});

export const woolBatches = sqliteTable("wool_batches", {
  id: text("id").primaryKey(),
  farmerId: text("farmer_id").notNull().references(() => users.id),
  farmId: text("farm_id").references(() => farms.id),
  breed: text("breed").notNull(),
  shearedAt: integer("sheared_at", { mode: "timestamp_ms" }).notNull(),
  weightKg: real("weight_kg").notNull(),
  grade: text("grade").notNull().default("Pending"),
  micron: real("micron"),
  stapleMm: real("staple_mm"),
  status: text("status").notNull().default("registered"),
  reservePrice: real("reserve_price").notNull().default(0),
  currentOwnerId: text("current_owner_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const batchEvents = sqliteTable("batch_events", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").notNull().references(() => woolBatches.id),
  eventType: text("event_type").notNull(),
  title: text("title").notNull(),
  location: text("location"),
  actorId: text("actor_id").notNull(),
  notes: text("notes"),
  occurredAt: integer("occurred_at", { mode: "timestamp_ms" }).notNull(),
});

export const bids = sqliteTable("bids", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").notNull().references(() => woolBatches.id),
  buyerId: text("buyer_id").notNull().references(() => users.id),
  pricePerKg: real("price_per_kg").notNull(),
  pickupDays: integer("pickup_days").notNull(),
  paymentTerms: text("payment_terms").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const serviceListings = sqliteTable("service_listings", {
  id: text("id").primaryKey(),
  providerId: text("provider_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  name: text("name").notNull(),
  district: text("district").notNull(),
  priceLabel: text("price_label").notNull(),
  rating: real("rating").notNull().default(0),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
});

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").references(() => woolBatches.id),
  userId: text("user_id").notNull().references(() => users.id),
  kind: text("kind").notNull(),
  providerName: text("provider_name").notNull(),
  scheduledAt: integer("scheduled_at", { mode: "timestamp_ms" }).notNull(),
  status: text("status").notNull().default("requested"),
});

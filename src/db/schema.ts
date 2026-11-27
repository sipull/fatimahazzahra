import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";

export const entries = pgTable("entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  slug: text("slug"),
  excerpt: text("excerpt"),
  body: text("body"),
  imageUrl: text("image_url"),
  images: jsonb("images").$type<string[]>().default([]),
  files: jsonb("files")
    .$type<Array<{ name: string; url: string; apiUrl: string; size?: number; mime?: string; label?: string }>>()
    .default([]),
  links: jsonb("links")
    .$type<Array<{ title: string; url: string }>>()
    .default([]),
  meta: jsonb("meta").$type<Record<string, string>>().default({}),
  status: text("status").notNull().default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const media = pgTable("media", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  data: text("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type EntryRow = typeof entries.$inferSelect;
export type NewEntryRow = typeof entries.$inferInsert;
export type SettingRow = typeof settings.$inferSelect;
export type MediaRow = typeof media.$inferSelect;
export type NewMediaRow = typeof media.$inferInsert;

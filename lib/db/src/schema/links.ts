import { pgTable, text, serial, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// `userId` references the Supabase `auth.users.id` (uuid). Supabase Auth owns
// that table directly -- we do not mirror users into our own schema, we just
// store the foreign uuid here.
export const linksTable = pgTable("links", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  shortId: text("short_id").notNull().unique(),
  originalUrl: text("original_url").notNull(),
  title: text("title"),
  description: text("description"),
  clicks: integer("clicks").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertLinkSchema = createInsertSchema(linksTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  clicks: true,
});
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type LinkRow = typeof linksTable.$inferSelect;

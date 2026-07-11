import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { db, linksTable } from "@workspace/db";
import {
  CreateLinkBody,
  UpdateLinkBody,
  GetLinkParams,
  UpdateLinkParams,
  DeleteLinkParams,
  ResolveLinkParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 7);

function shortUrlFor(req: { protocol: string; get: (name: string) => string | undefined }, shortId: string): string {
  // The dashlink frontend (which owns the public `/:shortId` redirect route)
  // is served at a different host/port than this API in dev. Prefer the
  // shared dev domain so the displayed short URL is actually clickable.
  const publicHost = process.env.REPLIT_DEV_DOMAIN;
  if (publicHost) {
    return `https://${publicHost}/${shortId}`;
  }
  const host = req.get("host");
  return `${req.protocol}://${host}/${shortId}`;
}

function serializeLink(row: typeof linksTable.$inferSelect, req: Parameters<typeof shortUrlFor>[0]) {
  return {
    id: row.id,
    shortId: row.shortId,
    shortUrl: shortUrlFor(req, row.shortId),
    originalUrl: row.originalUrl,
    title: row.title,
    description: row.description,
    clicks: row.clicks,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

router.get("/links", requireAuth, async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.userId, req.userId!))
    .orderBy(desc(linksTable.createdAt));

  res.json(rows.map((row) => serializeLink(row, req)));
});

router.get("/links/summary", requireAuth, async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.userId, req.userId!))
    .orderBy(desc(linksTable.clicks));

  const totalLinks = rows.length;
  const totalClicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const mostClicked = rows.length > 0 && rows[0].clicks > 0 ? rows[0] : null;

  res.json({
    totalLinks,
    totalClicks,
    mostClicked: mostClicked ? serializeLink(mostClicked, req) : null,
  });
});

router.post("/links", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateLinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { originalUrl, title, description, shortId: customShortId } = parsed.data;

  if (customShortId) {
    const [existing] = await db.select().from(linksTable).where(eq(linksTable.shortId, customShortId));
    if (existing) {
      res.status(400).json({ error: "That short link is already taken" });
      return;
    }
  }

  const shortId = customShortId ?? nanoid();

  const [row] = await db
    .insert(linksTable)
    .values({
      userId: req.userId!,
      shortId,
      originalUrl,
      title: title ?? null,
      description: description ?? null,
    })
    .returning();

  res.status(201).json(serializeLink(row, req));
});

router.get("/links/:shortId", requireAuth, async (req, res): Promise<void> => {
  const params = GetLinkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(linksTable)
    .where(and(eq(linksTable.shortId, params.data.shortId), eq(linksTable.userId, req.userId!)));

  if (!row) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  res.json(serializeLink(row, req));
});

router.patch("/links/:shortId", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateLinkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateLinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { originalUrl, title, description, shortId: newShortId } = parsed.data;

  if (newShortId && newShortId !== params.data.shortId) {
    const [existing] = await db.select().from(linksTable).where(eq(linksTable.shortId, newShortId));
    if (existing) {
      res.status(400).json({ error: "That short link is already taken" });
      return;
    }
  }

  const updateData: Partial<typeof linksTable.$inferInsert> = {};
  if (originalUrl !== undefined) updateData.originalUrl = originalUrl;
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (newShortId !== undefined) updateData.shortId = newShortId;

  const [row] = await db
    .update(linksTable)
    .set(updateData)
    .where(and(eq(linksTable.shortId, params.data.shortId), eq(linksTable.userId, req.userId!)))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  res.json(serializeLink(row, req));
});

router.delete("/links/:shortId", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteLinkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(linksTable)
    .where(and(eq(linksTable.shortId, params.data.shortId), eq(linksTable.userId, req.userId!)))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/resolve/:shortId", async (req, res): Promise<void> => {
  const params = ResolveLinkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .update(linksTable)
    .set({ clicks: sql`${linksTable.clicks} + 1` })
    .where(eq(linksTable.shortId, params.data.shortId))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Short link not found" });
    return;
  }

  res.json({ originalUrl: row.originalUrl, title: row.title });
});

export default router;

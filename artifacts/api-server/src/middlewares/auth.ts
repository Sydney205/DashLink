import type { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabase";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userName?: string | null;
    }
  }
}

/**
 * Verifies the `Authorization: Bearer <token>` header against Supabase Auth
 * and attaches the resolved user id/email to the request. Responds 401 when
 * the header is missing or the token is invalid/expired.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  req.userId = data.user.id;
  req.userEmail = data.user.email ?? undefined;
  req.userName = (data.user.user_metadata?.name as string | undefined) ?? null;
  next();
}

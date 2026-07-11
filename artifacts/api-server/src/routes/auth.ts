import { Router, type IRouter } from "express";
import { SignupBody, SignupResponse, LoginBody, LoginResponse, GetCurrentUserResponse } from "@workspace/api-zod";
import { supabaseAnon, supabaseAdmin } from "../lib/supabase";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/auth/signup", async (req, res): Promise<void> => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password, name } = parsed.data;

  // Create the account pre-confirmed via the admin API so signup logs the
  // user in immediately, without waiting on a confirmation email (this app
  // is email/password only, no email verification step in the product).
  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (createError || !created.user) {
    req.log.warn({ err: createError?.message }, "Signup failed");
    const message =
      createError?.code === "email_exists" ? "An account with that email already exists" : createError?.message;
    res.status(400).json({ error: message ?? "Could not create account" });
    return;
  }

  const { data: signedIn, error: signInError } = await supabaseAnon.auth.signInWithPassword({ email, password });

  if (signInError || !signedIn.session) {
    req.log.error({ err: signInError?.message }, "Signup succeeded but sign-in failed");
    res.status(400).json({ error: "Account created, but could not sign in. Try logging in." });
    return;
  }

  res.status(201).json(
    SignupResponse.parse({
      accessToken: signedIn.session.access_token,
      user: {
        id: created.user.id,
        email: created.user.email,
        name: (created.user.user_metadata?.name as string | undefined) ?? name,
      },
    }),
  );
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  res.status(200).json(
    LoginResponse.parse({
      accessToken: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: (data.user.user_metadata?.name as string | undefined) ?? null,
      },
    }),
  );
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  res.json(
    GetCurrentUserResponse.parse({
      id: req.userId,
      email: req.userEmail,
      name: req.userName ?? null,
    }),
  );
});

export default router;

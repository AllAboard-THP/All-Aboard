import type { FastifyInstance } from "fastify";
import type { AppDatabase } from "../../db/client.js";
import { issueAuthToken } from "../session.js";
import {
  buildGoogleAuthorizationUrl,
  exchangeGoogleAuthorizationCode,
  fetchGoogleUserProfile,
} from "./google-client.js";
import { getGoogleOAuthConfig, isGoogleOAuthConfigured } from "./google-config.js";
import { linkGoogleUser } from "./link-user.js";
import { createOAuthState, generatePkcePair, parseOAuthState } from "./oauth-state.js";
import {
  buildOAuthErrorRedirectUrl,
  buildPostOAuthRedirectUrl,
} from "./post-login-redirect.js";

export function registerGoogleOAuthRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  app.get("/auth/google", async (_request, reply) => {
    const config = getGoogleOAuthConfig();
    if (!config) {
      return reply.code(503).send({ error: "oauth_not_configured" });
    }

    const { codeVerifier, codeChallenge } = generatePkcePair();
    const state = createOAuthState(codeVerifier);
    const url = buildGoogleAuthorizationUrl(config, state, codeChallenge);
    return reply.redirect(url);
  });

  app.get("/auth/google/callback", async (request, reply) => {
    const config = getGoogleOAuthConfig();
    if (!config) {
      return reply.code(503).send({ error: "oauth_not_configured" });
    }
    if (!db) {
      return reply.redirect(buildOAuthErrorRedirectUrl(config.webAppUrl));
    }

    const query = request.query as {
      code?: string;
      state?: string;
      error?: string;
    };

    if (query.error || !query.code || !query.state) {
      return reply.redirect(buildOAuthErrorRedirectUrl(config.webAppUrl));
    }

    const parsedState = parseOAuthState(query.state);
    if (!parsedState) {
      return reply.redirect(buildOAuthErrorRedirectUrl(config.webAppUrl));
    }

    const tokenResult = await exchangeGoogleAuthorizationCode(
      config,
      query.code,
      parsedState.codeVerifier,
    );
    if (tokenResult === "token_exchange_failed") {
      return reply.redirect(buildOAuthErrorRedirectUrl(config.webAppUrl));
    }

    const profile = await fetchGoogleUserProfile(tokenResult.accessToken);
    if (profile === "profile_fetch_failed") {
      return reply.redirect(buildOAuthErrorRedirectUrl(config.webAppUrl));
    }

    const linked = await linkGoogleUser(db, profile);
    if (linked === "email_not_verified" || linked === "database_unavailable") {
      return reply.redirect(buildOAuthErrorRedirectUrl(config.webAppUrl));
    }

    await issueAuthToken(reply, linked.userId, linked.role);
    const redirectUrl = buildPostOAuthRedirectUrl(
      config.webAppUrl,
      linked.cguAcceptedAt,
    );
    return reply.redirect(redirectUrl);
  });
}

export { isGoogleOAuthConfigured };

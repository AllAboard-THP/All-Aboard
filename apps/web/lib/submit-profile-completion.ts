import type { OAuthOnboardingSubmitInput } from "@allaboard/ui/patterns/legacy-auth-patterns";
import type { UpdateUserMeBody } from "@allaboard/types";

import { patchUserProfile, type PatchUserProfileResult } from "./patch-user-profile";

export type SubmitProfileCompletionResult = PatchUserProfileResult;

/** Persists profile fields and optionally records CGU acceptance. */
export async function submitProfileCompletion(
  input: OAuthOnboardingSubmitInput,
  options: { acceptLegal: boolean },
): Promise<SubmitProfileCompletionResult> {
  if (options.acceptLegal && !input.acceptCgu) {
    return { ok: false, code: "cgu_accept_failed" };
  }

  const body: UpdateUserMeBody = {
    fullName: input.fullName,
    educationLevel: input.educationLevel ?? null,
    headline: input.headline ?? null,
  };

  return patchUserProfile({
    ...body,
    acceptLegal: options.acceptLegal,
  });
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** True for a user uuid, the only id accepted in `/u/<id>` profile atom URLs. */
export function isProfileUuid(value: string): boolean {
  return UUID_RE.test(value);
}

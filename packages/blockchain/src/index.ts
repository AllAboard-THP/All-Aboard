/* global URL -- WHATWG URL, available in Node and browsers. */
/**
 * Intuition graph shape for skill certifications (ADR 0009 §2).
 *
 * Pure code: no secrets, no network. Every byte below ends up in an atom id,
 * so changing one changes the ids already on-chain. Golden tests freeze them.
 */
import {
  calculateAtomId,
  calculateCounterTripleId,
  calculateTripleId,
} from "@0xintuition/ids";
import {
  attestedByAtomData,
  attestedById,
} from "@0xintuition/predicates/attestedBy";
import { expertInAtomData, expertInId } from "@0xintuition/predicates/expertIn";
import { buildDefinedTerm } from "@0xintuition/primitives/atom";

export type Hex = `0x${string}`;

/** One atom: the exact string written on-chain and its deterministic id. */
export type AtomTerm = { data: string; id: Hex };

/** One triple: subject, predicate and object term ids, and its own id. */
export type TripleTerm = {
  subjectId: Hex;
  predicateId: Hex;
  objectId: Hex;
  id: Hex;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Objects become their JSON string, exactly as the predicate registry does. */
function atomString(data: unknown): string {
  return typeof data === "string" ? data : JSON.stringify(data);
}

function atom(data: string): AtomTerm {
  return { data, id: calculateAtomId(data) as Hex };
}

function triple(subjectId: Hex, predicateId: Hex, objectId: Hex): TripleTerm {
  return {
    subjectId,
    predicateId,
    objectId,
    id: calculateTripleId(subjectId, predicateId, objectId) as Hex,
  };
}

/** `expertIn` and `attestedBy` from the canonical registry (ADR 0009 §2). */
export const PREDICATES = {
  expertIn: atom(atomString(expertInAtomData)),
  attestedBy: atom(atomString(attestedByAtomData)),
} as const;

if (
  PREDICATES.expertIn.id !== expertInId ||
  PREDICATES.attestedBy.id !== attestedById
) {
  throw new Error("Predicate atom bytes do not match the Intuition registry");
}

/**
 * Normalizes the web origin used in person atoms, e.g. `https://allaboard.fr`.
 * No path, query or trailing slash, so one person always gets one atom.
 */
export function normalizeProfileOrigin(origin: string): string {
  let url: URL;
  try {
    url = new URL(origin.trim());
  } catch {
    throw new Error(`Invalid profile origin: ${origin}`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`Profile origin must be http(s): ${origin}`);
  }
  if (url.pathname !== "/" || url.search || url.hash || url.username) {
    throw new Error(`Profile origin must be a bare origin: ${origin}`);
  }
  return url.origin;
}

/**
 * Person atom: the stable public profile URL `<origin>/u/<user uuid>`.
 * No name, email or avatar on-chain (ADR 0009 §2).
 */
export function personAtom(origin: string, userId: string): AtomTerm {
  if (!UUID_RE.test(userId)) {
    throw new Error(`Person atom needs a user uuid, got: ${userId}`);
  }
  return atom(`${normalizeProfileOrigin(origin)}/u/${userId.toLowerCase()}`);
}

/**
 * Skill atom: schema.org `DefinedTerm` with `name` only. The label is frozen
 * once a skill exists, because it gives these bytes.
 */
export function skillAtom(label: string): AtomTerm {
  const name = label.trim();
  if (!name) {
    throw new Error("Skill atom needs a non-empty label");
  }
  const built = buildDefinedTerm({ name });
  if (!built.success) {
    throw new Error(`Invalid skill atom for "${name}"`);
  }
  return atom(atomString(built.value.data));
}

/** `(person) expertIn (skill)`: shared by every +1 on that person and skill. */
export function claimTriple(personAtomId: Hex, skillAtomId: Hex): TripleTerm {
  return triple(personAtomId, PREDICATES.expertIn.id, skillAtomId);
}

/** `(claim) attestedBy (peer)`: one +1, a triple whose subject is a triple. */
export function attestationTriple(claimId: Hex, peerAtomId: Hex): TripleTerm {
  return triple(claimId, PREDICATES.attestedBy.id, peerAtomId);
}

/** Counter vault of a triple, for signalling a withdrawal later (ADR 0009 §5). */
export function counterTripleId(tripleId: Hex): Hex {
  return calculateCounterTripleId(tripleId) as Hex;
}

export type CertificationInput = {
  /** Web origin of the environment, e.g. `https://dev.allaboard.fr`. */
  profileOrigin: string;
  recipientId: string;
  attesterId: string;
  skillLabel: string;
};

/** Every term one +1 needs, in creation order: atoms, then claim, then +1. */
export type CertificationTerms = {
  recipient: AtomTerm;
  attester: AtomTerm;
  skill: AtomTerm;
  predicates: typeof PREDICATES;
  claim: TripleTerm;
  attestation: TripleTerm;
};

export function certificationTerms(input: CertificationInput): CertificationTerms {
  if (input.recipientId.toLowerCase() === input.attesterId.toLowerCase()) {
    throw new Error("A +1 needs two different people");
  }
  const recipient = personAtom(input.profileOrigin, input.recipientId);
  const attester = personAtom(input.profileOrigin, input.attesterId);
  const skill = skillAtom(input.skillLabel);
  const claim = claimTriple(recipient.id, skill.id);
  const attestation = attestationTriple(claim.id, attester.id);
  return {
    recipient,
    attester,
    skill,
    predicates: PREDICATES,
    claim,
    attestation,
  };
}

/** Atoms of a +1, in the order the publisher creates them. */
export function certificationAtoms(terms: CertificationTerms): AtomTerm[] {
  return [
    terms.predicates.expertIn,
    terms.predicates.attestedBy,
    terms.recipient,
    terms.attester,
    terms.skill,
  ];
}

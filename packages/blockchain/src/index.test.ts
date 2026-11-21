import { calculateAtomId } from "@0xintuition/ids";
import { attestedById } from "@0xintuition/predicates/attestedBy";
import { expertInId } from "@0xintuition/predicates/expertIn";
import { describe, expect, it } from "vitest";
import {
  attestationTriple,
  certificationAtoms,
  certificationTerms,
  claimTriple,
  counterTripleId,
  normalizeProfileOrigin,
  personAtom,
  PREDICATES,
  skillAtom,
  type Hex,
} from "./index";

/**
 * Golden values from the real testnet run of spike #161 (2026-11-02,
 * blocks 9375153 to 9375155). Contract reads confirm both triples exist.
 * If one of these fails, the code no longer produces the ids on-chain.
 */
const SPIKE = {
  person: "0x221df0daec9b22f92a666df44ab942f55568dd43b55c643906c32bc4eb303189",
  peer: "0x33875ca1e788d5e9b6b2e1f6b6d2f487c2d1f8dc1595f7a912cb1ddcc34eda12",
  skillRails: "0x3efcde361657ca649e2228d4a70608e9402231f6930fd49e91c1649cba433eb2",
  claim: "0x650cf78e0e2837a891777efbc710c1258fcead4df5bbed57e8e27a8a9688d971",
  plusOne: "0x8ab8777b0ed073b51d0f3f2c98ec3694b828180b376ad7f650133b4066a973c3",
} as const;

describe("golden ids (spike #161, on testnet)", () => {
  it("skill atom bytes for Ruby on Rails", () => {
    const skill = skillAtom("Ruby on Rails");
    expect(skill.data).toBe(
      '{"@context":"https://schema.org/","@type":"DefinedTerm","name":"Ruby on Rails"}',
    );
    expect(skill.id).toBe(SPIKE.skillRails);
  });

  it("claim and +1 triple ids", () => {
    // The spike used placeholder person URLs; the triple ids only depend on atom ids.
    expect(
      calculateAtomId("https://example.org/allaboard-spike-161/u/recipient"),
    ).toBe(SPIKE.person);
    const claim = claimTriple(SPIKE.person, SPIKE.skillRails);
    expect(claim.id).toBe(SPIKE.claim);
    expect(attestationTriple(claim.id, SPIKE.peer).id).toBe(SPIKE.plusOne);
  });

  it("predicates match the registry", () => {
    expect(PREDICATES.expertIn.id).toBe(expertInId);
    expect(PREDICATES.attestedBy.id).toBe(attestedById);
    expect(PREDICATES.expertIn.id.startsWith("0x4c286cc4")).toBe(true);
    expect(PREDICATES.attestedBy.id.startsWith("0x46edc699")).toBe(true);
  });
});

describe("person atom", () => {
  const user = "3E08BA07-BC82-4D47-A3F8-BCA99C378C80";

  it("is the stable /u/<uuid> URL on the given origin", () => {
    expect(personAtom("https://allaboard.fr/", user).data).toBe(
      "https://allaboard.fr/u/3e08ba07-bc82-4d47-a3f8-bca99c378c80",
    );
    expect(personAtom("https://allaboard.fr", user).id).toBe(
      personAtom("https://ALLABOARD.fr/", user.toLowerCase()).id,
    );
  });

  it("rejects non-uuid ids and origins with a path", () => {
    expect(() => personAtom("https://allaboard.fr", "bob")).toThrow();
    expect(() => normalizeProfileOrigin("https://allaboard.fr/fr")).toThrow();
    expect(() => normalizeProfileOrigin("ftp://allaboard.fr")).toThrow();
    expect(() => normalizeProfileOrigin("not a url")).toThrow();
  });
});

describe("certificationTerms", () => {
  const input = {
    profileOrigin: "https://dev.allaboard.fr",
    recipientId: "3e08ba07-bc82-4d47-a3f8-bca99c378c80",
    attesterId: "93fe224f-b121-4d3e-8c9a-3755ff91e00c",
    skillLabel: "Node.js",
  };

  it("links recipient, skill, claim and +1", () => {
    const terms = certificationTerms(input);
    expect(terms.claim.subjectId).toBe(terms.recipient.id);
    expect(terms.claim.objectId).toBe(terms.skill.id);
    expect(terms.attestation.subjectId).toBe(terms.claim.id);
    expect(terms.attestation.objectId).toBe(terms.attester.id);
    expect(certificationAtoms(terms).map((a) => a.id)).toEqual([
      PREDICATES.expertIn.id,
      PREDICATES.attestedBy.id,
      terms.recipient.id,
      terms.attester.id,
      terms.skill.id,
    ]);
  });

  it("is deterministic, and shares the claim between peers", () => {
    const a = certificationTerms(input);
    const b = certificationTerms({
      ...input,
      attesterId: "11111111-1111-4111-8111-111111111111",
    });
    expect(certificationTerms(input)).toEqual(a);
    expect(b.claim.id).toBe(a.claim.id);
    expect(b.attestation.id).not.toBe(a.attestation.id);
  });

  it("rejects a +1 to oneself", () => {
    expect(() =>
      certificationTerms({ ...input, attesterId: input.recipientId }),
    ).toThrow();
  });

  it("gives each triple a different counter vault", () => {
    const { attestation } = certificationTerms(input);
    const counter: Hex = counterTripleId(attestation.id);
    expect(counter).not.toBe(attestation.id);
  });
});

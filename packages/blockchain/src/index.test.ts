import { calculateAtomId } from "@0xintuition/ids";
import { attestedById } from "@0xintuition/predicates/attestedBy";
import { contributedToId } from "@0xintuition/predicates/contributedTo";
import { expertInId } from "@0xintuition/predicates/expertIn";
import { describe, expect, it } from "vitest";
import {
  attestationTriple,
  certificationAtoms,
  certificationTerms,
  claimTriple,
  counterTripleId,
  experienceAtoms,
  experienceTerms,
  missionAtom,
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

/**
 * Golden values for experience certifications (ADR 0010 §2). Not on-chain yet:
 * they freeze the bytes so a refactor cannot silently move the ids.
 */
describe("experience terms (ADR 0010)", () => {
  const input = {
    profileOrigin: "https://dev.allaboard.fr",
    missionId: "5B0F7C1E-2D3A-4C5B-9E8F-0A1B2C3D4E5F",
    recipientId: "3e08ba07-bc82-4d47-a3f8-bca99c378c80",
    attesterId: "93fe224f-b121-4d3e-8c9a-3755ff91e00c",
  };

  it("contributedTo matches the registry", () => {
    expect(PREDICATES.contributedTo.id).toBe(contributedToId);
    expect(PREDICATES.contributedTo.id).toBe(
      "0x88a77127ef88a3abe7130b47a11e90b1ddad8c66a36c6cc9456688143ee8977a",
    );
  });

  it("mission atom is only the /m/<uuid> URL", () => {
    const mission = missionAtom("https://dev.allaboard.fr/", input.missionId);
    expect(mission.data).toBe(
      "https://dev.allaboard.fr/m/5b0f7c1e-2d3a-4c5b-9e8f-0a1b2c3d4e5f",
    );
    expect(mission.id).toBe(
      "0x4611e7db218e16fff8a4572b1571be8856f3774650891f34738b4aae8b902647",
    );
    expect(() => missionAtom("https://dev.allaboard.fr", "m-1")).toThrow();
  });

  it("links participant, mission, claim and validation", () => {
    const terms = experienceTerms(input);
    expect(terms.claim.subjectId).toBe(terms.recipient.id);
    expect(terms.claim.predicateId).toBe(PREDICATES.contributedTo.id);
    expect(terms.claim.objectId).toBe(terms.mission.id);
    expect(terms.attestation.subjectId).toBe(terms.claim.id);
    expect(terms.attestation.predicateId).toBe(PREDICATES.attestedBy.id);
    expect(terms.attestation.objectId).toBe(terms.attester.id);
    expect(terms.claim.id).toBe(
      "0xd07cc47d5fe18b1626a0086f215a37901ab20fa3369b4be1ca58b0260c7228f1",
    );
    expect(terms.attestation.id).toBe(
      "0xa20c187389ea3c873df7b6116af0f5d13181e91b140445281b1e44f8ef1f0dcb",
    );
    expect(experienceAtoms(terms).map((a) => a.id)).toEqual([
      PREDICATES.contributedTo.id,
      PREDICATES.attestedBy.id,
      terms.recipient.id,
      terms.attester.id,
      terms.mission.id,
    ]);
  });

  it("rejects validating oneself", () => {
    expect(() =>
      experienceTerms({ ...input, attesterId: input.recipientId }),
    ).toThrow();
  });
});

import { createHash, randomBytes } from "node:crypto";

/** URL-safe random token. The raw value goes to the user; only its hash is stored. */
export function newToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Human-friendly reference like AOM-7K3Q9P (no ambiguous characters). */
export function newReference(prefix: string): string {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const buf = randomBytes(6);
  let out = "";
  for (const b of buf) out += alphabet[b % alphabet.length];
  return `${prefix}-${out}`;
}

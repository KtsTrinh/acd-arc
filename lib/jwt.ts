import jwt, { type SignOptions } from "jsonwebtoken";

export const JWT_SECRET =
  process.env.JWT_SECRET || "acd_super_secret_architectural_jwt_key_2026";

export function signToken(
  payload: Record<string, unknown>,
  expiresIn: string = "7d"
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): Record<string, any> | null {
  try {
    return jwt.verify(token, JWT_SECRET) as Record<string, any>;
  } catch {
    return null;
  }
}

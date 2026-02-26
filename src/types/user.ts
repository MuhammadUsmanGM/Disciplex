/**
 * User & Identity Types
 */

export type TonePreference = 'analytical' | 'brutal';

export interface User {
  id: string;
  email: string;
  identity_claim: string | null;
  refuse_to_be: string | null;
  tone_preference: TonePreference;
  reckoning_time: string; // HH:MM format
  created_at: string;
}

export interface IdentitySetup {
  identity_claim: string;
  refuse_to_be: string;
  non_negotiables: string[];
}

import type { SQL, SQLWrapper, Placeholder } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

// Helper to patch missing types in third-party libraries or internal modules
declare global {
  // Patch for validator if @types/validator is missing or incomplete
  module "validator" {
    export function isStrongPassword(str: string, options?: any): boolean;
    export function isEmail(str: string, options?: any): boolean;
    export function normalizeEmail(str: string, options?: any): string;
    export function trim(str: string, chars?: string): string;
    export function escape(str: string): string;
  }
}

// Type guard for Drizzle SQL values
export function isSQLWrapper(value: unknown): value is SQLWrapper {
  return typeof value === "object" && value !== null && "getSQL" in value;
}

// Safe type for insert values that might be SQL objects
export type SafeInsertValue<T> = T | SQL<unknown> | Placeholder<string, any>;

// Helper to enforce non-null job IDs for Drizzle queries
export function ensureJobId(id: string | undefined | null): string {
  if (!id) throw new Error("Job ID is required");
  return id;
}

// Patched Animation Config for Portfolio Director
export interface PatchedAnimationConfig {
  entryDuration: number;
  exitDuration: number;
  backgroundColor: string;
  textColor: string;
  parallaxIntensity: number;
  entryEffect: string;
  exitEffect: string;
  headingSize: string;
  bodySize: string;
  [key: string]: any; // Index signature to allow dynamic property access
}


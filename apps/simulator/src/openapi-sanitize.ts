/**
 * Post-processes an OpenAPI spec object to convert TypeBox JSON Schema
 * constructs into OpenAPI 3.0.x compatible equivalents.
 *
 * Fixes:
 * - `const` → `enum: [value]` (TypeBox t.Literal)
 * - Tuple-style `items` (array) + `additionalItems` → single `items` object (TypeBox t.Tuple)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeForOas30(obj: any): void {
  if (obj === null || typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      sanitizeForOas30(item);
    }
    return;
  }

  // Fix `const` → `enum: [value]` (from t.Literal)
  if ("const" in obj) {
    obj.enum = [obj.const];
    delete obj.const;
  }

  // Fix tuple-style items (array of schemas) → single items schema (from t.Tuple)
  if (Array.isArray(obj.items) && "additionalItems" in obj) {
    // All tuple items should have the same type in our schemas (number pairs)
    // Use the first item's schema as the unified items schema
    obj.items = obj.items[0];
    delete obj.additionalItems;
  }

  // Recurse into all properties
  for (const value of Object.values(obj)) {
    sanitizeForOas30(value);
  }
}

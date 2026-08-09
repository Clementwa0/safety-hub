// Barrel for the general-purpose validation helpers that used to live at
// `@/lib/validation`. Entity-specific Zod schemas (product, address,
// checkout) are their own sibling files in this folder rather than
// re-exported here, matching how they were already imported individually
// (`@/lib/validation/product`, etc.) before the move.
export * from "./common";

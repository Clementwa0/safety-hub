import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const readRoute = (...parts: string[]) => fs.readFileSync(path.join(root, ...parts), "utf8");

test("document link issuance and email delivery are staff-gated", () => {
  for (const action of ["share-link", "email"]) {
    const route = readRoute("app", "api", "documents", "[type]", "[id]", action, "route.ts");
    assert.match(route, /const user = await requireStaff\(\);/);
    assert.match(route, /if \(!user\)\s*\{\s*return apiError\("Unauthorized", \[\], 401\)/);
  }
});

test("public PDF access verifies a document-bound share token before loading the document", () => {
  const route = readRoute("app", "api", "documents", "[type]", "[id]", "pdf", "route.ts");
  assert.match(route, /verifyDocumentShareToken\(token as string, type, id\)/);
  const tokenCheck = route.indexOf("verifyDocumentShareToken(token as string, type, id)");
  const documentLoad = route.indexOf("await loadSalesDocument(type, id)");
  assert.ok(tokenCheck >= 0 && tokenCheck < documentLoad);
  assert.match(route, /"Referrer-Policy": "no-referrer"/);
});

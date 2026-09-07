import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";

import { signDocumentShareToken, verifyDocumentShareToken } from "@/modules/sales-documents/share-token";

process.env.JWT_SECRET = "test-only-document-share-secret";

test("share token is scoped to the exact sales document", () => {
  const token = signDocumentShareToken("invoice", "invoice-id");

  assert.equal(verifyDocumentShareToken(token, "invoice", "invoice-id"), true);
  assert.equal(verifyDocumentShareToken(token, "quotation", "invoice-id"), false);
  assert.equal(verifyDocumentShareToken(token, "invoice", "different-id"), false);
});

test("share token rejects a validly signed token with the wrong audience", () => {
  const token = jwt.sign(
    { docType: "invoice", docId: "invoice-id" },
    process.env.JWT_SECRET!,
    { algorithm: "HS256", issuer: "safety-hub", audience: "another-service", expiresIn: "1h" },
  );

  assert.equal(verifyDocumentShareToken(token, "invoice", "invoice-id"), false);
});

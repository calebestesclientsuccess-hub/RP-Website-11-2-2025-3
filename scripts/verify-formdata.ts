import assert from "node:assert/strict";
import { sanitizeInput } from "../server/middleware/input-sanitization";
import { normalizeFormData } from "../server/utils/form-data";

const middleware = sanitizeInput([], { excludeFields: ["formData"] });

const req: any = {
  body: {
    formData: '{"lead":"value"}',
    name: "<script>alert('xss')</script>",
  },
};

middleware(req, {} as any, () => {});

assert.equal(req.body.formData, '{"lead":"value"}');
assert.ok(req.body.name.includes("&lt;script&gt;alert"));

const normalized = normalizeFormData(req.body.formData);
assert.ok(normalized.value);
assert.doesNotThrow(() => JSON.parse(normalized.value!));

console.log("✅ Lead formData sanitation verified");


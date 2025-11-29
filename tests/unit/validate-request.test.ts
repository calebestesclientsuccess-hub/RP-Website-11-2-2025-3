import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { validateRequest } from "../../server/middleware/validation";

const createMockRes = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
};

describe("validateRequest middleware", () => {
  it("passes valid payloads and attaches parsed data", () => {
    const middleware = validateRequest(
      z.object({ name: z.string(), age: z.number().int() }),
    );

    const req: any = { body: { name: "Ada", age: 37 } };
    const res = createMockRes();
    const next = vi.fn();

    middleware(req, res as any, next);

    expect(req.validated).toEqual({ name: "Ada", age: 37 });
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 400 with validation message on failure", () => {
    const middleware = validateRequest(z.object({ slug: z.string().uuid() }));
    const req: any = { body: { slug: "not-a-uuid" } };
    const res = createMockRes();
    const next = vi.fn();

    middleware(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Validation failed",
      }),
    );
    expect(next).not.toHaveBeenCalled();
    expect(req.validated).toBeUndefined();
  });
});


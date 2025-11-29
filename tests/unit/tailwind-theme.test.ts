import config from "../../tailwind.config";

describe("Tailwind brand variables", () => {
  it("defines scoped branding colors", () => {
    const extend = config.theme?.extend as Record<string, any>;
    const colors = extend?.colors || {};

    expect(colors["brand-bg"]).toBeDefined();
    expect(colors["brand-text"]).toBeDefined();
    expect(colors["brand-primary"]).toBeDefined();
    expect(colors["brand-border"]).toBeDefined();
  });
});


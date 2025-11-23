import { test, expect } from "@playwright/test";

const CHUNK_RELOAD_FLAG = "__revparty_last_chunk_reload";
const SW_CLEANUP_FLAG = "__revparty_sw_cleanup__";

test.describe("Production resilience & hygiene", () => {
  test("automatically reloads when a lazy chunk fails to load", async ({ page }) => {
    let chunkAbortions = 0;
    await page.route("**/assets/*.js", (route) => {
      const url = route.request().url().toLowerCase();
      if (chunkAbortions === 0 && url.includes("loginpage")) {
        chunkAbortions += 1;
        return route.abort();
      }
      return route.continue();
    });

    await page.goto("/admin/login");

    await expect.poll(
      async () =>
        page.evaluate(() =>
          window.sessionStorage.getItem("__revparty_last_chunk_reload"),
        ),
      {
        timeout: 15_000,
        message: "Chunk reload flag was never set",
      },
    ).resolves.toBeTruthy();

    await page.waitForSelector('[data-testid="text-login-title"]', {
      timeout: 30_000,
    });

    expect(chunkAbortions).toBe(1);
  });

  test("service workers are unregistered and cleanup flag is set", async ({ page }) => {
    await page.goto("/");

    const swInfo = await page.evaluate(async (cleanupFlagKey) => {
      if (!("serviceWorker" in navigator)) {
        return { supported: false };
      }
      const registrations = await navigator.serviceWorker.getRegistrations();
      return {
        supported: true,
        registrations: registrations.length,
        cleanupFlag: window.sessionStorage.getItem(cleanupFlagKey),
      };
    }, SW_CLEANUP_FLAG);

    expect(swInfo.supported).toBeTruthy();
    expect(swInfo.registrations).toBe(0);
    expect(swInfo.cleanupFlag).toBeTruthy();
  });

  test("viewport meta enforces mobile-safe settings", async ({ page }) => {
    await page.goto("/");
    const content = await page
      .locator('meta[name="viewport"]')
      .getAttribute("content");

    expect(content).toContain("width=device-width");
    expect(content).toContain("initial-scale=1");
    expect(content).toContain("viewport-fit=cover");
  });
});


import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  webServer: {
    command: "npx ng serve localforage",
    port: 4203,
    reuseExistingServer: !process.env["CI"],
  },
  testDir: "testing-apps/localforage/e2e",
};

export default config;

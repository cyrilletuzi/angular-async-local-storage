import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  webServer: {
    command: "npx ng serve demo",
    port: 4201,
    reuseExistingServer: !process.env["CI"],
  },
  testDir: "testing-apps/demo/e2e",
};

export default config;

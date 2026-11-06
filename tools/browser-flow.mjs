import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const configFile = process.argv[2];
if (!configFile) {
  console.log("Usage: node tools/browser-flow.mjs workflows/demo.json");
  process.exit(1);
}

const config = JSON.parse(readFileSync(configFile, "utf8"));
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();
  await page.goto(config.url, { waitUntil: "domcontentloaded", timeout: 60000 });
  console.log("STARTED:", page.url());

  for (const [i, step] of config.steps.entries()) {
    console.log(`STEP ${i + 1}: ${step.action}`);

    if (step.action === "goto") {
      await page.goto(step.url, { waitUntil: "domcontentloaded" });
    } else if (step.action === "fill") {
      await page.locator(step.selector).fill(step.value);
    } else if (step.action === "click") {
      await page.locator(step.selector).click();
    } else if (step.action === "read") {
      console.log((await page.locator(step.selector || "body").innerText()).slice(0, 3000));
    } else if (step.action === "screenshot") {
      mkdirSync(dirname(step.path), { recursive: true });
      await page.screenshot({ path: step.path, fullPage: true });
      console.log("SAVED:", step.path);
    } else if (step.action === "wait") {
      await page.waitForTimeout(step.ms || 1000);
    } else {
      throw new Error("Unknown action: " + step.action);
    }
  }

  console.log("FLOW COMPLETED");
} finally {
  await browser.close();
}

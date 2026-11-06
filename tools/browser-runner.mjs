import { chromium } from "playwright";

const [action, url, ...args] = process.argv.slice(2);

if (!action || !url) {
  console.log("Usage:");
  console.log("node tools/browser-runner.mjs open URL");
  console.log("node tools/browser-runner.mjs read URL");
  console.log("node tools/browser-runner.mjs fill URL SELECTOR TEXT");
  console.log("node tools/browser-runner.mjs click URL SELECTOR");
  console.log("node tools/browser-runner.mjs screenshot URL [FILE]");
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

  if (action === "open") {
    console.log("OPENED:", page.url());
    console.log("TITLE:", await page.title());
  } else if (action === "read") {
    console.log((await page.locator("body").innerText()).slice(0, 5000));
  } else if (action === "fill") {
    await page.locator(args[0]).fill(args.slice(1).join(" "));
    console.log("FILLED:", args[0]);
  } else if (action === "click") {
    await page.locator(args[0]).click();
    console.log("CLICKED:", args[0]);
    console.log("URL:", page.url());
  } else if (action === "screenshot") {
    const file = args[0] || "artifacts/last-page.png";
    await page.screenshot({ path: file, fullPage: true });
    console.log("SAVED:", file);
  } else {
    console.log("Unknown action:", action);
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}

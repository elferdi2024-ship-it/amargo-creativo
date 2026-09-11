// filepath: scripts/capture-yoyo.mjs
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function capture() {
  console.log("Launching browser to capture Yoyo Juanito...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  await page.goto("https://yoyo-juanito.elferdi2024.workers.dev/", {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  await page.waitForTimeout(1500);

  const outDir = path.resolve("public/projects");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPathPng = path.join(outDir, "yoyo-juanito-preview.png");
  await page.screenshot({ path: outPathPng, fullPage: false });
  console.log(`Saved screenshot to ${outPathPng}`);

  await page.screenshot({ path: path.join(outDir, "yoyo-juanito.png"), fullPage: false });

  await browser.close();
  console.log("Capture completed!");
}

capture().catch((err) => {
  console.error("Error capturing Yoyo Juanito:", err);
  process.exit(1);
});

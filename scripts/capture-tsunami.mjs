// filepath: scripts/capture-tsunami.mjs
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function capture() {
  console.log("Launching browser to capture Tsunami Uruguay...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  await page.goto("https://tsunami-uruguay.elferdi2024.workers.dev/", {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  // Esperar un momento a que terminen animaciones
  await page.waitForTimeout(1500);

  const outDir = path.resolve("public/projects");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPathWebp = path.join(outDir, "tsunami-preview.webp");
  const outPathPng = path.join(outDir, "tsunami-preview.png");

  await page.screenshot({ path: outPathPng, fullPage: false });
  console.log(`Saved screenshot to ${outPathPng}`);

  // Also full hero screenshot
  await page.screenshot({ path: path.join(outDir, "tsunami.png"), fullPage: false });

  await browser.close();
  console.log("Capture completed!");
}

capture().catch((err) => {
  console.error("Error capturing:", err);
  process.exit(1);
});

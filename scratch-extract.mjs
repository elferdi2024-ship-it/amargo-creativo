import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const framesDir = path.resolve('public/hero-frames');
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

async function extract() {
  console.log('1. Launching system Chrome...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  console.log('2. Opening test page with localhost video...');
  await page.goto('about:blank');
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0;background:#000;">
        <video id="v" src="http://localhost:4321/hero-scroll.mp4" muted playsinline></video>
        <canvas id="c"></canvas>
      </body>
    </html>
  `);

  console.log('3. Waiting for video metadata...');
  const info = await page.evaluate(async () => {
    const v = document.getElementById('v');
    return new Promise((resolve) => {
      if (v.readyState >= 1) {
        resolve({ duration: v.duration, width: v.videoWidth, height: v.videoHeight });
      } else {
        v.onloadedmetadata = () => {
          resolve({ duration: v.duration, width: v.videoWidth, height: v.videoHeight });
        };
      }
    });
  });

  console.log(`4. Video metadata: ${info.duration}s, ${info.width}x${info.height}`);
  const totalFrames = 60;
  console.log(`5. Extracting ${totalFrames} frames...`);

  for (let i = 0; i < totalFrames; i++) {
    const targetTime = (i / (totalFrames - 1)) * info.duration;

    const frameBase64 = await page.evaluate(async ({ time }) => {
      const v = document.getElementById('v');
      const c = document.getElementById('c');
      const ctx = c.getContext('2d');

      return new Promise((resolve) => {
        v.currentTime = time;
        v.onseeked = () => {
          c.width = v.videoWidth;
          c.height = v.videoHeight;
          ctx.drawImage(v, 0, 0, c.width, c.height);
          const webpData = c.toDataURL('image/webp', 0.80);
          resolve(webpData.split(',')[1]);
        };
      });
    }, { time: targetTime });

    const filename = `frame_${String(i + 1).padStart(4, '0')}.webp`;
    const filePath = path.join(framesDir, filename);
    fs.writeFileSync(filePath, Buffer.from(frameBase64, 'base64'));

    if ((i + 1) % 15 === 0 || i === totalFrames - 1) {
      console.log(`   Saved frame ${i + 1}/${totalFrames}`);
    }
  }

  await browser.close();
  console.log('✓ All 60 frames extracted to public/hero-frames/');
}

extract().catch((err) => {
  console.error('Extraction error:', err);
  process.exit(1);
});

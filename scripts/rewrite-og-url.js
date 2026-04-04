/**
 * Zalo / Facebook / Messenger cần og:image là URL tuyệt đối (https://...).
 * CRA thường để content="/Anh/1.jpg" — crawler không gắn domain → ô trắng.
 * Trên Vercel: biến VERCEL_URL có sẵn khi build. Domain riêng: đặt PUBLIC_SITE_URL.
 */
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'build', 'index.html');

if (!fs.existsSync(indexPath)) {
  process.exit(0);
}

let site = process.env.PUBLIC_SITE_URL || process.env.REACT_APP_SITE_URL || '';
if (!site && process.env.VERCEL_URL) {
  site = `https://${process.env.VERCEL_URL}`;
}
site = site.replace(/\/$/, '');

if (!site) {
  console.warn(
    '[rewrite-og-url] Không có PUBLIC_SITE_URL hay VERCEL_URL — giữ og:image dạng tương đối (preview link có thể trắng).'
  );
  process.exit(0);
}

let html = fs.readFileSync(indexPath, 'utf8');

html = html.replace(
  /<meta (property="og:image"|name="twitter:image") content="(\/[^"]+)"(\s*\/?>)/g,
  (_, attr, relPath, end) => `<meta ${attr} content="${site}${relPath}"${end}`
);

const ogUrl = `<meta property="og:url" content="${site}/" />`;
if (!html.includes('property="og:url"')) {
  html = html.replace(/<meta property="og:type"/, `${ogUrl}\n    <meta property="og:type"`);
}

fs.writeFileSync(indexPath, html);
console.log('[rewrite-og-url] Đã gắn domain cho og:image / twitter:image:', site);

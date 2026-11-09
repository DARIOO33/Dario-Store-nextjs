import { CONTACT } from "./store";

// While the shop moves to its new server, every page answers with this small static page.
// It is plain HTML built here (no React, no database) so it keeps working even when the
// database connection is the thing that fails. Set to false to open the shop again.
export const MAINTENANCE = true;

const TEXT = {
  en: {
    title: "We'll be right back",
    body: "Dario Store is moving to a faster home. The shop will be back very soon.",
    contact: "Need help with an order? Message us:",
  },
  fr: {
    title: "On revient très vite",
    body: "Dario Store déménage vers un serveur plus rapide. La boutique sera de retour très bientôt.",
    contact: "Besoin d'aide pour une commande ? Écrivez-nous :",
  },
};

export function maintenancePage(lang: string | undefined): Response {
  const locale = lang === "fr" ? "fr" : "en";
  const t = TEXT[locale];
  const html = `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Dario Store</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@500&family=Instrument+Sans&display=swap" rel="stylesheet">
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f3ede0; color: #17130f;
         font-family: "Instrument Sans", system-ui, sans-serif; padding: 16px; box-sizing: border-box; }
  main { max-width: 560px; border: 3px solid #17130f; padding: 32px 24px; background: #f3ede0; text-align: center; }
  img { width: 200px; max-width: 70%; height: auto; }
  h1 { font-family: "Anton", Impact, sans-serif; font-weight: 400; text-transform: uppercase; font-size: clamp(40px, 10vw, 64px);
       line-height: 1; margin: 24px 0 16px; }
  p { font-size: 17px; line-height: 1.5; margin: 0 0 16px; }
  .label { font-family: "JetBrains Mono", monospace; font-size: 13px; text-transform: uppercase; letter-spacing: .04em; margin-top: 24px; }
  a { color: #17130f; font-weight: 600; }
</style>
</head>
<body>
<main>
  <img src="/brand/logo-horizontal-on-cream.svg" alt="Dario Store">
  <h1>${t.title}</h1>
  <p>${t.body}</p>
  <p class="label">${t.contact}</p>
  <p>
    <a href="https://wa.me/${CONTACT.whatsapp}">WhatsApp</a> ·
    <a href="https://instagram.com/${CONTACT.instagram}">Instagram</a> ·
    <a href="https://facebook.com/${CONTACT.facebook}">Facebook</a>
  </p>
</main>
</body>
</html>`;

  return new Response(html, {
    status: 503,
    headers: { "content-type": "text/html; charset=utf-8", "retry-after": "3600", "cache-control": "no-store" },
  });
}

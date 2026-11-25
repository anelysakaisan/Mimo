import { env } from "cloudflare:workers";

export type SiteContent = Record<string, { desktop: string; mobile: string }>;

const defaults: SiteContent = {
  announcement: { desktop: "Frete grátis acima de R$ 199 para todo o Brasil", mobile: "Frete grátis acima de R$ 199" },
  heroEyebrow: { desktop: "PAPELARIA PARA DEIXAR O DIA MAIS BONITO", mobile: "PAPELARIA FOFA E CRIATIVA" },
  heroTitle: { desktop: "Pequenos mimos,", mobile: "Mimos que inspiram." },
  heroHighlight: { desktop: "grandes inspirações.", mobile: "Feitos para você." },
  heroSubtitle: { desktop: "Kits e scoops de papelaria montados com carinho para estudar, organizar e presentear.", mobile: "Kits e scoops montados com carinho, prontos para surpreender." },
  heroButton: { desktop: "Conhecer os mimos", mobile: "Ver produtos" },
  productsTitle: { desktop: "Escolha o seu mimo", mobile: "Escolha seu mimo" },
  productsSubtitle: { desktop: "Combinações lindas e úteis, prontas para chegar até você.", mobile: "Kits lindos, úteis e cheios de carinho." },
  instagramTitle: { desktop: "Acompanhe a Mimo Cherry", mobile: "Vem para o Instagram" },
  instagramText: { desktop: "Novidades, bastidores dos scoops e mimos recém-chegados no @mimocherryoficial.", mobile: "Novidades e bastidores no @mimocherryoficial." },
};

function database() { if (!env.DB) throw new Error("Banco de dados indisponível"); return env.DB; }

export async function ensureContent() {
  const db = database();
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS site_content (content_key TEXT PRIMARY KEY, desktop_value TEXT NOT NULL, mobile_value TEXT NOT NULL, updated_at TEXT NOT NULL)"),
  ]);
  const existing = await db.prepare("SELECT content_key FROM site_content").all<{ content_key: string }>();
  const known = new Set(existing.results.map((row) => row.content_key));
  const missing = Object.entries(defaults).filter(([key]) => !known.has(key));
  if (missing.length) await db.batch(missing.map(([key, value]) => db.prepare("INSERT INTO site_content (content_key, desktop_value, mobile_value, updated_at) VALUES (?, ?, ?, ?)").bind(key, value.desktop, value.mobile, new Date().toISOString())));
}

export async function getSiteContent(): Promise<SiteContent> {
  await ensureContent();
  const result = await database().prepare("SELECT content_key, desktop_value, mobile_value FROM site_content ORDER BY content_key").all<Record<string, unknown>>();
  return Object.fromEntries(result.results.map((row) => [String(row.content_key), { desktop: String(row.desktop_value), mobile: String(row.mobile_value) }]));
}

export async function updateSiteContent(key: string, desktop: string, mobile: string) {
  await ensureContent();
  await database().prepare("INSERT INTO site_content (content_key, desktop_value, mobile_value, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(content_key) DO UPDATE SET desktop_value = excluded.desktop_value, mobile_value = excluded.mobile_value, updated_at = excluded.updated_at")
    .bind(key, desktop, mobile, new Date().toISOString()).run();
}

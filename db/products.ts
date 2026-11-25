import { env } from "cloudflare:workers";

export type Product = {
  id: number; name: string; category: string; description: string;
  price: number; stock: number; color: string; icon: string;
  active: boolean; sortOrder: number; slug: string; compareAtPrice: number | null;
  details: string; itemCount: string; experienceOptions: string;
  variants: ProductVariant[];
  images: string[]; videoUrl: string;
};

export type ProductVariant = { name:string; price:number; compareAtPrice:number|null; description:string };

const scoopVariants: Record<string, ProductVariant[]> = {
  "1-scoop-papelaria-fofa": [["Surpresa total",119.9],["Stories",129.9],["Vídeo da montagem",139.9]],
  "2-scoops-papelaria-fofa": [["Surpresa total",199.9],["Stories",209.9],["Vídeo da montagem",219.9]],
  "3-scoops-papelaria-fofa": [["Surpresa total",285],["Stories",289.9],["Vídeo da montagem",299.9]],
  "4-scoops-papelaria-fofa": [["Surpresa total",375],["Stories",389.9],["Vídeo da montagem",399.9]],
  "5-scoops-papelaria-fofa": [["Surpresa total",494.9],["Stories",519.8],["Vídeo da montagem",539.8]],
  "6-scoops-papelaria-fofa": [["Surpresa total",574.9],["Stories",599.8],["Vídeo da montagem",619.8]],
  "7-scoops-papelaria-fofa": [["Surpresa total",660],["Stories",679.8],["Vídeo da montagem",699.8]],
  "8-scoops-papelaria-fofa": [["Surpresa total",750],["Stories",779.8],["Vídeo da montagem",799.8]],
};
const variantDescription = (name:string) => name === "Surpresa total" ? "Descubra todos os itens somente ao abrir a caixa." : name === "Stories" ? "A montagem e a foto final podem aparecer nos Stories da Mimo Cherry." : "A montagem é registrada em vídeo e publicada conforme a fila de pedidos.";
const initialVariants = (slug:string) => (scoopVariants[slug] || []).map(([name,price]) => ({ name:String(name), price:Number(price), compareAtPrice:null, description:variantDescription(String(name)) }));

const seeds = [
  ["1 Scoop de Papelaria Fofa", "Scoops", "10 a 12 itens de papelaria selecionados de forma surpresa", 129.9, 12, "pink", "🍒", 1, "1-scoop-papelaria-fofa", 139.9, "Uma experiência surpresa com itens variados como canetas, marca-textos, adesivos, bloquinhos, chaveiros, clipes e outros mimos. Você pode informar cores preferidas e excluir até três tipos de item.", "10 a 12 itens", "Surpresa total|Foto antes do envio|Vídeo da montagem"],
  ["2 Scoops de Papelaria Fofa", "Scoops", "20 a 22 itens variados para uma caixa ainda mais completa", 209.9, 10, "pink", "🍓", 2, "2-scoops-papelaria-fofa", 219.9, "Dois scoops combinados com curadoria para reduzir repetições e manter variedade. Ideal para quem ama a experiência surpresa ou quer dividir os itens.", "20 a 22 itens", "Surpresa total|Foto antes do envio|Vídeo da montagem"],
  ["3 Scoops de Papelaria Fofa", "Scoops", "30 a 32 itens de escrita, organização e acessórios", 289.9, 8, "pink", "💗", 3, "3-scoops-papelaria-fofa", 299.9, "Uma caixa generosa com três scoops e grande variedade de itens. Preferências simples são consideradas conforme a disponibilidade do estoque.", "30 a 32 itens", "Surpresa total|Foto antes do envio|Vídeo da montagem"],
  ["4 Scoops de Papelaria Fofa", "Scoops", "40 a 42 itens para uma experiência completa", 389.9, 6, "pink", "🎁", 4, "4-scoops-papelaria-fofa", 399.9, "Quatro scoops preparados manualmente com atenção à variedade. Uma ótima opção para presentear, compartilhar ou renovar toda a coleção.", "40 a 42 itens", "Surpresa total|Foto antes do envio|Vídeo da montagem"],
  ["5 Scoops de Papelaria Fofa", "Scoops", "50 a 52 itens selecionados em uma caixa especial", 494.9, 5, "pink", "✨", 5, "5-scoops-papelaria-fofa", 539.8, "Cinco scoops com variedade ampliada de papelaria criativa. A montagem depende do estoque e pode incluir itens especiais de maior valor.", "50 a 52 itens", "Surpresa total|Foto antes do envio|Vídeo da montagem"],
  ["6 Scoops de Papelaria Fofa", "Scoops", "60 a 62 itens para colecionar e compartilhar", 579.9, 4, "pink", "🌸", 6, "6-scoops-papelaria-fofa", 599.9, "Seis scoops montados com curadoria e redução de repetições. Opção indicada para colecionadoras e presentes em grupo.", "60 a 62 itens", "Surpresa total|Foto antes do envio|Vídeo da montagem"],
  ["7 Scoops de Papelaria Fofa", "Scoops", "70 a 72 itens em uma seleção surpreendente", 669.9, 3, "pink", "🎀", 7, "7-scoops-papelaria-fofa", 699.9, "Sete scoops em uma caixa de grande variedade, com itens de escrita, organização, decoração e acessórios.", "70 a 72 itens", "Surpresa total|Foto antes do envio|Vídeo da montagem"],
  ["8 Scoops de Papelaria Fofa", "Scoops", "80 a 82 itens na maior experiência Mimo Cherry", 759.9, 3, "pink", "💝", 8, "8-scoops-papelaria-fofa", 799.9, "A maior experiência de scoops da loja, preparada com variedade máxima e itens especiais conforme o estoque disponível.", "80 a 82 itens", "Surpresa total|Foto antes do envio|Vídeo da montagem"],
  ["Kit Caderno de Disco + Escrita", "Kits", "Caderno de disco, 11 itens de escrita e case", 89.9, 8, "green", "📒", 9, "kit-caderno-disco-escrita", 109.9, "Kit completo para estudar e organizar: um caderno de disco, onze itens de escrita selecionados e uma case para guardar seus materiais.", "13 itens", ""],
  ["Kit de Escrita por Cores", "Kits", "15 itens coordenados por uma paleta de cor", 45.9, 12, "blue", "🖊️", 10, "kit-escrita-por-cores", 49.9, "Quinze itens de escrita escolhidos dentro de uma paleta harmoniosa. As estampas podem variar conforme o estoque.", "15 itens", ""],
  ["Kit Mimo Gatinho", "Kits", "Três itens fofos com tema de gatinho", 24.9, 10, "blue", "🐱", 11, "kit-mimo-gatinho", 29.9, "Um pequeno presente com três itens de papelaria inspirados em gatinhos. Modelos e cores variam conforme disponibilidade.", "3 itens", ""],
  ["Kit Mimo Cachorrinho", "Kits", "Três itens fofos com tema de cachorrinho", 24.9, 10, "green", "🐶", 12, "kit-mimo-cachorrinho", 29.9, "Um kit compacto e carinhoso com três itens de papelaria em tema de cachorrinho.", "3 itens", ""],
  ["Kit Personagem 17 Itens", "Kits", "Seleção temática com 17 itens de papelaria", 119.9, 5, "pink", "🎀", 13, "kit-personagem-17-itens", null, "Kit temático com caderno, itens de escrita e acessórios coordenados. O personagem disponível será informado na variação do produto.", "17 itens", ""],
  ["Estojo Casinha", "Itens", "Estojo estruturado em formato de casinha", 59.9, 6, "blue", "🏠", 14, "estojo-casinha", 89.9, "Estojo espaçoso e decorativo para organizar canetas, lápis e pequenos acessórios. Cores e estampas podem variar.", "1 unidade", ""],
  ["Caneta Gel 0.6 mm", "Itens", "Escrita macia e traço fino para o dia a dia", 13.9, 18, "green", "🖊️", 15, "caneta-gel-06", null, "Caneta em gel com ponta 0,6 mm, indicada para anotações, estudos e planejamento.", "1 unidade", ""],
  ["Caneta Metálica Luxo", "Itens", "Caneta esferográfica com acabamento especial", 29.9, 9, "pink", "✨", 16, "caneta-metalica-luxo", null, "Caneta esferográfica decorativa com acabamento metálico e detalhe superior. Modelo enviado conforme opção selecionada.", "1 unidade", ""],
  ["Caneta Estampada", "Itens", "Caneta fofa com estampa delicada", 15.9, 15, "blue", "🌷", 17, "caneta-estampada", null, "Caneta esferográfica estampada, leve e confortável para uso diário. Estampas variam conforme estoque.", "1 unidade", ""],
  ["Marca-Texto Balinha", "Itens", "Marca-texto compacto em formato divertido", 19.9, 12, "pink", "🍬", 18, "marca-texto-balinha", null, "Marca-texto decorativo e compacto, ideal para estudos e planners. Cor selecionável conforme disponibilidade.", "1 unidade", ""],
  ["Régua Acrílica 20 cm", "Itens", "Régua resistente com acabamento colorido", 25.9, 8, "blue", "📏", 19, "regua-acrilica-20cm", null, "Régua acrílica de 20 cm com visual colorido para escola, estudos e planejamento.", "1 unidade", ""],
  ["Caderninho Recorte Pautado", "Itens", "Caderno pequeno pautado com capa decorada", 24.9, 10, "green", "📔", 20, "caderninho-recorte-pautado", null, "Caderninho pautado compacto para listas, lembretes e anotações rápidas.", "1 unidade", ""],
] as const;

function database() {
  if (!env.DB) throw new Error("Banco de dados indisponível");
  return env.DB;
}

export async function ensureProducts() {
  const db = database();
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL,
      price REAL NOT NULL CHECK(price >= 0), stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
      color TEXT NOT NULL DEFAULT 'pink', icon TEXT NOT NULL DEFAULT '🍒',
      active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0, 1)),
      sort_order INTEGER NOT NULL DEFAULT 0, slug TEXT NOT NULL DEFAULT '', compare_at_price REAL,
      details TEXT NOT NULL DEFAULT '', item_count TEXT NOT NULL DEFAULT '', experience_options TEXT NOT NULL DEFAULT '', variants TEXT NOT NULL DEFAULT '[]', images TEXT NOT NULL DEFAULT '[]', video_url TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_products_active_sort ON products(active, sort_order)"),
  ]);
  const columns = await db.prepare("PRAGMA table_info(products)").all<{ name:string }>();
  const names = new Set(columns.results.map((column) => column.name));
  const additions = [
    ["slug", "ALTER TABLE products ADD COLUMN slug TEXT NOT NULL DEFAULT ''"],
    ["compare_at_price", "ALTER TABLE products ADD COLUMN compare_at_price REAL"],
    ["details", "ALTER TABLE products ADD COLUMN details TEXT NOT NULL DEFAULT ''"],
    ["item_count", "ALTER TABLE products ADD COLUMN item_count TEXT NOT NULL DEFAULT ''"],
    ["experience_options", "ALTER TABLE products ADD COLUMN experience_options TEXT NOT NULL DEFAULT ''"],
    ["variants", "ALTER TABLE products ADD COLUMN variants TEXT NOT NULL DEFAULT '[]'"],
    ["images", "ALTER TABLE products ADD COLUMN images TEXT NOT NULL DEFAULT '[]'"],
    ["video_url", "ALTER TABLE products ADD COLUMN video_url TEXT NOT NULL DEFAULT ''"],
  ] as const;
  for (const [name, sql] of additions) if (!names.has(name)) await db.prepare(sql).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)").run();
  const count = await db.prepare("SELECT COUNT(*) AS total FROM products").first<{ total: number }>();
  const legacy = await db.prepare("SELECT COUNT(*) AS total FROM products WHERE slug = ''").first<{ total:number }>();
  if (!count?.total || (count.total <= 3 && legacy?.total === count.total)) {
    if (count?.total) await db.prepare("DELETE FROM products").run();
    await db.batch(seeds.map((item) => db.prepare(
      "INSERT INTO products (name, category, description, price, stock, color, icon, active, sort_order, slug, compare_at_price, details, item_count, experience_options, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(...item, new Date().toISOString())));
  }
  for (const [slug, variants] of Object.entries(scoopVariants)) {
    await db.prepare("UPDATE products SET variants = ? WHERE slug = ? AND (variants = '' OR variants = '[]')").bind(JSON.stringify(initialVariants(slug)), slug).run();
  }
}

export async function listProducts(includeInactive = false): Promise<Product[]> {
  await ensureProducts();
  const query = includeInactive
    ? "SELECT * FROM products ORDER BY sort_order, id"
    : "SELECT * FROM products WHERE active = 1 AND stock > 0 ORDER BY sort_order, id";
  const result = await database().prepare(query).all<Record<string, unknown>>();
  return result.results.map((row: Record<string, unknown>) => ({
    id: Number(row.id), name: String(row.name), category: String(row.category),
    description: String(row.description), price: Number(row.price), stock: Number(row.stock),
    color: String(row.color), icon: String(row.icon), active: Boolean(row.active),
    sortOrder: Number(row.sort_order), slug: String(row.slug || `produto-${row.id}`),
    compareAtPrice: row.compare_at_price == null ? null : Number(row.compare_at_price), details: String(row.details || ""),
    itemCount: String(row.item_count || ""), experienceOptions: String(row.experience_options || ""),
    variants: (() => { try { return JSON.parse(String(row.variants || "[]")) as ProductVariant[]; } catch { return []; } })(),
    images: (() => { try { return JSON.parse(String(row.images || "[]")) as string[]; } catch { return []; } })(),
    videoUrl: String(row.video_url || ""),
  }));
}

export async function getProductBySlug(slug: string) {
  await ensureProducts();
  const row = await database().prepare("SELECT * FROM products WHERE slug = ? AND active = 1 LIMIT 1").bind(slug).first<Record<string, unknown>>();
  if (!row) return null;
  return (await listProducts(true)).find((product) => product.id === Number(row.id)) ?? null;
}

export async function updateProduct(id: number, product: Omit<Product, "id">) {
  await ensureProducts();
  await database().prepare(`UPDATE products SET name = ?, category = ?, description = ?,
    price = ?, stock = ?, color = ?, icon = ?, active = ?, sort_order = ?, slug = ?, compare_at_price = ?, details = ?, item_count = ?, experience_options = ?, variants = ?, images = ?, video_url = ?, updated_at = ? WHERE id = ?`)
    .bind(product.name, product.category, product.description, product.price, product.stock,
      product.color, product.icon, product.active ? 1 : 0, product.sortOrder, product.slug, product.compareAtPrice,
      product.details, product.itemCount, product.experienceOptions, JSON.stringify(product.variants || []), JSON.stringify(product.images || []), product.videoUrl || "", new Date().toISOString(), id).run();
}

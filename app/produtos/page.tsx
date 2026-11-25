import { listProducts } from "../../db/products";

const money = (value:number) => value.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const products = await listProducts();
  return <main className="simple-page"><header className="detail-header"><a href="/" className="brand-image"><img src="/mimo-cherry-logo-horizontal.png" alt="Mimo Cherry"/></a><nav><a href="/produtos">Produtos</a><a href="/#como-funciona">Como funciona</a><a href="/contato">Contato</a></nav><a href="/">← Início</a></header><section className="catalog-heading"><p className="eyebrow">TODOS OS MIMOS</p><h1>Escolha algo que faça seu coração dizer “quero!”</h1><p>Scoops, kits e itens individuais para estudar, organizar, colecionar e presentear.</p></section><div className="catalog-chips"><a href="#scoops">🍒 Scoops</a><a href="#kits">🎀 Kits</a><a href="#itens">✏️ Itens avulsos</a></div>{["Scoops","Kits","Itens"].map((category) => <section className="catalog-section" id={category.toLowerCase()} key={category}><div><p className="eyebrow">{category}</p><h2>{category === "Scoops" ? "Caixinhas surpresa" : category === "Kits" ? "Combinações prontas" : "Escolha seus favoritos"}</h2></div><div className="catalog-grid">{products.filter((product) => product.category === category).map((product) => <a href={`/produtos/${product.slug}`} className="catalog-card" key={product.id}><div className={`catalog-art ${product.color}`}><span>{product.icon}</span>{product.compareAtPrice && <b>OFERTA</b>}</div><small>{product.category}</small><h3>{product.name}</h3><p>{product.description}</p><div>{product.compareAtPrice && <del>{money(product.compareAtPrice)}</del>}<strong>{money(product.price)}</strong></div></a>)}</div></section>)}</main>;
}

"use client";

import { useEffect, useMemo, useState } from "react";

const fallbackKits = [
  { id: 1, name: "Scoop Cerejinha", category: "Scoops", price: 69.9, color: "pink", icon: "🍒", items: "Uma seleção surpresa de papelaria fofa" },
  { id: 2, name: "Kit Estudos Fofos", category: "Kits", price: 89.9, color: "green", icon: "✏️", items: "Canetas, régua, marca-textos e adesivos" },
  { id: 3, name: "Kit Mimo Completo", category: "Presentes", price: 119.9, color: "blue", icon: "🎀", items: "Caderno, estojo e acessórios surpresa" },
];

export default function Home() {
  const [cart, setCart] = useState<number[]>([]);
  const [filter, setFilter] = useState("Todos");
  const [kits, setKits] = useState(fallbackKits);
  useEffect(() => {
    fetch("/api/products").then((response) => response.ok ? response.json() : Promise.reject())
      .then((products) => setKits(products.map((product: { id:number; name:string; category:string; price:number; color:string; icon:string; description:string }) => ({ ...product, items: product.description }))))
      .catch(() => undefined);
  }, []);
  const visible = useMemo(() => filter === "Todos" ? kits : kits.filter((kit) => kit.category === filter), [filter]);

  return <main>
    <div className="announcement">Frete grátis acima de R$ 199 para todo o Brasil</div>
    <header className="header">
      <a className="brand" href="#inicio" aria-label="Mimo Cherry - início"><span>mimo</span> cherry <b>●</b></a>
      <nav aria-label="Navegação principal"><a href="#kits">Kits</a><a href="#como-funciona">Como funciona</a><a href="#sobre">Nossa história</a></nav>
      <button className="cart" aria-label={`Sacola com ${cart.length} itens`}>Sacola <span>{cart.length}</span></button>
    </header>

    <section className="hero" id="inicio">
      <div className="hero-copy">
        <p className="eyebrow">PAPELARIA PARA DEIXAR O DIA MAIS BONITO</p>
        <h1>Pequenos mimos,<br/><em>grandes inspirações.</em></h1>
        <p className="subtitle">Kits e scoops de papelaria montados com carinho para estudar, organizar e presentear.</p>
        <a className="primary" href="#kits">Conhecer os mimos <span>→</span></a>
        <div className="trust"><span>✓ Pagamento protegido</span><span>✓ Envio com rastreio</span></div>
      </div>
      <div className="hero-art" aria-label="Composição ilustrada de itens de papelaria">
        <div className="blob"></div><div className="notebook">Minhas<br/><strong>ideias</strong><i>♥</i></div>
        <div className="pencil one"></div><div className="pencil two"></div><div className="tape">CHERRY<br/>DAYS</div>
        <span className="spark s1">✦</span><span className="spark s2">✿</span><span className="spark s3">●</span>
      </div>
    </section>

    <section className="products" id="kits">
      <div className="section-heading"><div><p className="eyebrow">FEITOS PARA VOCÊ</p><h2>Escolha o seu mimo</h2></div><p>Combinações lindas e úteis, prontas para chegar até você.</p></div>
      <div className="filters" aria-label="Filtrar produtos">
        {["Todos", "Scoops", "Kits", "Presentes"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}
      </div>
      <div className="grid">
        {visible.map((kit) => <article className="card" key={kit.id}>
          <div className={`product-image ${kit.color}`}><span>{kit.icon}</span><div className="mini-book">Mimo<br/>Cherry</div></div>
          <div className="card-body"><small>{kit.category}</small><h3>{kit.name}</h3><p>{kit.items}</p><div className="buy"><strong>{kit.price.toLocaleString("pt-BR", {style:"currency", currency:"BRL"})}</strong><button onClick={() => setCart([...cart, kit.id])} aria-label={`Adicionar ${kit.name} à sacola`}>Adicionar +</button></div></div>
        </article>)}
      </div>
    </section>

    <section className="features" id="como-funciona">
      <div><span>♡</span><h3>Curadoria com carinho</h3><p>Canetas fofas, washi tapes, chaveiros e outros achadinhos escolhidos um a um.</p></div>
      <div><span>♢</span><h3>Embalado para encantar</h3><p>Seu pedido chega caprichado, pronto para ser um presente especial.</p></div>
      <div><span>⌁</span><h3>Compra tranquila</h3><p>Pagamento processado com segurança e pedido sempre rastreado.</p></div>
    </section>
  </main>;
}

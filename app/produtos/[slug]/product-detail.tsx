"use client";

import { useState } from "react";
import type { Product } from "../../../db/products";

const money = (value:number) => value.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });

export default function ProductDetail({ product, recommendations }: { product:Product; recommendations:Product[] }) {
  const variants = product.variants?.length ? product.variants : product.experienceOptions.split("|").filter(Boolean).map((name) => ({ name, price:product.price, compareAtPrice:product.compareAtPrice, description:"" }));
  const [experience, setExperience] = useState(variants[0]?.name || "");
  const selectedVariant = variants.find((variant) => variant.name === experience);
  const currentPrice = selectedVariant?.price ?? product.price;
  const currentCompareAt = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const [preference, setPreference] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const add = () => {
    try { const cart = JSON.parse(localStorage.getItem("mimo-cart") || "{}"); const choices = JSON.parse(localStorage.getItem("mimo-cart-variants") || "{}"); const preferences = JSON.parse(localStorage.getItem("mimo-cart-preferences") || "{}"); cart[product.id] = Math.min(product.stock, (cart[product.id] || 0) + quantity); if (experience) choices[product.id] = experience; if (preference.trim()) preferences[product.id] = preference.trim(); localStorage.setItem("mimo-cart", JSON.stringify(cart)); localStorage.setItem("mimo-cart-variants", JSON.stringify(choices)); localStorage.setItem("mimo-cart-preferences", JSON.stringify(preferences)); } catch { /* carrinho opcional */ }
    setAdded(true);
  };
  return <main className="detail-page">
    <div className="announcement">🍒 Um pedido, muitos momentos de alegria</div>
    <header className="detail-header"><a href="/" className="brand-image"><img src="/mimo-cherry-logo-horizontal.png" alt="Mimo Cherry"/></a><nav><a href="/#kits">Produtos</a><a href="/#como-funciona">Como funciona</a><a href="https://www.instagram.com/mimocherryoficial/" target="_blank" rel="noreferrer">Instagram</a></nav><a href="/">← Voltar à loja</a></header>
    <div className="breadcrumbs"><a href="/">Início</a><span>›</span><a href="/#kits">{product.category}</a><span>›</span><strong>{product.name}</strong></div>
    <section className="detail-hero">
      <div className={`detail-gallery ${product.color}`}>{product.images.length ? <div className="real-gallery"><img src={product.images[0]} alt={product.name}/>{product.images.length > 1 && <div>{product.images.slice(1).map((url,index) => <img src={url} alt={`${product.name} — foto ${index+2}`} key={url}/>)}</div>}{product.videoUrl && <video controls preload="metadata" src={product.videoUrl}>Seu navegador não reproduz este vídeo.</video>}</div> : <><span className="floating-spark spark-a">✦</span><span className="floating-spark spark-b">♥</span><div className="detail-icon">{product.icon}</div><div className="detail-package">Mimo<br/><strong>Cherry</strong><small>{product.itemCount}</small></div><div className="surprise-sticker">feito com<br/>carinho!</div></>}</div>
      <div className="detail-copy"><p className="eyebrow">{product.category} • MIMO CHERRY</p><h1>{product.name}</h1><p className="detail-lead">{product.description}</p><div className="detail-price">{currentCompareAt && currentCompareAt > currentPrice && <del>{money(currentCompareAt)}</del>}<strong>{money(currentPrice)}</strong><small>ou em até 3x sem juros</small></div><div className="detail-tags"><span>📦 {product.itemCount}</span><span>🎀 Montado à mão</span><span>🚚 Envio rastreado</span></div>
        {variants.length > 0 && <fieldset className="choice-field"><legend>Escolha sua experiência</legend>{variants.map((variant) => <label key={variant.name} className={experience === variant.name ? "chosen" : ""}><input type="radio" name="experience" checked={experience === variant.name} onChange={() => setExperience(variant.name)}/><span><b>{variant.name} — {money(variant.price)}</b><small>{variant.description || "Escolha a modalidade que combina com você."}</small></span></label>)}</fieldset>}
        {product.category === "Scoops" && <label className="preference-field"><span>Conte suas preferências <small>(opcional)</small></span><textarea maxLength={500} value={preference} onChange={(event) => setPreference(event.target.value)} placeholder="Ex.: prefiro rosa e lilás, gosto de gatinhos e não quero régua, apontador nem chaveiro" rows={4}/><small>Informe cores e temas favoritos e até 3 tipos de item que não deseja. Consideraremos suas preferências conforme o estoque disponível.</small></label>}
        <div className="detail-actions"><div className="detail-quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button></div><button className="detail-add" onClick={add}>{added ? "Adicionado! 🍒" : "Colocar na sacola"}</button></div><p className="safe-note">🔒 Pagamento protegido pela InfinitePay. Seus dados de cartão não passam pela Mimo Cherry.</p>
      </div>
    </section>
    <section className="detail-info"><article><span>01</span><h2>O que pode vir?</h2><p>{product.details}</p></article><article><span>02</span><h2>Prazo e montagem</h2><p>Cada pedido é montado manualmente. A preparação pode levar até 7 dias úteis, além do prazo de transporte informado no checkout.</p></article><article><span>03</span><h2>Surpresa com cuidado</h2><p>As preferências são consideradas quando possível. Modelos, cores e estampas variam de acordo com o estoque disponível no dia da montagem.</p></article></section>
    <section className="detail-possibilities"><div><p className="eyebrow">PODE TER NA SUA CAIXINHA</p><h2>Um universo de papelaria fofa</h2></div><div>{["Canetas fofas","Marca-textos","Bloquinhos","Adesivos","Washi tapes","Chaveiros","Clipes decorados","Cadernos","Estojos","Réguas","Lápis infinito","Itens surpresa"].map((item, index) => <span key={item}><b>{["🖊️","🌈","📝","🌸","🎨","🧸","📎","📔","👝","📏","✏️","✨"][index]}</b>{item}</span>)}</div></section>
    {recommendations.length > 0 && <section className="recommendations"><p className="eyebrow">VOCÊ TAMBÉM PODE AMAR</p><h2>Mais mimos para descobrir</h2><div>{recommendations.map((item) => <a href={`/produtos/${item.slug}`} key={item.id}><div className={`recommend-art ${item.color}`}>{item.icon}</div><small>{item.category}</small><h3>{item.name}</h3><strong>{money(item.price)}</strong></a>)}</div></section>}
    <footer className="detail-footer"><img src="/mimo-cherry-logo-horizontal.png" alt="Mimo Cherry"/><p>Pequenos mimos, grandes inspirações.</p><a href="https://www.instagram.com/mimocherryoficial/" target="_blank" rel="noreferrer">@mimocherryoficial</a></footer>
  </main>;
}

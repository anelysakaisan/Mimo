"use client";

import { useEffect, useMemo, useState } from "react";
import NewsletterForm from "./newsletter-form";

type StoreVariant = { name:string; price:number; description:string };
type StoreProduct = { id:number; name:string; category:string; price:number; color:string; icon:string; items:string; stock:number; slug?:string; variants?:StoreVariant[]; images?:string[] };
type ContentPair = { desktop:string; mobile:string };
type SiteContent = Record<string, ContentPair>;
const fallbackKits: StoreProduct[] = [
  { id:1, name:"Scoop Cerejinha", category:"Scoops", price:69.9, color:"pink", icon:"🍒", items:"Uma seleção surpresa de papelaria fofa", stock:12, slug:"1-scoop-papelaria-fofa" },
  { id:2, name:"Kit Estudos Fofos", category:"Kits", price:89.9, color:"green", icon:"✏️", items:"Canetas, régua, marca-textos e adesivos", stock:8, slug:"kit-caderno-disco-escrita" },
  { id:3, name:"Kit Mimo Completo", category:"Presentes", price:119.9, color:"blue", icon:"🎀", items:"Caderno, estojo e acessórios surpresa", stock:5, slug:"kit-personagem-17-itens" },
  { id:4, name:"Scoop Duplo Cerejinha", category:"Scoops", price:129.9, color:"pink", icon:"🍓", items:"Dois scoops com 20 a 24 itens variados", stock:7 },
  { id:5, name:"Kit Canetas Fofas", category:"Kits", price:39.9, color:"blue", icon:"🖊️", items:"Uma seleção colorida para deixar o estojo mais divertido", stock:14 },
  { id:6, name:"Caixa Presente Cherry", category:"Presentes", price:149.9, color:"green", icon:"💝", items:"Mimos especiais em uma embalagem pronta para presentear", stock:4 },
];
const money = (value:number) => value.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });

export default function Home() {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartVariants, setCartVariants] = useState<Record<number,string>>({});
  const [cartPreferences, setCartPreferences] = useState<Record<number,string>>({});
  const [filter, setFilter] = useState("Todos");
  const [kits, setKits] = useState(fallbackKits);
  const [cartOpen, setCartOpen] = useState(false);
  const [cep, setCep] = useState("");
  const [shippingChecked, setShippingChecked] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [experience, setExperience] = useState("Surpresa total");
  const [cookieVisible, setCookieVisible] = useState(true);
  const [content, setContent] = useState<SiteContent>({});

  useEffect(() => {
    fetch("/api/products").then((response) => response.ok ? response.json() : Promise.reject())
      .then((products) => setKits(products.map((product: StoreProduct & { description:string }) => ({ ...product, items:product.description }))))
      .catch(() => undefined);
    fetch("/api/content").then((response) => response.ok ? response.json() : Promise.reject()).then(setContent).catch(() => undefined);
    try { const saved = localStorage.getItem("mimo-cart"); if (saved) setCart(JSON.parse(saved)); const choices = localStorage.getItem("mimo-cart-variants"); if (choices) setCartVariants(JSON.parse(choices)); const preferences = localStorage.getItem("mimo-cart-preferences"); if (preferences) setCartPreferences(JSON.parse(preferences)); } catch { /* carrinho local opcional */ }
  }, []);
  useEffect(() => { try { localStorage.setItem("mimo-cart", JSON.stringify(cart)); } catch { /* armazenamento indisponível */ } }, [cart]);
  useEffect(() => { try { localStorage.setItem("mimo-cart-variants", JSON.stringify(cartVariants)); } catch { /* armazenamento indisponível */ } }, [cartVariants]);

  const visible = useMemo(() => kits.filter((kit) => (filter === "Todos" || kit.category === filter) && `${kit.name} ${kit.items}`.toLowerCase().includes(search.toLowerCase())), [filter, kits, search]);
  const lines = useMemo(() => kits.filter((kit) => cart[kit.id]).map((kit) => { const variantName=cartVariants[kit.id] || kit.variants?.[0]?.name; const variant=kit.variants?.find((item) => item.name === variantName); return ({ ...kit, price:variant?.price ?? kit.price, variant:variantName, preference:cartPreferences[kit.id] || "", quantity:cart[kit.id] }); }), [cart, cartVariants, cartPreferences, kits]);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const shipping = subtotal >= 199 ? 0 : 18.9;
  const total = subtotal + shipping;

  const setQuantity = (product:StoreProduct, quantity:number) => setCart((current) => {
    const next = { ...current }; const safe = Math.max(0, Math.min(quantity, product.stock));
    if (safe === 0) delete next[product.id]; else next[product.id] = safe;
    return next;
  });
  const add = (product:StoreProduct) => { if (product.variants?.length && !cartVariants[product.id]) setCartVariants((current) => ({...current,[product.id]:product.variants![0].name})); setQuantity(product, (cart[product.id] || 0) + 1); setCartOpen(true); };
  const checkCep = () => { setCep(cep.replace(/\D/g, "").slice(0, 8)); setShippingChecked(cep.replace(/\D/g, "").length === 8); };
  const checkout = async () => {
    setCheckoutStatus("Abrindo pagamento seguro…");
    const response = await fetch("/api/checkout", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ items:lines.map((line) => ({ id:line.id, quantity:line.quantity, variant:line.variant, preference:line.preference })) }) });
    const result = await response.json() as { checkoutUrl?:string; error?:string };
    if (response.ok && result.checkoutUrl) window.location.href = result.checkoutUrl;
    else setCheckoutStatus(result.error || "Não foi possível iniciar o pagamento.");
  };
  const editable = (key:string, fallback:string) => <><span className="desktop-copy">{content[key]?.desktop || fallback}</span><span className="mobile-copy">{content[key]?.mobile || content[key]?.desktop || fallback}</span></>;

  return <main>
    <div className="announcement">{editable("announcement", "Frete grátis acima de R$ 199 para todo o Brasil")}</div>
    <header className="header">
      <a className="brand brand-image" href="#inicio" aria-label="Mimo Cherry - início"><img src="/mimo-cherry-logo-horizontal.png" alt="Mimo Cherry Papelaria Criativa"/><img className="brand-mobile" src="/mimo-cherry-logo-round.jpeg" alt=""/></a>
      <nav aria-label="Navegação principal"><a href="/produtos">Produtos</a><a href="#como-funciona">Como funciona</a><a href="/contato">Contato</a></nav>
      <label className="store-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar um mimo" aria-label="Buscar produtos"/></label>
      <button className="cart" onClick={() => setCartOpen(true)} aria-label={`Sacola com ${itemCount} itens`}>Sacola <span>{itemCount}</span></button>
    </header>

    <div className="category-bar" aria-label="Categorias da loja"><a href="#kits" onClick={() => setFilter("Scoops")}>Scoops surpresa</a><a href="#kits" onClick={() => setFilter("Kits")}>Kits de escrita</a><a href="#kits" onClick={() => setFilter("Presentes")}>Para presentear</a><span>Envio para todo o Brasil</span></div>

    <section className="hero" id="inicio">
      <div className="hero-copy"><p className="eyebrow">{editable("heroEyebrow", "PAPELARIA PARA DEIXAR O DIA MAIS BONITO")}</p><h1>{editable("heroTitle", "Pequenos mimos,")}<br/><em>{editable("heroHighlight", "grandes inspirações.")}</em></h1><p className="subtitle">{editable("heroSubtitle", "Kits e scoops de papelaria montados com carinho para estudar, organizar e presentear.")}</p><a className="primary" href="#kits">{editable("heroButton", "Conhecer os mimos")} <span>→</span></a><div className="trust"><span>✓ Pagamento protegido</span><span>✓ Envio com rastreio</span></div></div>
      <div className="hero-art" aria-label="Composição ilustrada de itens de papelaria"><div className="blob"></div><div className="notebook">Minhas<br/><strong>ideias</strong><i>♥</i></div><div className="pencil one"></div><div className="pencil two"></div><div className="tape">CHERRY<br/>DAYS</div><span className="spark s1">✦</span><span className="spark s2">✿</span><span className="spark s3">●</span></div>
    </section>

    <section className="products" id="kits">
      <div className="section-heading"><div><p className="eyebrow">FEITOS PARA VOCÊ</p><h2>{editable("productsTitle", "Escolha o seu mimo")}</h2></div><p>{editable("productsSubtitle", "Combinações lindas e úteis, prontas para chegar até você.")}</p></div>
      <div className="filters" aria-label="Filtrar produtos">{["Todos","Scoops","Kits","Presentes"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
      <div className="grid">{visible.map((kit, index) => <article className="card" key={kit.id}><a className={`product-image ${kit.color}`} href={`/produtos/${kit.slug || `produto-${kit.id}`}`} aria-label={`Ver detalhes de ${kit.name}`}>{index < 2 && <b className="product-badge">MAIS QUERIDO</b>}{kit.images?.[0] ? <img src={kit.images[0]} alt={kit.name}/> : <><span>{kit.icon}</span><div className="mini-book">Mimo<br/>Cherry</div></>}</a><div className="card-body"><small>{kit.category}</small><a className="product-title" href={`/produtos/${kit.slug || `produto-${kit.id}`}`}><h3>{kit.name}</h3></a><p>{kit.items}</p><div className="stock-note">{kit.stock <= 5 ? `Últimas ${kit.stock} unidades` : "Disponível para envio"}</div><div className="payment-hint">ou 3x sem juros</div><a className="detail-link" href={`/produtos/${kit.slug || `produto-${kit.id}`}`}>Ver tudo que vem e escolher opções →</a><div className="buy"><strong>{money(kit.price)}</strong><button onClick={() => add(kit)} disabled={(cart[kit.id] || 0) >= kit.stock} aria-label={`Adicionar ${kit.name} à sacola`}>{(cart[kit.id] || 0) >= kit.stock ? "Limite atingido" : "Adicionar +"}</button></div></div></article>)}</div>
      {visible.length === 0 && <div className="no-results"><span>♡</span><h3>Nenhum mimo encontrado</h3><p>Tente buscar outro nome ou escolha uma categoria.</p></div>}
    </section>

    <section className="features" id="como-funciona"><div><span>♡</span><h3>Curadoria com carinho</h3><p>Canetas fofas, washi tapes, chaveiros e outros achadinhos escolhidos um a um.</p></div><div><span>♢</span><h3>Embalado para encantar</h3><p>Seu pedido chega caprichado, pronto para ser um presente especial.</p></div><div><span>⌁</span><h3>Compra tranquila</h3><p>Pagamento processado com segurança e pedido sempre rastreado.</p></div></section>

    <section className="scoop-guide">
      <div><p className="eyebrow">A EXPERIÊNCIA MIMO CHERRY</p><h2>Como funciona o seu scoop?</h2><p>Você escolhe o tamanho e nós montamos uma seleção surpresa, bonita e variada. Cada pedido é preparado manualmente e pode receber preferências simples de cor.</p></div>
      <ol><li><b>1</b><span><strong>Escolha seu scoop</strong><small>De 10 a 12 itens por scoop.</small></span></li><li><b>2</b><span><strong>Conte suas preferências</strong><small>Informe cores favoritas e até 3 itens que não deseja.</small></span></li><li><b>3</b><span><strong>Acompanhe a preparação</strong><small>Surpresa total ou registro da montagem, quando disponível.</small></span></li><li><b>4</b><span><strong>Receba seu mimo</strong><small>Embalagem caprichada e envio rastreado.</small></span></li></ol>
    </section>

    <section className="reviews"><p className="eyebrow">QUEM RECEBE, SE ENCANTA</p><h2>Carinho em cada caixinha</h2><div><blockquote>“Veio tudo muito bem embalado e com uma variedade linda. A sensação de abrir foi a melhor parte!”<cite>— Cliente Mimo Cherry</cite></blockquote><blockquote>“Um presente diferente, útil e muito fofo. O atendimento deixou tudo ainda mais especial.”<cite>— Cliente Mimo Cherry</cite></blockquote><blockquote>“As canetas e os adesivos foram meus favoritos. Já quero escolher o próximo scoop.”<cite>— Cliente Mimo Cherry</cite></blockquote></div><small>Depoimentos ilustrativos — serão substituídos por avaliações reais após as primeiras vendas.</small></section>

    <section className="instagram-band"><img src="/mimo-cherry-logo-round.jpeg" alt="Logo Mimo Cherry"/><div><p className="eyebrow">@MIMOCHERRYOFICIAL</p><h2>{editable("instagramTitle", "Acompanhe a Mimo Cherry")}</h2><p>{editable("instagramText", "Novidades, bastidores dos scoops e mimos recém-chegados no @mimocherryoficial.")}</p></div><a href="https://www.instagram.com/mimocherryoficial/" target="_blank" rel="noreferrer">Seguir no Instagram ↗</a></section>

    <section className="faq"><div><p className="eyebrow">DÚVIDAS FREQUENTES</p><h2>Antes de escolher seu mimo</h2></div><div><details><summary>Quais itens podem vir no scoop?</summary><p>Canetas, marca-textos, lápis, borrachas, adesivos, bloquinhos, réguas, washi tapes, chaveiros, clipes e outros itens de papelaria, conforme o estoque.</p></details><details><summary>Posso escolher todos os produtos?</summary><p>O encanto está na surpresa. Você poderá informar preferências simples e excluir até três tipos de item, mas a composição final depende da curadoria e do estoque.</p></details><details><summary>Qual é o prazo de preparação?</summary><p>A estimativa inicial é de até 7 dias úteis para preparação, além do prazo da transportadora. O prazo definitivo será exibido antes da publicação da loja.</p></details><details><summary>O pagamento é seguro?</summary><p>Sim. O pagamento será processado no ambiente protegido da InfinitePay; a Mimo Cherry não recebe nem armazena dados do cartão.</p></details></div></section>

    <footer className="footer" id="sobre"><div><a className="brand" href="#inicio"><span>mimo</span> cherry <b>●</b></a><p>Papelaria fofa para transformar estudo, organização e presentes em pequenos momentos de alegria.</p><a className="instagram-link" href="https://www.instagram.com/mimocherryoficial/" target="_blank" rel="noreferrer">◎ @mimocherryoficial</a></div><div><strong>Loja</strong><a href="/produtos">Scoops, kits e itens</a><a href="#como-funciona">Como funciona</a><a href="/politicas">Trocas e devoluções</a></div><div><strong>Atendimento</strong><a href="/contato">Fale com a gente</a><span>Segunda a sexta, horário comercial</span><span>Envio para todo o Brasil</span></div><div><strong>Receba novidades</strong><p>Novos kits, reposições e ofertas especiais.</p><NewsletterForm/></div><small>© 2026 Mimo Cherry. Todos os direitos reservados.</small></footer>

    {selectedProduct && <div className="product-modal-layer"><button className="cart-backdrop" onClick={() => setSelectedProduct(null)} aria-label="Fechar detalhes"></button><section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title"><button className="close-cart" onClick={() => setSelectedProduct(null)} aria-label="Fechar">×</button><div className={`modal-product-art ${selectedProduct.color}`}><span>{selectedProduct.icon}</span><div className="mini-book">Mimo<br/>Cherry</div></div><div className="modal-product-copy"><p className="eyebrow">{selectedProduct.category}</p><h2 id="product-modal-title">{selectedProduct.name}</h2><p>{selectedProduct.items}. Cada composição é preparada manualmente e pode variar conforme a disponibilidade.</p><strong className="modal-price">{money(selectedProduct.price)}</strong><small>ou 3x sem juros</small>{selectedProduct.category === "Scoops" && <fieldset><legend>Como você quer viver essa experiência?</legend>{["Surpresa total","Foto antes do envio","Vídeo da montagem"].map((option) => <label key={option}><input type="radio" name="experience" value={option} checked={experience === option} onChange={() => setExperience(option)}/><span>{option}</span></label>)}</fieldset>}<div className="modal-benefits"><span>✓ Preparado com carinho</span><span>✓ Envio com rastreio</span><span>✓ Pagamento protegido</span></div><button className="modal-buy" onClick={() => { add(selectedProduct); setSelectedProduct(null); }}>Adicionar à sacola</button><p className="modal-note">Prazo estimado de preparação: até 7 dias úteis.</p></div></section></div>}

    {cookieVisible && <aside className="cookie-notice"><p>Usamos apenas os cookies necessários para o carrinho e para melhorar sua experiência.</p><button onClick={() => setCookieVisible(false)}>Entendi</button></aside>}

    {cartOpen && <div className="cart-layer" role="presentation"><button className="cart-backdrop" aria-label="Fechar sacola" onClick={() => setCartOpen(false)}></button><aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title"><header><div><p className="eyebrow">SUA SELEÇÃO</p><h2 id="cart-title">Sacola de mimos</h2></div><button className="close-cart" onClick={() => setCartOpen(false)} aria-label="Fechar">×</button></header>
      {lines.length === 0 ? <div className="empty-cart"><span>♡</span><h3>Sua sacola está vazia</h3><p>Escolha um mimo para começar.</p><button onClick={() => setCartOpen(false)}>Ver produtos</button></div> : <><div className="cart-lines">{lines.map((line) => <article className="cart-line" key={line.id}><div className={`line-thumb ${line.color}`}>{line.icon}</div><div><h3>{line.name}</h3>{line.variant && <small>{line.variant}</small>}{line.preference && <small>Preferências: {line.preference}</small>}<small>{money(line.price)} cada</small><div className="quantity"><button onClick={() => setQuantity(line, line.quantity - 1)} aria-label={`Diminuir ${line.name}`}>−</button><span>{line.quantity}</span><button onClick={() => setQuantity(line, line.quantity + 1)} disabled={line.quantity >= line.stock} aria-label={`Aumentar ${line.name}`}>+</button></div></div><strong>{money(line.price * line.quantity)}</strong></article>)}</div>
      <div className="shipping-box"><label htmlFor="cep">Calcular entrega</label><div><input id="cep" inputMode="numeric" placeholder="Seu CEP" value={cep} onChange={(event) => { setCep(event.target.value); setShippingChecked(false); }} maxLength={9}/><button onClick={checkCep}>Calcular</button></div>{shippingChecked && <p>{shipping === 0 ? "Frete grátis aplicado ao seu pedido." : `Estimativa inicial de frete: ${money(shipping)}. Prazo e valor serão confirmados no checkout.`}</p>}</div>
      <div className="cart-summary"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Frete estimado</span><strong>{shipping === 0 ? "Grátis" : money(shipping)}</strong></div><div className="cart-total"><span>Total estimado</span><strong>{money(total)}</strong></div></div>
      <button className="checkout-button ready" onClick={checkout} disabled={checkoutStatus === "Abrindo pagamento seguro…"}>{checkoutStatus === "Abrindo pagamento seguro…" ? checkoutStatus : "Pagar com InfinitePay →"}</button>{checkoutStatus && checkoutStatus !== "Abrindo pagamento seguro…" && <p className="checkout-error" role="status">{checkoutStatus}</p>}<p className="checkout-note">Você será direcionado à página segura da InfinitePay. Nenhum dado de cartão passa pela Mimo Cherry.</p></>}
    </aside></div>}
  </main>;
}

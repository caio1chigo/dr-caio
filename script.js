// ===== MENU MOBILE =====
const menuBtn = document.getElementById("menu-btn");
const menuMobile = document.getElementById("menu-mobile");

if (menuBtn && menuMobile) {
  menuBtn.addEventListener("click", () => {
    const aberto = menuMobile.classList.toggle("aberto");
    menuBtn.setAttribute("aria-expanded", String(aberto));
  });

  // Fechar menu ao clicar em um link
  menuMobile.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuMobile.classList.remove("aberto");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

// ===== BOTÃO VOLTAR AO TOPO =====
const botaoTopo = document.getElementById("botao-topo");

if (botaoTopo) {
  function atualizarBotaoTopo() {
    const rolouBastante = window.scrollY > 400;
    botaoTopo.classList.toggle("visivel", rolouBastante);
  }

  window.addEventListener("scroll", atualizarBotaoTopo, { passive: true });
  atualizarBotaoTopo();

  botaoTopo.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// ===== CARROSSEL DO CONSULTÓRIO =====
const carrosseis = document.querySelectorAll(".carrossel-simples");

carrosseis.forEach((carrossel) => {
  const trilho = carrossel.querySelector(".carrossel-trilho");
  const anterior = carrossel.querySelector(".carrossel-anterior");
  const proxima = carrossel.querySelector(".carrossel-proxima");
  const itens = carrossel.querySelectorAll(".carrossel-item");

  if (!trilho || !anterior || !proxima || !itens.length) return;

  function larguraDoPasso() {
    const primeiroItem = trilho.querySelector(".carrossel-item");
    if (!primeiroItem) return 0;
    const larguraItem = primeiroItem.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(trilho).gap) || 0;
    return larguraItem + gap;
  }

  function atualizarSetas() {
    const inicio = trilho.scrollLeft <= 4;
    const fim = trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 4;
    anterior.classList.toggle("desabilitada", inicio);
    proxima.classList.toggle("desabilitada", fim);
  }

  anterior.addEventListener("click", () => {
    trilho.scrollBy({
      left: -larguraDoPasso(),
      behavior: "smooth",
    });
  });

  proxima.addEventListener("click", () => {
    trilho.scrollBy({
      left: larguraDoPasso(),
      behavior: "smooth",
    });
  });

  let frameAgendado = false;
  trilho.addEventListener(
    "scroll",
    () => {
      if (frameAgendado) return;
      frameAgendado = true;
      requestAnimationFrame(() => {
        atualizarSetas();
        frameAgendado = false;
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", atualizarSetas);
  atualizarSetas();

  // Lightbox ao clicar nas imagens
  itens.forEach((item, indice) => {
    item.addEventListener("click", () => {
      const imagens = Array.from(
        trilho.querySelectorAll(".carrossel-item img")
      ).map((img) => ({
        src: img.src,
        alt: img.alt,
      }));
      abrirLightbox(imagens, indice);
    });
  });
});

// ===== LIGHTBOX =====
const lightbox = document.getElementById("lightbox-galeria");
const lightboxImagem = document.getElementById("lightbox-imagem");
const lightboxContador = document.getElementById("lightbox-contador");
const lightboxFechar = document.getElementById("lightbox-fechar");
const lightboxAnterior = document.getElementById("lightbox-anterior");
const lightboxProxima = document.getElementById("lightbox-proxima");

let itensLightboxAtual = [];
let indiceLightboxAtual = 0;
let overflowOriginalDoBody = "";

function abrirLightbox(itens, indiceInicial) {
  if (!lightbox || !lightboxImagem || !lightboxContador || !itens.length) {
    return;
  }

  itensLightboxAtual = itens;
  indiceLightboxAtual = indiceInicial;
  atualizarImagemLightbox();

  if (!lightbox.open) {
    overflowOriginalDoBody = document.body.style.overflow;
    lightbox.showModal();
    document.body.style.overflow = "hidden";
  }
}

function fecharLightbox() {
  if (!lightbox || !lightbox.open) return;
  lightbox.close();
  document.body.style.overflow = overflowOriginalDoBody;
}

function atualizarImagemLightbox() {
  const item = itensLightboxAtual[indiceLightboxAtual];
  if (!item || !lightboxImagem || !lightboxContador) return;

  lightboxImagem.classList.remove("visivel");

  const imagemTemp = new Image();
  imagemTemp.src = item.src;
  imagemTemp.onload = () => {
    lightboxImagem.src = item.src;
    lightboxImagem.alt = item.alt;
    requestAnimationFrame(() => {
      lightboxImagem.classList.add("visivel");
    });
  };
  imagemTemp.onerror = () => {
    lightboxImagem.src = item.src;
    lightboxImagem.alt = item.alt;
    requestAnimationFrame(() => {
      lightboxImagem.classList.add("visivel");
    });
  };

  lightboxContador.textContent = `${indiceLightboxAtual + 1} / ${itensLightboxAtual.length}`;
}

function navegarLightbox(delta) {
  const total = itensLightboxAtual.length;
  if (!total) return;
  indiceLightboxAtual = (indiceLightboxAtual + delta + total) % total;
  atualizarImagemLightbox();
}

if (lightbox && lightboxFechar && lightboxAnterior && lightboxProxima) {
  lightboxFechar.addEventListener("click", fecharLightbox);
  lightboxAnterior.addEventListener("click", () => navegarLightbox(-1));
  lightboxProxima.addEventListener("click", () => navegarLightbox(1));

  lightbox.addEventListener("click", (evento) => {
    if (evento.target === lightbox) {
      fecharLightbox();
    }
  });

  lightbox.addEventListener("cancel", (evento) => {
    evento.preventDefault();
    fecharLightbox();
  });

  document.addEventListener("keydown", (evento) => {
    if (!lightbox.open) return;
    if (evento.key === "ArrowLeft") navegarLightbox(-1);
    if (evento.key === "ArrowRight") navegarLightbox(1);
  });

  // Swipe no mobile
  let toqueInicialX = 0;
  lightbox.addEventListener(
    "touchstart",
    (evento) => {
      toqueInicialX = evento.changedTouches[0].screenX;
    },
    { passive: true }
  );

  lightbox.addEventListener(
    "touchend",
    (evento) => {
      const toqueFinalX = evento.changedTouches[0].screenX;
      const diferenca = toqueFinalX - toqueInicialX;
      const limiarMinimo = 40;
      if (diferenca > limiarMinimo) navegarLightbox(-1);
      if (diferenca < -limiarMinimo) navegarLightbox(1);
    },
    { passive: true }
  );
}

// ===== FORMULÁRIO DE CONTATO =====
const form = document.getElementById("contact-form");

if (form) {
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nome = form.nome.value.trim();
    const whats = form.whats.value.trim();
    const msg = form.msg.value.trim();

    // ===== CONFIGURAÇÃO: TROCAR PELO NÚMERO REAL =====
    const numeroWhatsApp = "5511999999999"; // Substituir pelo número oficial do Dr. Caio

    const texto = encodeURIComponent(
      `Olá! Meu nome é ${nome}.\n\n${msg}\n\nMeu WhatsApp: ${whats}`
    );

    window.open(`https://wa.me/${numeroWhatsApp}?text=${texto}`, "_blank");
  });
}

// ===== FAQ: ACESSIBILIDADE =====
// ===== FAQ: ACORDEÃO =====
const faqItems = document.querySelectorAll(".item-faq");

faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;

    faqItems.forEach((outroItem) => {
      if (outroItem !== item && outroItem.open) {
        outroItem.open = false;
      }
    });
  });
});

  // Inicializar estado
  summary.setAttribute("aria-expanded", String(item.hasAttribute("open")));

// ===== SCROLL SUAVE PARA LINKS INTERNOS =====
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (evento) => {
    const href = link.getAttribute("href");
    if (href === "#") return;

    const alvo = document.querySelector(href);
    if (!alvo) return;

    evento.preventDefault();
    const offsetTop = alvo.offsetTop;
    const alturaHeader = 80;

    window.scrollTo({
      top: offsetTop - alturaHeader,
      behavior: "smooth",
    });
  });
});
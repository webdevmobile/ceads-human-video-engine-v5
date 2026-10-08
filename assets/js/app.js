
(() => {
  "use strict";

  const config = window.CEADS_CONFIG || {};
  const money = new Intl.NumberFormat("fr-FR");
  // Les URL vidéo sont définies directement dans index.html, dans le bloc CEADS_VIDEO_URLS.
  const videoUrls = { ...(window.CEADS_VIDEO_URLS || {}) };

  const formatPrice = (value) => `${money.format(value).replace(/\u202f/g, " ")} FCFA`;

  // ------------------------------------------------------------
  // VIDEO PLAYER V25 — interactions mobiles + contrôles intelligents.
  // ------------------------------------------------------------
  function normalizeVideoUrl(url) {
    return String(url || "")
      .replace(/\\/g, "")
      .replace(/\u00a0/g, " ")
      .trim();
  }

  function getYouTubeId(url) {
    try {
      const u = new URL(normalizeVideoUrl(url));
      const host = u.hostname.replace(/^www\./, "").toLowerCase();
      if (host === "youtu.be") return u.pathname.split("/").filter(Boolean)[0] || "";
      if (!host.includes("youtube.com")) return "";
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const parts = u.pathname.split("/").filter(Boolean);
      for (const marker of ["embed", "shorts", "live"]) {
        const i = parts.indexOf(marker);
        if (i >= 0 && parts[i + 1]) return parts[i + 1];
      }
      return "";
    } catch {
      return "";
    }
  }

  function getVimeoInfo(url) {
    try {
      const u = new URL(normalizeVideoUrl(url));
      const parts = u.pathname.split("/").filter(Boolean);
      let id = "";
      let hash = u.searchParams.get("h") || "";
      for (let i = parts.length - 1; i >= 0; i -= 1) {
        if (/^\d+$/.test(parts[i])) {
          id = parts[i];
          const next = parts[i + 1] || "";
          if (!hash && /^[a-zA-Z0-9]+$/.test(next) && !/^\d+$/.test(next)) hash = next;
          break;
        }
      }
      return { id, hash };
    } catch {
      return { id: "", hash: "" };
    }
  }

  function getVimeoId(url) {
    return getVimeoInfo(url).id;
  }

  function getWistiaId(url) {
    const text = normalizeVideoUrl(url);
    const patterns = [
      /wistia\.com\/medias\/([a-zA-Z0-9]+)/i,
      /wistia\.com\/m\/([a-zA-Z0-9]+)/i,
      /fast\.wistia\.(?:net|com)\/embed\/iframe\/([a-zA-Z0-9]+)/i,
      /wi\.st\/(?:medias\/|m\/)?([a-zA-Z0-9]+)/i,
      /[?&]wvideo=([a-zA-Z0-9]+)/i
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) return match[1];
    }
    return "";
  }

  function fetchWistiaOembed(url) {
    const cleanUrl = normalizeVideoUrl(url);
    if (!cleanUrl) return Promise.reject(new Error("URL Wistia vide"));
    if (wistiaOembedByUrl.has(cleanUrl)) return wistiaOembedByUrl.get(cleanUrl);

    try {
      const cached = sessionStorage.getItem(WISTIA_CACHE_PREFIX + cleanUrl);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.id) {
          const ready = Promise.resolve(parsed);
          wistiaOembedByUrl.set(cleanUrl, ready);
          return ready;
        }
      }
    } catch {}

    const promise = new Promise((resolve, reject) => {
      const callbackName = `__ceadsWistiaOembed_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      let settled = false;

      const cleanup = () => {
        try { delete window[callbackName]; } catch { window[callbackName] = undefined; }
        script.remove();
      };

      const timeout = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("Wistia oEmbed timeout"));
      }, 12000);

      window[callbackName] = (data) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        try {
          const html = String(data?.html || "");
          const urlField = String(data?.url || "");
          const combined = `${html} ${urlField}`;
          const patterns = [
            /(?:fast\.wistia\.(?:net|com)\/embed\/iframe\/|wistia\.com\/(?:medias|m)\/)([a-zA-Z0-9]+)/i,
            /wistia_async_([a-zA-Z0-9]+)/i,
            /media-id=["']([a-zA-Z0-9]+)["']/i,
            /wvideo=([a-zA-Z0-9]+)/i
          ];
          let id = getWistiaId(cleanUrl);
          for (const pattern of patterns) {
            const match = combined.match(pattern);
            if (match?.[1]) { id = match[1]; break; }
          }
          if (!id) throw new Error("Wistia hashed ID introuvable");
          const width = Number(data?.width || data?.thumbnail_width || 0);
          const height = Number(data?.height || data?.thumbnail_height || 0);
          const meta = {
            id,
            width: width > 0 ? width : 0,
            height: height > 0 ? height : 0,
            thumbnailUrl: String(data?.thumbnail_url || "").trim(),
            title: String(data?.title || "").trim()
          };
          try { sessionStorage.setItem(WISTIA_CACHE_PREFIX + cleanUrl, JSON.stringify(meta)); } catch {}
          cleanup();
          resolve(meta);
        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      script.onerror = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        cleanup();
        reject(new Error("Impossible de contacter Wistia oEmbed"));
      };

      const endpoint = new URL("https://fast.wistia.com/oembed.json");
      endpoint.searchParams.set("url", cleanUrl);
      endpoint.searchParams.set("callback", callbackName);
      script.src = endpoint.toString();
      script.async = true;
      document.head.appendChild(script);
    });

    wistiaOembedByUrl.set(cleanUrl, promise);
    promise.catch(() => wistiaOembedByUrl.delete(cleanUrl));
    return promise;
  }

  function detectProvider(url) {
    const cleanUrl = normalizeVideoUrl(url);
    try {
      const u = new URL(cleanUrl);
      const host = u.hostname.replace(/^www\./, "").toLowerCase();
      const path = u.pathname.toLowerCase();
      if (host === "youtu.be" || host.includes("youtube.com")) return "youtube";
      if (host.includes("vimeo.com")) return "vimeo";
      if (host.includes("wistia.com") || host.includes("wi.st") || host.includes("fast.wistia")) return "wistia";
      if (host.includes("facebook.com") || host.includes("fb.watch")) return "facebook";
      if (/\.(mp4|webm|ogg|m4v|mov)$/i.test(path)) return "file";
      return "external";
    } catch {
      return /\.(mp4|webm|ogg|m4v|mov)(\?|#|$)/i.test(cleanUrl) ? "file" : "external";
    }
  }

  function createIframe(src, title) {
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = title || "Vidéo";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "origin-when-cross-origin";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("playsinline", "");
    iframe.loading = "eager";
    return iframe;
  }

  const loadedScripts = new Map();
  const wistiaOembedByUrl = new Map();
  const WISTIA_CACHE_PREFIX = "ceads:wistia-meta:";
  function ensureScript(src, { type = "text/javascript" } = {}) {
    if (loadedScripts.has(src)) return loadedScripts.get(src);
    const promise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.ceadsLoaded === "1") return resolve(existing);
        existing.addEventListener("load", () => resolve(existing), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      if (type) script.type = type;
      script.addEventListener("load", () => {
        script.dataset.ceadsLoaded = "1";
        resolve(script);
      }, { once: true });
      script.addEventListener("error", reject, { once: true });
      document.head.appendChild(script);
    });
    loadedScripts.set(src, promise);
    return promise;
  }

  function primeWistiaScripts(id) {
    // Aurora : un seul moteur global + les métadonnées du média courant.
    ensureScript("https://fast.wistia.com/player.js").catch(() => {});
    ensureScript(`https://fast.wistia.com/embed/${id}.js`, { type: "module" }).catch(() => {});
  }

  function primeVimeoSdk() {
    return ensureScript("https://player.vimeo.com/api/player.js").catch(() => null);
  }

  let youtubeApiPromise = null;
  function primeYouTubeSdk() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (youtubeApiPromise) return youtubeApiPromise;

    youtubeApiPromise = new Promise((resolve, reject) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        if (window.YT?.Player) resolve(window.YT);
        else reject(new Error("API YouTube indisponible"));
      };

      window.onYouTubeIframeAPIReady = () => {
        try { previousReady?.(); } catch {}
        finish();
      };

      ensureScript("https://www.youtube.com/iframe_api")
        .then(() => {
          if (window.YT?.Player) finish();
          else window.setTimeout(() => window.YT?.Player && finish(), 80);
        })
        .catch(reject);

      window.setTimeout(() => {
        if (!settled && window.YT?.Player) finish();
      }, 2500);
    }).catch((error) => {
      youtubeApiPromise = null;
      throw error;
    });

    return youtubeApiPromise;
  }

  function addDnsHint(origin) {
    if (!origin || document.head.querySelector(`link[data-ceads-dns="${origin}"]`)) return;
    const dns = document.createElement("link");
    dns.rel = "dns-prefetch";
    dns.href = origin;
    dns.dataset.ceadsDns = origin;
    document.head.appendChild(dns);
  }

  function addConnectionHint(origin) {
    if (!origin || document.head.querySelector(`link[data-ceads-preconnect="${origin}"]`)) return;
    addDnsHint(origin);
    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = origin;
    preconnect.crossOrigin = "anonymous";
    preconnect.dataset.ceadsPreconnect = origin;
    document.head.appendChild(preconnect);
  }

  function providerOrigins(url) {
    const provider = detectProvider(url);
    if (provider === "wistia") return ["https://fast.wistia.com", "https://fast.wistia.net"];
    if (provider === "youtube") return ["https://www.youtube.com", "https://www.youtube-nocookie.com", "https://i.ytimg.com"];
    if (provider === "vimeo") return ["https://player.vimeo.com", "https://i.vimeocdn.com"];
    if (provider === "facebook") return ["https://www.facebook.com", "https://connect.facebook.net"];
    if (provider === "file") {
      try { return [new URL(url, location.href).origin]; } catch { return []; }
    }
    return [];
  }

  function warmProviderConnections() {
    // Sur réseau lent, ne faisons pas 8 handshakes TLS dès l'ouverture.
    // DNS pour les providers secondaires ; preconnect seulement pour la VSL.
    Object.values(videoUrls).forEach((rawUrl) => {
      const url = normalizeVideoUrl(rawUrl);
      if (!url) return;
      providerOrigins(url).forEach(addDnsHint);
    });
    const vslUrl = normalizeVideoUrl(videoUrls.vsl || "");
    providerOrigins(vslUrl).forEach(addConnectionHint);
  }

  function showVideoNotice(slot, message) {
    slot.querySelector(".video-notice")?.remove();
    const notice = document.createElement("div");
    notice.className = "video-notice";
    const text = document.createElement("p");
    text.textContent = message;
    notice.appendChild(text);
    slot.appendChild(notice);
  }

  function sendYouTubeCommand(iframe, func, args = []) {
    try {
      iframe?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
    } catch {}
  }

  function sendVimeoCommand(iframe, method, value) {
    try {
      const payload = value === undefined ? { method } : { method, value };
      iframe?.contentWindow?.postMessage(JSON.stringify(payload), "https://player.vimeo.com");
    } catch {}
  }

  function installYouTubeControls(controller) {
    if (!controller?.iframe || controller.youtubeControls) return;

    controller.node.classList.add("media-embed--youtube-custom");
    controller.iframe.classList.add("ceads-youtube-frame");
    // Aucun clic n'est transmis directement à YouTube : toute l'interaction
    // passe par notre couche CEADS et l'IFrame Player API.
    controller.iframe.style.pointerEvents = "none";

    const gestureLayer = document.createElement("button");
    gestureLayer.type = "button";
    gestureLayer.className = "ceads-youtube-gesture-layer";
    gestureLayer.setAttribute("aria-label", "Lire ou mettre en pause la vidéo");
    gestureLayer.title = "Lire / pause · Double toucher à gauche/droite : -10 s / +10 s";

    const seekFeedback = document.createElement("span");
    seekFeedback.className = "ceads-youtube-seek-feedback";
    seekFeedback.setAttribute("aria-hidden", "true");
    controller.node.append(gestureLayer, seekFeedback);

    const controls = document.createElement("div");
    controls.className = "ceads-youtube-controls";
    controls.setAttribute("aria-label", "Contrôles vidéo");

    const makeButton = (label, icon) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ceads-youtube-control";
      button.setAttribute("aria-label", label);
      button.title = label;
      button.innerHTML = icon;
      return button;
    };

    let paused = false;
    let muted = false;
    let youtubePlayer = null;
    let singleTapTimer = 0;
    let lastTapAt = 0;
    let lastTapSide = "";

    const playPause = makeButton("Mettre en pause", "❚❚");
    const replay = makeButton("Reprendre depuis le début", "↺");
    const sound = makeButton("Couper le son", "🔊");
    const fullscreen = makeButton("Plein écran", "⛶");

    const setPaused = (value) => {
      paused = Boolean(value);
      playPause.innerHTML = paused ? "▶" : "❚❚";
      playPause.setAttribute("aria-label", paused ? "Lire la vidéo" : "Mettre en pause");
      playPause.title = paused ? "Lire la vidéo" : "Mettre en pause";
      gestureLayer.setAttribute("aria-label", paused ? "Lire la vidéo" : "Mettre en pause la vidéo");
    };

    const getYoutubePlayer = () => {
      if (controller.youtubeApiReadyPromise) return controller.youtubeApiReadyPromise;
      controller.youtubeApiReadyPromise = primeYouTubeSdk().then(() => new Promise((resolve, reject) => {
        if (!window.YT?.Player) return reject(new Error("API YouTube indisponible"));
        try {
          if (controller.youtubePlayer?.getCurrentTime) return resolve(controller.youtubePlayer);
          controller.youtubePlayer = new window.YT.Player(controller.iframe, {
            events: {
              onReady: (event) => resolve(event.target),
              onStateChange: (event) => {
                if (event.data === 1) setPaused(false);
                else if (event.data === 2 || event.data === 0 || event.data === 5) setPaused(true);
              },
              onError: () => reject(new Error("Lecteur YouTube indisponible"))
            }
          });
        } catch (error) {
          reject(error);
        }
      })).catch((error) => {
        controller.youtubeApiReadyPromise = null;
        throw error;
      });
      return controller.youtubeApiReadyPromise;
    };

    const togglePlayback = () => {
      const state = youtubePlayer?.getPlayerState?.();
      const isPlaying = state === 1 || (state == null && !paused);
      if (isPlaying) {
        if (youtubePlayer?.pauseVideo) youtubePlayer.pauseVideo();
        else sendYouTubeCommand(controller.iframe, "pauseVideo");
        setPaused(true);
      } else {
        if (youtubePlayer?.playVideo) youtubePlayer.playVideo();
        else sendYouTubeCommand(controller.iframe, "playVideo");
        setPaused(false);
      }
    };

    const flashSeek = (delta, side) => {
      seekFeedback.textContent = delta < 0 ? "↶ 10 s" : "10 s ↷";
      seekFeedback.classList.remove("is-left", "is-right", "is-visible");
      seekFeedback.classList.add(side === "left" ? "is-left" : "is-right");
      void seekFeedback.offsetWidth;
      seekFeedback.classList.add("is-visible");
      window.setTimeout(() => seekFeedback.classList.remove("is-visible"), 520);
    };

    const seekRelative = async (delta, side) => {
      try {
        youtubePlayer = youtubePlayer?.getCurrentTime ? youtubePlayer : await getYoutubePlayer();
        if (youtubePlayer?.getCurrentTime && youtubePlayer?.seekTo) {
          const current = Number(youtubePlayer.getCurrentTime() || 0);
          youtubePlayer.seekTo(Math.max(0, current + delta), true);
          flashSeek(delta, side);
        }
      } catch {}
    };

    playPause.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      togglePlayback();
    });

    replay.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (youtubePlayer?.seekTo) youtubePlayer.seekTo(0, true);
      else sendYouTubeCommand(controller.iframe, "seekTo", [0, true]);
      if (youtubePlayer?.playVideo) youtubePlayer.playVideo();
      else sendYouTubeCommand(controller.iframe, "playVideo");
      setPaused(false);
    });

    sound.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      muted = !muted;
      if (muted) {
        if (youtubePlayer?.mute) youtubePlayer.mute();
        else sendYouTubeCommand(controller.iframe, "mute");
      } else {
        if (youtubePlayer?.unMute) {
          youtubePlayer.unMute();
          youtubePlayer.setVolume?.(100);
        } else {
          sendYouTubeCommand(controller.iframe, "unMute");
          sendYouTubeCommand(controller.iframe, "setVolume", [100]);
        }
      }
      sound.innerHTML = muted ? "🔇" : "🔊";
      sound.setAttribute("aria-label", muted ? "Activer le son" : "Couper le son");
      sound.title = muted ? "Activer le son" : "Couper le son";
    });

    fullscreen.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      try {
        if (!document.fullscreenElement) await controller.node.requestFullscreen?.();
        else await document.exitFullscreen?.();
      } catch {}
    });

    // Tap/clic simple sur la vidéo = lecture / pause.
    // Double tap/clic à gauche = -10 s ; à droite = +10 s, comme les raccourcis J/L de YouTube.
    gestureLayer.addEventListener("pointerup", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const rect = gestureLayer.getBoundingClientRect();
      const side = event.clientX < rect.left + rect.width / 2 ? "left" : "right";
      const now = performance.now();
      const isDoubleTap = lastTapSide === side && now - lastTapAt <= 330;

      if (isDoubleTap) {
        if (singleTapTimer) window.clearTimeout(singleTapTimer);
        singleTapTimer = 0;
        lastTapAt = 0;
        lastTapSide = "";
        seekRelative(side === "left" ? -10 : 10, side);
        return;
      }

      lastTapAt = now;
      lastTapSide = side;
      if (singleTapTimer) window.clearTimeout(singleTapTimer);
      singleTapTimer = window.setTimeout(() => {
        togglePlayback();
        singleTapTimer = 0;
        lastTapAt = 0;
        lastTapSide = "";
      }, 245);
    });

    gestureLayer.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      togglePlayback();
    });

    controls.append(playPause, replay, sound, fullscreen);
    controller.node.appendChild(controls);
    controller.youtubeControls = controls;
    controller.youtubeSetPaused = setPaused;

    // Attache l'API officielle au même iframe, sans le recréer.
    getYoutubePlayer().then((player) => {
      youtubePlayer = player;
    }).catch(() => {});
  }
  // Navigation mobile
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  const siteHeader = document.querySelector(".site-header");
  if (navToggle && nav) {
    const closeMobileNav = () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMobileNav();
    });

    // Si le menu est ouvert, un tap/clic ailleurs sur la page le referme.
    document.addEventListener("pointerdown", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || navToggle.contains(event.target)) return;
      closeMobileNav();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeMobileNav();
        navToggle.focus();
      }
    });
  }

  // Scroll reveal
  const revealNodes = [...document.querySelectorAll(".reveal")];
  revealNodes.forEach((node) => {
    const delay = Number(node.dataset.delay || 0);
    node.style.setProperty("--delay", `${delay}ms`);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7%" });
    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }

  // Pricing tiers
  function resolvePricing() {
    const pricing = config.pricing || {};
    const tiers = Array.isArray(pricing.tiers) ? pricing.tiers : [];
    const purchases = Math.max(0, Number(pricing.currentPurchases || 0));
    if (!tiers.length) return;

    const normalizedCount = Math.max(1, purchases + 1);
    let index = tiers.findIndex((tier) => normalizedCount >= tier.min && (tier.max == null || normalizedCount <= tier.max));
    if (index < 0) index = tiers.length - 1;

    const active = tiers[index];
    const next = tiers[index + 1] || null;
    const purchasedInTier = active.max == null ? purchases : Math.max(0, purchases - active.min + 1);
    const tierCapacity = active.max == null ? 1 : active.max - active.min + 1;
    const progress = active.max == null ? 100 : Math.min(100, (purchasedInTier / tierCapacity) * 100);

    document.querySelectorAll("[data-current-price]").forEach((el) => { el.textContent = formatPrice(active.price); });
    document.querySelectorAll("[data-next-price]").forEach((el) => { el.textContent = next ? formatPrice(next.price) : "prix final"; });
    document.querySelectorAll("[data-tier-progress]").forEach((el) => {
      el.textContent = active.max == null ? `${purchases} inscriptions` : `${purchasedInTier} / ${tierCapacity}`;
    });
    const fill = document.querySelector("[data-progress-fill]");
    if (fill) fill.style.width = `${progress}%`;

    document.querySelectorAll("[data-tier]").forEach((card) => {
      card.classList.toggle("is-active", Number(card.dataset.tier) === index + 1);
    });
  }
  resolvePricing();

  // Checkout
  const checkoutUrl = String(config.checkoutUrl || "").trim();
  document.querySelectorAll(".js-checkout").forEach((link) => {
    if (checkoutUrl) {
      link.href = checkoutUrl;
      link.target = "_blank";
      link.setAttribute("rel", "noopener noreferrer");
    } else if (link.getAttribute("href") === "#") {
      link.href = "#pricing";
    }
  });
  const note = document.querySelector("[data-checkout-note]");
  if (checkoutUrl && note) note.hidden = true;

  // CTA attention system — subtle, periodic and conversion-oriented.
  document.querySelectorAll("main .js-checkout.btn").forEach((button, index) => {
    button.classList.add("cta-attention");
    button.style.setProperty("--cta-delay", `${(index % 6) * 0.55}s`);
  });

  // Aide vidéo : message volontairement court. Le visiteur n'a pas besoin
  // de savoir que l'aperçu est muet ; il doit seulement comprendre le clic.
  document.querySelectorAll("[data-media-slot]").forEach((slot) => {
    if (slot.nextElementSibling?.classList?.contains("video-watch-hint")) return;
    const hint = document.createElement("div");
    hint.className = "video-watch-hint";
    hint.innerHTML = `<span class="video-watch-hint__item"><span aria-hidden="true">🔊</span> Clique sur la vidéo pour la reprendre depuis le début avec le son</span>`;
    slot.insertAdjacentElement("afterend", hint);
  });

  warmProviderConnections();
  window.setTimeout(() => {
    const providers = new Set(Object.values(videoUrls).map((url) => detectProvider(url)).filter(Boolean));
    if (providers.has("wistia")) ensureScript("https://fast.wistia.com/player.js").catch(() => {});
    if (providers.has("vimeo")) primeVimeoSdk();
  }, 120);

  // ------------------------------------------------------------
  // MEDIA ENGINE V22
  // Objectif : page légère sur connexion lente + aucun remplacement du player
  // lorsque l'utilisateur clique sur un aperçu déjà chargé.
  // ------------------------------------------------------------
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const effectiveType = String(connection?.effectiveType || "").toLowerCase();
  const saveData = Boolean(connection?.saveData);
  const slowNetwork = saveData || ["slow-2g", "2g", "3g"].includes(effectiveType);
  const verySlowNetwork = saveData || ["slow-2g", "2g"].includes(effectiveType);
  if (slowNetwork) document.documentElement.classList.add("network-slow");
  const maxConcurrentPreviews = verySlowNetwork ? 1 : slowNetwork ? 2 : 3;
  const previewRootMargin = verySlowNetwork ? "1200px 0px" : slowNetwork ? "1800px 0px" : "2600px 0px";

  const wistiaMetaPromises = new Map();
  const controllerBySlot = new Map();
  const previewPromiseBySlot = new Map();
  const previewQueue = [];
  const queuedSlotIds = new Set();
  let activePreviewLoads = 0;
  const slots = [...document.querySelectorAll("[data-media-slot]")];

  function applyVideoAspect(slot, width, height) {
    const w = Number(width || 0);
    const h = Number(height || 0);
    if (!(w > 0 && h > 0)) return;
    slot.style.setProperty("--ceads-video-ratio", `${w} / ${h}`);
    slot.classList.add("has-video-aspect");
  }

  function preloadWistiaForSlot(slot, slotId, url) {
    if (detectProvider(url) !== "wistia") return null;
    if (wistiaMetaPromises.has(slotId)) return wistiaMetaPromises.get(slotId);

    const promise = fetchWistiaOembed(url)
      .then((meta) => {
        applyVideoAspect(slot, meta.width, meta.height);
        if (slotId !== "vsl" && meta.thumbnailUrl) {
          const poster = slot.querySelector(".media-poster");
          if (poster) {
            poster.src = meta.thumbnailUrl;
            poster.alt = meta.title ? `Aperçu : ${meta.title}` : "Aperçu de la vidéo";
            poster.loading = "eager";
            poster.decoding = "async";
            poster.classList.add("media-poster--wistia");
          }
        }
        return meta;
      })
      .catch((error) => {
        console.warn(`CEADS: métadonnées Wistia indisponibles pour ${slotId}`, error);
        return null;
      });

    wistiaMetaPromises.set(slotId, promise);
    return promise;
  }

  // Métadonnées légères uniquement. On ne charge PAS les iframes hors écran.
  slots.forEach((slot) => {
    const slotId = slot.dataset.mediaSlot;
    const url = normalizeVideoUrl(videoUrls[slotId] || "");
    if (!url) return;
    const provider = detectProvider(url);
    if (provider === "wistia") preloadWistiaForSlot(slot, slotId, url);
    if (provider === "youtube" && slotId !== "vsl") {
      const id = getYouTubeId(url);
      const poster = slot.querySelector(".media-poster");
      if (id && poster) {
        poster.src = `https://i.ytimg.com/vi/${id}/${verySlowNetwork ? "mqdefault" : "hqdefault"}.jpg`;
        poster.loading = "eager";
        poster.fetchPriority = slotId === "vsl" ? "high" : "low";
        poster.decoding = "async";
      }
    }
  });

  function createControllerNode(provider, title) {
    const wrap = document.createElement("div");
    wrap.className = "media-embed media-embed--preview";
    wrap.dataset.provider = provider;
    wrap.setAttribute("aria-label", title || "Vidéo");
    return wrap;
  }

  async function buildPreviewController(slot, url, preparedWistiaMeta = null) {
    const cleanUrl = normalizeVideoUrl(url);
    const provider = detectProvider(cleanUrl);
    const title = slot.getAttribute("aria-label") || slot.dataset.mediaSlot || "Vidéo";
    const wrap = createControllerNode(provider, title);
    const controller = { provider, node: wrap, slot, ready: false, interactive: false, userIntent: false, failed: false };

    if (provider === "youtube") {
      const id = getYouTubeId(cleanUrl);
      if (!id) return null;
      const params = new URLSearchParams({
        autoplay: "1", mute: "1", loop: "1", playlist: id,
        controls: "0", rel: "0", playsinline: "1", enablejsapi: "1",
        iv_load_policy: "3", fs: "0", disablekb: "1"
      });
      if (location.protocol === "http:" || location.protocol === "https:") {
        params.set("origin", location.origin);
        params.set("widget_referrer", location.href);
      }
      const iframe = createIframe(`https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`, title);
      iframe.dataset.provider = "youtube";
      controller.iframe = iframe;
      wrap.appendChild(iframe);
      return controller;
    }

    if (provider === "vimeo") {
      const info = getVimeoInfo(cleanUrl);
      if (!info.id) return null;
      addConnectionHint("https://player.vimeo.com");
      primeVimeoSdk();
      const params = new URLSearchParams({
        autoplay: "1", muted: "1", loop: "1", autopause: "0",
        controls: "1", title: "0", byline: "0", portrait: "0",
        dnt: "1", playsinline: "1", transparent: "0", responsive: "1",
        preload: slowNetwork ? "metadata" : "auto_on_hover",
        initial_quality: slowNetwork ? "360p" : "540p"
      });
      if (info.hash) params.set("h", info.hash);
      const iframe = createIframe(`https://player.vimeo.com/video/${info.id}?${params.toString()}`, title);
      iframe.dataset.provider = "vimeo";
      controller.iframe = iframe;
      wrap.appendChild(iframe);
      controller.vimeoReadyPromise = primeVimeoSdk().then(() => {
        if (!window.Vimeo?.Player) throw new Error("SDK Vimeo indisponible");
        if (!controller.vimeoPlayer) controller.vimeoPlayer = new window.Vimeo.Player(iframe);
        return controller.vimeoPlayer.ready().then(() => controller.vimeoPlayer);
      }).catch((error) => {
        controller.failed = true;
        throw error;
      });
      return controller;
    }

    if (provider === "wistia") {
      const meta = preparedWistiaMeta || await fetchWistiaOembed(cleanUrl).catch(() => null);
      const id = meta?.id || getWistiaId(cleanUrl);
      if (!id) return null;
      if (meta) applyVideoAspect(slot, meta.width, meta.height);
      addConnectionHint("https://fast.wistia.com");
      primeWistiaScripts(id);

      const player = document.createElement("wistia-player");
      player.setAttribute("media-id", id);
      player.setAttribute("autoplay", "");
      player.setAttribute("muted", "");
      player.setAttribute("silent-autoplay", "true");
      player.setAttribute("preload", slowNetwork ? "metadata" : "auto");
      player.setAttribute("end-video-behavior", "loop");
      player.setAttribute("controls-visible-on-load", "false");
      player.setAttribute("big-play-button", "false");
      player.setAttribute("play-pause-control", "true");
      player.setAttribute("play-bar-control", "true");
      player.setAttribute("volume-control", "true");
      player.setAttribute("fullscreen-control", "true");
      player.setAttribute("resumable", "false");
      player.setAttribute("fit-strategy", "contain");
      player.setAttribute("video-quality", slowNetwork ? "360" : "540");
      player.setAttribute("quality-control", "true");
      player.setAttribute("playback-rate-control", "true");
      player.setAttribute("play-pause-notifier", "false");
      player.style.width = "100%";
      player.style.height = "100%";
      controller.wistiaPlayer = player;
      wrap.appendChild(player);
      return controller;
    }

    if (provider === "facebook") {
      const params = new URLSearchParams({
        href: cleanUrl,
        show_text: "false",
        autoplay: "true",
        mute: "true",
        allowfullscreen: "true"
      });
      addConnectionHint("https://www.facebook.com");
      const iframe = createIframe(`https://www.facebook.com/plugins/video.php?${params.toString()}`, title);
      iframe.dataset.provider = "facebook";
      controller.iframe = iframe;
      wrap.appendChild(iframe);
      return controller;
    }

    if (provider === "file") {
      const video = document.createElement("video");
      video.src = cleanUrl;
      video.controls = false;
      video.autoplay = true;
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.volume = 0;
      video.playsInline = true;
      video.preload = verySlowNetwork ? "metadata" : "auto";
      video.setAttribute("playsinline", "");
      controller.mediaElement = video;
      wrap.appendChild(video);
      return controller;
    }

    // Plateforme non reconnue : aucun téléchargement automatique lourd.
    return null;
  }

  function markControllerReady(slot, controller) {
    if (!controller || controller.ready) return;
    controller.ready = true;
    slot.classList.add("is-player-ready");
    if (!slot.classList.contains("is-playing")) slot.classList.add("is-preview-ready");
    if (controller.userIntent && !controller.interactive) promoteController(slot, controller);
  }

  function attachReadySignal(slot, controller) {
    if (controller.provider === "vimeo" && controller.vimeoReadyPromise) {
      controller.vimeoReadyPromise
        .then(() => markControllerReady(slot, controller))
        .catch(() => {
          controller.failed = true;
          slot.classList.remove("is-preview-ready");
        });
      return;
    }
    if (controller.iframe) {
      controller.iframe.addEventListener("load", () => markControllerReady(slot, controller), { once: true });
      controller.iframe.addEventListener("error", () => {
        controller.failed = true;
        slot.classList.remove("is-preview-ready");
      }, { once: true });
      return;
    }
    if (controller.mediaElement) {
      controller.mediaElement.addEventListener("canplay", () => markControllerReady(slot, controller), { once: true });
      controller.mediaElement.addEventListener("error", () => { controller.failed = true; }, { once: true });
      controller.mediaElement.play().catch(() => {});
      return;
    }
    if (controller.wistiaPlayer) {
      const ready = () => markControllerReady(slot, controller);
      controller.wistiaPlayer.addEventListener("loaded-data", ready, { once: true });
      controller.wistiaPlayer.addEventListener("can-play", ready, { once: true });
      controller.wistiaPlayer.addEventListener("error", () => { controller.failed = true; }, { once: true });
      window.setTimeout(() => {
        try {
          if (Number(controller.wistiaPlayer?.readyState || 0) >= 2) markControllerReady(slot, controller);
        } catch {}
      }, slowNetwork ? 2200 : 1100);
    }
  }

  async function startMutedPreview(slot) {
    const slotId = slot.dataset.mediaSlot;
    const url = normalizeVideoUrl(videoUrls[slotId] || "");
    if (!url || slot.classList.contains("is-playing")) return null;
    if (controllerBySlot.has(slotId)) return controllerBySlot.get(slotId);
    if (previewPromiseBySlot.has(slotId)) return previewPromiseBySlot.get(slotId);

    const promise = (async () => {
      let meta = null;
      if (detectProvider(url) === "wistia") {
        meta = await (preloadWistiaForSlot(slot, slotId, url) || Promise.resolve(null));
      }
      if (slot.classList.contains("is-playing")) return null;
      providerOrigins(url).forEach(addConnectionHint);
      const controller = await buildPreviewController(slot, url, meta);
      if (!controller || slot.classList.contains("is-playing")) return null;
      slot.querySelector(".media-embed")?.remove();
      slot.appendChild(controller.node);
      slot.classList.add("is-previewing");
      controllerBySlot.set(slotId, controller);
      attachReadySignal(slot, controller);
      return controller;
    })().catch((error) => {
      console.warn(`CEADS: preview impossible pour ${slotId}`, error);
      return null;
    });

    previewPromiseBySlot.set(slotId, promise);
    promise.then((controller) => {
      if (!controller) previewPromiseBySlot.delete(slotId);
    }).catch(() => previewPromiseBySlot.delete(slotId));
    return promise;
  }

  function enqueuePreview(slot, { priority = false } = {}) {
    const slotId = slot.dataset.mediaSlot;
    if (!slotId || controllerBySlot.has(slotId) || previewPromiseBySlot.has(slotId) || queuedSlotIds.has(slotId)) return;
    queuedSlotIds.add(slotId);
    if (priority) previewQueue.unshift(slot); else previewQueue.push(slot);
    pumpPreviewQueue();
  }

  function pumpPreviewQueue() {
    while (activePreviewLoads < maxConcurrentPreviews && previewQueue.length) {
      const slot = previewQueue.shift();
      const slotId = slot.dataset.mediaSlot;
      queuedSlotIds.delete(slotId);
      activePreviewLoads += 1;
      startMutedPreview(slot).finally(() => {
        activePreviewLoads = Math.max(0, activePreviewLoads - 1);
        pumpPreviewQueue();
      });
    }
  }

  function promoteController(slot, controller) {
    if (!controller || controller.interactive) return;
    controller.interactive = true;
    controller.node.classList.remove("media-embed--preview");
    controller.node.classList.add("media-embed--active");
    slot.classList.remove("is-previewing", "is-preview-ready");
    slot.classList.add("is-playing");
    slot.querySelector(".video-notice")?.remove();
    slot.removeAttribute("role");
    slot.removeAttribute("tabindex");

    if (controller.provider === "youtube" && controller.iframe) {
      installYouTubeControls(controller);
      const activateYouTube = () => {
        sendYouTubeCommand(controller.iframe, "seekTo", [0, true]);
        sendYouTubeCommand(controller.iframe, "unMute");
        sendYouTubeCommand(controller.iframe, "setVolume", [100]);
        sendYouTubeCommand(controller.iframe, "playVideo");
        controller.youtubeSetPaused?.(false);
      };
      activateYouTube();
      window.setTimeout(activateYouTube, 120);
      window.setTimeout(activateYouTube, 360);
      return;
    }

    if (controller.provider === "vimeo" && controller.iframe) {
      if (controller.vimeoPlayer) {
        try {
          controller.vimeoPlayer.ready().then(async () => {
            try { await controller.vimeoPlayer.setLoop(false); } catch {}
            try { await controller.vimeoPlayer.setCurrentTime(0); } catch {}
            try { await controller.vimeoPlayer.setMuted(false); } catch {}
            try { await controller.vimeoPlayer.setVolume(1); } catch {}
            try { await controller.vimeoPlayer.play(); } catch {}
          }).catch(() => {});
        } catch {}
      } else {
        sendVimeoCommand(controller.iframe, "setLoop", false);
        sendVimeoCommand(controller.iframe, "setCurrentTime", 0);
        sendVimeoCommand(controller.iframe, "setMuted", false);
        sendVimeoCommand(controller.iframe, "setVolume", 1);
        sendVimeoCommand(controller.iframe, "play");
      }
      return;
    }

    if (controller.provider === "wistia" && controller.wistiaPlayer) {
      const player = controller.wistiaPlayer;
      try { player.currentTime = 0; } catch {}
      try { player.muted = false; } catch {}
      try { player.volume = 1; } catch {}
      try { player.playPauseControl = true; } catch {}
      try { player.playBarControl = true; } catch {}
      try { player.volumeControl = true; } catch {}
      try { player.fullscreenControl = true; } catch {}
      try { player.endVideoBehavior = "default"; } catch {}
      try { player.bigPlayButton = false; } catch {}
      try { player.controlsVisibleOnLoad = false; } catch {}
      try { player.releaseControls?.("ceads-interactive"); } catch {}
      try { player.play?.(); } catch {}
      // Ne jamais maintenir les contrôles Wistia affichés : ils réapparaissent
      // naturellement au tap puis se masquent de nouveau pendant la lecture.
      window.setTimeout(() => {
        try { player.releaseControls?.("ceads-interactive"); } catch {}
      }, 220);
      return;
    }

    if (controller.provider === "file" && controller.mediaElement) {
      const video = controller.mediaElement;
      try { video.currentTime = 0; } catch {}
      video.loop = false;
      video.muted = false;
      video.defaultMuted = false;
      video.volume = 1;
      video.controls = true;
      video.play().catch(() => {});
      return;
    }

    // Facebook garde exactement le même iframe afin d'éviter le flash/rechargement.
    // Son player natif devient cliquable immédiatement ; aucun remplacement de DOM.
  }

  async function retryInteractiveLoad(slot, slotId, url) {
    previewPromiseBySlot.delete(slotId);
    const old = controllerBySlot.get(slotId);
    if (old?.node) old.node.remove();
    controllerBySlot.delete(slotId);
    slot.classList.remove("is-previewing", "is-preview-ready", "is-player-ready", "is-playing");
    providerOrigins(url).forEach(addConnectionHint);
    const retry = await startMutedPreview(slot);
    if (retry) {
      retry.userIntent = true;
      if (retry.ready) promoteController(slot, retry);
      return true;
    }
    return false;
  }

  async function playInteractive(slot, event) {
    if (slot.classList.contains("is-playing")) return;
    event?.preventDefault();
    event?.stopPropagation();

    const slotId = slot.dataset.mediaSlot;
    const url = normalizeVideoUrl(videoUrls[slotId] || "");
    if (!url) {
      showVideoNotice(slot, `Ajoute le lien de cette vidéo dans index.html, bloc CEADS_VIDEO_URLS → ${slotId}`);
      return;
    }

    // Cas idéal : l'aperçu joue déjà. On transforme LE MÊME player en lecture normale.
    const readyController = controllerBySlot.get(slotId);
    if (readyController) {
      readyController.userIntent = true;
      if (readyController.failed) {
        const ok = await retryInteractiveLoad(slot, slotId, url);
        if (!ok) showVideoNotice(slot, "La vidéo n’a pas répondu. Appuie de nouveau sur Play pour réessayer.");
        return;
      }
      if (readyController.ready) promoteController(slot, readyController);
      return;
    }

    // Si le player est en cours de préparation, ne pas recréer une iframe concurrente.
    const pending = previewPromiseBySlot.get(slotId);
    if (pending) {
      pending.then(async (controller) => {
        if (!controller) {
          const ok = await retryInteractiveLoad(slot, slotId, url);
          if (!ok) showVideoNotice(slot, "La vidéo n’a pas répondu. Appuie de nouveau sur Play pour réessayer.");
          return;
        }
        controller.userIntent = true;
        if (controller.ready) promoteController(slot, controller);
      });
      return;
    }

    // Si l'utilisateur clique avant l'autoplay (connexion très lente / vidéo hors écran),
    // sa demande devient prioritaire. Un seul player est créé, puis conservé.
    const controller = await startMutedPreview(slot);
    if (controller) {
      controller.userIntent = true;
      if (controller.ready) promoteController(slot, controller);
      return;
    }

    if (["youtube", "vimeo", "wistia", "facebook", "file"].includes(detectProvider(url))) {
      const ok = await retryInteractiveLoad(slot, slotId, url);
      if (ok) return;
    }

    // URL externe inconnue : dernier recours inline, au clic seulement.
    if (detectProvider(url) === "external") {
      const wrap = document.createElement("div");
      wrap.className = "media-embed media-embed--active";
      wrap.appendChild(createIframe(url, slotId));
      slot.appendChild(wrap);
      slot.classList.add("is-playing");
      return;
    }

    showVideoNotice(slot, "Impossible de charger cette vidéo dans son cadre. Vérifie que le lien public autorise l’intégration.");
  }

  slots.forEach((slot) => {
    const button = slot.querySelector(".play-button");
    slot.style.cursor = "pointer";
    slot.setAttribute("role", "button");
    slot.setAttribute("tabindex", "0");
    slot.addEventListener("click", (event) => {
      if (slot.classList.contains("is-playing") && event.target.closest(".media-embed")) return;
      playInteractive(slot, event);
    });
    slot.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") playInteractive(slot, event);
    });
    button?.addEventListener("click", (event) => {
      event.stopPropagation();
      playInteractive(slot, event);
    });
  });

  // VSL : prioritaire, mais on laisse d'abord le texte/hero se peindre afin de ne pas
  // pénaliser le LCP. Sur réseau lent, le poster reste immédiatement disponible.
  const vslSlot = document.querySelector('[data-media-slot="vsl"]');
  if (vslSlot) {
    window.setTimeout(() => enqueuePreview(vslSlot, { priority: true }), verySlowNetwork ? 420 : slowNetwork ? 240 : 80);
  }

  // Préparation en avance : les lecteurs commencent à s'initialiser bien AVANT d'entrer
  // dans l'écran. Les posters restent instantanément visibles pendant cette préparation.
  const nonVslSlots = slots.filter((slot) => slot.dataset.mediaSlot !== "vsl");
  if ("IntersectionObserver" in window) {
    const previewObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        enqueuePreview(entry.target, { priority: true });
        observer.unobserve(entry.target);
      });
    }, { rootMargin: previewRootMargin, threshold: 0.001 });
    nonVslSlots.forEach((slot) => previewObserver.observe(slot));
  } else {
    nonVslSlots.forEach((slot, index) => window.setTimeout(() => enqueuePreview(slot), 600 + index * 220));
  }

  // Après le rendu initial, on prépare progressivement les premiers lecteurs hors écran.
  // On ne lance pas 10 flux vidéo à la fois : cela tuerait précisément les connexions lentes.
  const idlePrepare = () => {
    const count = verySlowNetwork ? 2 : slowNetwork ? 4 : 6;
    nonVslSlots.slice(0, count).forEach((slot, index) => {
      window.setTimeout(() => enqueuePreview(slot), index * (verySlowNetwork ? 900 : slowNetwork ? 520 : 260));
    });
  };
  if ("requestIdleCallback" in window) {
    requestIdleCallback(idlePrepare, { timeout: verySlowNetwork ? 2200 : 1200 });
  } else {
    window.setTimeout(idlePrepare, verySlowNetwork ? 1200 : 500);
  }

  // Les previews hors écran sont mises en pause : moins de data, moins de CPU/GPU,
  // et plus de bande passante pour la vidéo que l'utilisateur regarde vraiment.
  if ("IntersectionObserver" in window) {
    const playbackObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const slot = entry.target;
        if (slot.classList.contains("is-playing")) return;
        const controller = controllerBySlot.get(slot.dataset.mediaSlot);
        if (!controller?.ready) return;

        if (entry.isIntersecting) {
          if (controller.provider === "youtube") sendYouTubeCommand(controller.iframe, "playVideo");
          else if (controller.provider === "vimeo") {
            if (controller.vimeoPlayer) controller.vimeoPlayer.play().catch(() => {});
            else sendVimeoCommand(controller.iframe, "play");
          } else if (controller.provider === "wistia") {
            try { controller.wistiaPlayer?.play?.(); } catch {}
          } else if (controller.provider === "file") controller.mediaElement?.play().catch(() => {});
        } else {
          if (controller.provider === "youtube") sendYouTubeCommand(controller.iframe, "pauseVideo");
          else if (controller.provider === "vimeo") {
            if (controller.vimeoPlayer) controller.vimeoPlayer.pause().catch(() => {});
            else sendVimeoCommand(controller.iframe, "pause");
          } else if (controller.provider === "wistia") {
            try { controller.wistiaPlayer?.pause?.(); } catch {}
          } else if (controller.provider === "file") controller.mediaElement?.pause();
        }
      });
    }, { rootMargin: "180px 0px", threshold: 0.01 });
    slots.forEach((slot) => playbackObserver.observe(slot));
  }

  // Les liens vidéo se modifient directement dans index.html. Aucun configurateur externe n’est utilisé.

  // Purchase notification engine
  const toast = document.querySelector("[data-purchase-toast]");
  const notificationConfig = config.purchaseNotifications || {};
  const host = location.hostname;
  const isPrivateIPv4 = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
  const isLocalPreview = location.protocol === "file:" || ["localhost", "127.0.0.1", "::1"].includes(host) || isPrivateIPv4;
  let purchases = Array.isArray(notificationConfig.purchases) ? [...notificationConfig.purchases] : [];
  let usingSamplePurchases = false;
  const allowPublicSamples = Boolean(notificationConfig.showSamplesPublicly);
  if (!purchases.length && (isLocalPreview || allowPublicSamples) && Array.isArray(notificationConfig.samplePurchases)) {
    purchases = [...notificationConfig.samplePurchases];
    usingSamplePurchases = true;
  }
  let cursor = 0;

  function timeAgo(purchase) {
    if (purchase && Number.isFinite(Number(purchase.minutesAgo))) {
      const minutes = Math.max(0, Number(purchase.minutesAgo));
      if (minutes < 1) return "À l’instant";
      if (minutes < 60) return `Il y a ${Math.floor(minutes)} min`;
      if (minutes < 1440) return `Il y a ${Math.floor(minutes / 60)} h`;
      const days = Math.floor(minutes / 1440);
      return days === 1 ? "Il y a 1 jour" : `Il y a ${days} jours`;
    }
    const date = new Date(purchase?.purchasedAt);
    if (Number.isNaN(date.getTime())) return "Récemment";
    const diff = Math.max(0, Date.now() - date.getTime());
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "À l’instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days === 1) return "Il y a 1 jour";
    return `Il y a ${days} jours`;
  }

  function deterministicAvatar(name) {
    const palette = ["#175CFF", "#FF5A24", "#28C7FA", "#6C5CE7", "#00897B", "#E67E22", "#7C4DFF"];
    const value = [...String(name || "A")].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return palette[value % palette.length];
  }

  function renderPurchase(purchase) {
    if (!toast || !purchase) return;
    const name = String(purchase.name || "Acheteur").trim();
    const country = String(purchase.country || "").trim();
    const countryCode = String(purchase.countryCode || "").trim().toUpperCase();
    const flag = /^[A-Z]{2}$/.test(countryCode)
      ? [...countryCode].map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0))).join("")
      : "";
    const label = [name, country].filter(Boolean).join(", ") + (flag ? ` ${flag}` : "");
    const initial = name.charAt(0).toUpperCase() || "A";

    toast.querySelector("[data-purchase-initial]").textContent = initial;
    toast.querySelector("[data-purchase-initial]").style.background = deterministicAvatar(name);
    toast.querySelector("[data-purchase-name]").textContent = label;
    toast.querySelector("[data-purchase-action]").textContent = usingSamplePurchases
      ? (notificationConfig.sampleActionText || "exemple de notification d’inscription")
      : (notificationConfig.actionText || "vient juste de rejoindre la formation");
    toast.querySelector("[data-purchase-time]").textContent = timeAgo(purchase);
    const status = toast.querySelector("[data-purchase-status]");
    if (status) {
      if (usingSamplePurchases) {
        status.innerHTML = '<span class="purchase-toast__demo">DÉMO</span>';
        toast.classList.add("is-demo");
      } else {
        status.innerHTML = '<em>✓</em> Vérifié par CEADS';
        toast.classList.remove("is-demo");
      }
    }

    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    window.setTimeout(() => toast.classList.remove("is-visible"), Number(notificationConfig.visibleMs || 7500));
  }

  async function hydratePurchases() {
    const endpoint = String(notificationConfig.endpoint || "").trim();
    if (!endpoint) return;
    try {
      const response = await fetch(endpoint, { credentials: "same-origin", headers: { "Accept": "application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) { purchases = data; usingSamplePurchases = false; }
      else if (Array.isArray(data.purchases)) { purchases = data.purchases; usingSamplePurchases = false; }
    } catch (error) {
      console.warn("CEADS purchase notifications: impossible de charger l'endpoint.", error);
    }
  }

  async function startPurchaseNotifications() {
    if (!notificationConfig.enabled || !toast) return;
    await hydratePurchases();
    if (!purchases.length) return;

    const showNext = () => {
      const purchase = purchases[cursor % purchases.length];
      cursor += 1;
      renderPurchase(purchase);
    };

    window.setTimeout(showNext, 1600);
    window.setInterval(showNext, Math.max(10000, Number(notificationConfig.intervalMs || 30000)));
  }

  startPurchaseNotifications();
})();

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const revealTargets = document.querySelectorAll(".reveal");
if (revealTargets.length > 0) {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    revealTargets.forEach((target) => observer.observe(target));
  } else {
    // Fallback for older browsers where IntersectionObserver is unavailable.
    revealTargets.forEach((target) => target.classList.add("in-view"));
  }
}

const pubToggleBtn = document.getElementById("pub-toggle");
const extraPubItems = document.querySelectorAll(".pub-extra");
if (pubToggleBtn && extraPubItems.length > 0) {
  pubToggleBtn.addEventListener("click", () => {
    const expanded = pubToggleBtn.getAttribute("aria-expanded") === "true";
    extraPubItems.forEach((item) => item.classList.toggle("is-hidden", expanded));
    pubToggleBtn.setAttribute("aria-expanded", expanded ? "false" : "true");
    pubToggleBtn.textContent = expanded ? "더보기" : "접기";
  });
}

const pubModal = document.getElementById("pub-modal");
const pubModalTitle = document.getElementById("pub-modal-title");
const pubModalMeta = document.getElementById("pub-modal-meta");
const pubModalDesc = document.getElementById("pub-modal-desc");
const pubModalImage = document.getElementById("pub-modal-image");
const pubModalLink = document.getElementById("pub-modal-link");
const detailTriggers = document.querySelectorAll(".detail-trigger");
const imageProbeCache = new Map();
let pubModalRequestId = 0;

const probeImage = (src) => {
  if (!src) {
    return Promise.resolve(false);
  }
  if (imageProbeCache.has(src)) {
    return imageProbeCache.get(src);
  }

  const probePromise = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
  imageProbeCache.set(src, probePromise);
  return probePromise;
};

const uniqueStrings = (items) => [...new Set(items.filter(Boolean))];

const buildRepresentativeCandidates = (dataset) => {
  const { image = "", imageMain = "", imageBase = "" } = dataset;
  const candidates = [];

  if (imageMain) {
    candidates.push(imageMain);
  }

  if (imageBase) {
    ["png", "jpg", "jpeg", "webp"].forEach((ext) => {
      candidates.push(`${imageBase}_main.${ext}`);
    });
  }

  if (image) {
    const matched = image.match(/^(.*?)(?:_(?:\d+|main))?\.(png|jpg|jpeg|webp)$/i);
    if (matched) {
      const stem = matched[1];
      const currentExt = matched[2].toLowerCase();
      candidates.push(`${stem}_main.${currentExt}`);
      ["png", "jpg", "jpeg", "webp"].forEach((ext) => {
        if (ext !== currentExt) {
          candidates.push(`${stem}_main.${ext}`);
        }
      });
    }
    candidates.push(image);
  }

  return uniqueStrings(candidates);
};

const resolveRepresentativeImage = async (triggerEl) => {
  const candidates = buildRepresentativeCandidates(triggerEl.dataset);
  for (const src of candidates) {
    if (await probeImage(src)) {
      return src;
    }
  }
  return triggerEl.dataset.image || "";
};

const openPubModal = async (triggerEl) => {
  if (!pubModal || !pubModalTitle || !pubModalMeta || !pubModalDesc || !pubModalImage || !pubModalLink) {
    return;
  }

  const requestId = ++pubModalRequestId;

  const {
    title = "",
    meta = "",
    desc = "",
    url = "",
  } = triggerEl.dataset;

  const image = await resolveRepresentativeImage(triggerEl);
  if (requestId !== pubModalRequestId) {
    return;
  }

  pubModalTitle.textContent = title;
  pubModalMeta.textContent = meta;
  pubModalDesc.textContent = desc;
  pubModalImage.src = image;
  pubModalImage.alt = title || "관련 이미지";

  if (url) {
    pubModalLink.href = url;
    pubModalLink.textContent = "상세 링크";
    pubModalLink.style.display = "inline-flex";
  } else {
    pubModalLink.style.display = "none";
  }

  pubModal.classList.add("open");
  pubModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};

const closePubModal = () => {
  if (!pubModal || !pubModalImage) {
    return;
  }
  pubModal.classList.remove("open");
  pubModal.setAttribute("aria-hidden", "true");
  pubModalImage.src = "";
  document.body.classList.remove("modal-open");
};

if (detailTriggers.length > 0) {
  detailTriggers.forEach((trigger) => {
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPubModal(trigger);
      }
    });
  });
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest(".detail-trigger");
  if (!trigger) {
    return;
  }
  openPubModal(trigger);
});

if (pubModal) {
  pubModal.addEventListener("click", (event) => {
    const closeTarget = event.target.closest("[data-close-modal='true']");
    if (closeTarget) {
      closePubModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && pubModal && pubModal.classList.contains("open")) {
    closePubModal();
  }
});

const figureModal = document.getElementById("figure-modal");
const figureModalImage = document.getElementById("figure-modal-image");
const figureModalCaption = document.getElementById("figure-modal-caption");
const figureModalCounter = document.getElementById("figure-modal-counter");
const figurePrevBtn = document.getElementById("figure-prev");
const figureNextBtn = document.getElementById("figure-next");
const figureStage = document.getElementById("figure-stage");

let figureItems = [];
let figureIndex = 0;
let touchStartX = 0;

const renderFigureModal = () => {
  if (!figureModalImage || !figureModalCaption || !figureModalCounter || figureItems.length === 0) {
    return;
  }

  const current = figureItems[figureIndex];
  figureModalImage.src = current.src;
  figureModalImage.alt = current.alt || `프로젝트 이미지 ${figureIndex + 1}`;
  figureModalCaption.textContent = current.alt || "프로젝트 이미지";
  figureModalCounter.textContent = `${figureIndex + 1} / ${figureItems.length}`;

  const hasMultiple = figureItems.length > 1;
  if (figurePrevBtn) {
    figurePrevBtn.style.display = hasMultiple ? "inline-flex" : "none";
  }
  if (figureNextBtn) {
    figureNextBtn.style.display = hasMultiple ? "inline-flex" : "none";
  }
};

const moveFigure = (delta) => {
  if (figureItems.length === 0) {
    return;
  }
  figureIndex = (figureIndex + delta + figureItems.length) % figureItems.length;
  renderFigureModal();
};

const openFigureModal = (items, startIndex) => {
  if (!figureModal || !figureModalImage || items.length === 0) {
    return;
  }
  figureItems = items;
  figureIndex = startIndex;
  renderFigureModal();
  figureModal.classList.add("open");
  figureModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};

const closeFigureModal = () => {
  if (!figureModal || !figureModalImage) {
    return;
  }
  figureModal.classList.remove("open");
  figureModal.setAttribute("aria-hidden", "true");
  figureModalImage.src = "";
  document.body.classList.remove("modal-open");
};

if (figureModal) {
  document.querySelectorAll(".inline-figures").forEach((group) => {
    const links = Array.from(group.querySelectorAll("a[href]"));
    if (links.length === 0) {
      return;
    }

    const items = links.map((link) => {
      const img = link.querySelector("img");
      return {
        src: link.getAttribute("href") || "",
        alt: img ? img.alt : "",
      };
    });

    links.forEach((link, idx) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        openFigureModal(items, idx);
      });
    });
  });

  if (figurePrevBtn) {
    figurePrevBtn.addEventListener("click", () => moveFigure(-1));
  }

  if (figureNextBtn) {
    figureNextBtn.addEventListener("click", () => moveFigure(1));
  }

  figureModal.addEventListener("click", (event) => {
    const closeTarget = event.target.closest("[data-close-figure-modal='true']");
    if (closeTarget) {
      closeFigureModal();
    }
  });

  if (figureStage) {
    figureStage.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0].clientX;
    });

    figureStage.addEventListener("touchend", (event) => {
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) < 40) {
        return;
      }
      moveFigure(deltaX > 0 ? -1 : 1);
    });
  }
}

document.addEventListener("keydown", (event) => {
  if (!figureModal || !figureModal.classList.contains("open")) {
    return;
  }

  if (event.key === "Escape") {
    closeFigureModal();
    return;
  }

  if (event.key === "ArrowLeft") {
    moveFigure(-1);
    return;
  }

  if (event.key === "ArrowRight") {
    moveFigure(1);
  }
});

const scrollToHashTargetTop = () => {
  if (!window.location.hash) {
    return;
  }

  let target;
  try {
    target = document.querySelector(window.location.hash);
  } catch {
    return;
  }

  if (!target) {
    return;
  }

  const header = document.querySelector(".site-header");
  const headerOffset = header ? Math.max(0, header.getBoundingClientRect().height + 4) : 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
};

const alignHashWithRetries = () => {
  if (!window.location.hash) {
    return;
  }

  scrollToHashTargetTop();
  [80, 220, 420, 800].forEach((delay) => {
    window.setTimeout(scrollToHashTargetTop, delay);
  });
};

if (window.location.hash) {
  requestAnimationFrame(alignHashWithRetries);
}

window.addEventListener("load", alignHashWithRetries);
window.addEventListener("pageshow", alignHashWithRetries);
window.addEventListener("hashchange", () => {
  requestAnimationFrame(alignHashWithRetries);
});

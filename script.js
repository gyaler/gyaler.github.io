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

const openPubModal = (triggerEl) => {
  if (!pubModal || !pubModalTitle || !pubModalMeta || !pubModalDesc || !pubModalImage || !pubModalLink) {
    return;
  }

  const {
    title = "",
    meta = "",
    desc = "",
    image = "",
    url = "",
  } = triggerEl.dataset;

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

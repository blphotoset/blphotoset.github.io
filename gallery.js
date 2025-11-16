// MODE TOGGLE --------------------------------------------------
const toggle = document.getElementById("mode-toggle");
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
});


// FILTERS -------------------------------------------------------
const filterBtns = document.querySelectorAll(".filter-btn");
const photos = document.querySelectorAll(".photo");

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const cat = btn.dataset.category;

    photos.forEach(photo => {
      if (cat === "all" || photo.dataset.category === cat) {
        photo.style.display = "block";
      } else {
        photo.style.display = "none";
      }
    });
  });
});


// LIGHTBOX ------------------------------------------------------
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

photos.forEach(photo => {
  photo.addEventListener("click", () => {
    const src = photo.querySelector("img").src;
    lightboxImg.src = src;
    lightbox.style.display = "flex";
  });
});

lightbox.addEventListener("click", () => {
  lightbox.style.display = "none";
});
// Show pill header only after scrolling past hero
const header = document.querySelector('.glass-header');
const hero = document.querySelector('.hero');

function updateHeaderVisibility() {
  if (!header || !hero) return;
  const rect = hero.getBoundingClientRect();

  // when bottom of hero is above top of viewport → show pill
  if (rect.bottom <= 0) {
    header.classList.add('visible');
  } else {
    header.classList.remove('visible');
  }
}

window.addEventListener('scroll', updateHeaderVisibility);
window.addEventListener('load', updateHeaderVisibility);


// SCROLL ANIMATIONS ----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const scrollElems = document.querySelectorAll(".scroll-fade");

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  scrollElems.forEach(el => observer.observe(el));
});


// CONTACT FORM SUBMIT (AJAX to Formspree) -------------------
const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const status = document.createElement("p");
    status.style.marginTop = "10px";
    status.style.fontSize = "0.9rem";
    status.style.opacity = "0.8";

    // remove old status if any
    const oldStatus = contactForm.querySelector(".form-status");
    if (oldStatus) oldStatus.remove();
    status.classList.add("form-status");
    contactForm.appendChild(status);

    try {
      const formData = new FormData(contactForm);
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (response.ok) {
        status.textContent = "Thanks! I’ll get back to you soon.";
        contactForm.reset();
      } else {
        status.textContent = "Something went wrong. You can also reach me directly via email.";
      }
    } catch (err) {
      status.textContent = "Network error. Please try again later.";
    }
  });
}

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

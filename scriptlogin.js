document.addEventListener('DOMContentLoaded', function() {
    const next = document.querySelector(".next");
    const prev = document.querySelector(".prev");
    const items = document.querySelectorAll(".item");
  
    next.addEventListener("click", function() {
      document.querySelector(".slide").appendChild(items[0]);
    });
  
    prev.addEventListener("click", function() {
      document.querySelector(".slide").prepend(items[items.length - 1]);
    });
  });
  
const { JSDOM } = require("jsdom");

// Simulasi HTML
const dom = new JSDOM(`
    <div class="container">
        <div class="slide">
            <div class="item">Item 1</div>
            <div class="item">Item 2</div>
            <div class="item">Item 3</div>
        </div>
        <div class="button">
            <button class="prev">Prev</button>
            <button class="next">Next</button>
        </div>
    </div>
`);

const document = dom.window.document;

let next = document.querySelector(".next");
let prev = document.querySelector(".prev");

next.addEventListener("click", function () {
  let items = document.querySelectorAll(".item");
  document.querySelector(".slide").appendChild(items[0]);
});

prev.addEventListener("click", function () {
  let items = document.querySelectorAll(".item");
  document.querySelector(".slide").prepend(items[items.length - 1]);
});

// Simulasi klik tombol
next.click();
console.log(dom.window.document.querySelector(".slide").innerHTML);

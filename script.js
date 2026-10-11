const starterBooks = [
  { title: "The Midnight Library", author: "Matt Haig", category: "Fiction", price: 18.99, stock: 24, reorder: 10 },
  { title: "Atomic Habits", author: "James Clear", category: "Business", price: 21.5, stock: 7, reorder: 10 },
  { title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", category: "Fiction", price: 19.99, stock: 15, reorder: 8 },
  { title: "The Creative Act", author: "Rick Rubin", category: "Non-fiction", price: 24, stock: 3, reorder: 8 },
  { title: "A Child of Books", author: "Oliver Jeffers", category: "Children", price: 14.95, stock: 31, reorder: 10 }
];
let books = JSON.parse(localStorage.getItem("bookshop-books") || "null") || starterBooks;
let cart = [];
let queries = [
  { name: "Maya Thompson", question: "Do you have The Creative Act in hardcover?", time: "8 min ago", status: "Open" },
  { name: "Arjun Patel", question: "Can I reserve two copies of Atomic Habits?", time: "42 min ago", status: "Open" },
  { name: "Sofia Williams", question: "Looking for children’s books about space.", time: "Yesterday", status: "Resolved" }
];
let activities = ["Sale #1048 completed · $64.50", "3 copies of The Creative Act flagged low", "Query from Maya Thompson received", "Spring reading collection updated"];
const accounts = {
  Manager: { email: "manager@bookshop.com", password: "manager123", views: ["dashboard", "inventory", "sales", "queries", "production", "statistics"] },
  Cashier: { email: "cashier@bookshop.com", password: "cashier123", views: ["dashboard", "inventory", "sales", "queries"] },
  Customer: { email: "customer@bookshop.com", password: "customer123", views: ["dashboard", "queries"] }
};
const $ = (selector) => document.querySelector(selector);
const money = (value) => `$${value.toFixed(2)}`;
function save() { localStorage.setItem("bookshop-books", JSON.stringify(books)); }
function toast(message) { const el = $("#toast"); el.textContent = message; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 2200); }

$("#login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const role = $("#login-role").value;
  const account = accounts[role];
  const email = $("#login-email").value.trim().toLowerCase();
  const password = $("#login-password").value;
  if (email !== account.email || password !== account.password) {
    $("#login-error").hidden = false;
    return;
  }
  $("#login-error").hidden = true;
  $("#login-screen").hidden = true; $("#app-shell").hidden = false;
  $("#user-name").textContent = role; $("#user-email").textContent = $("#login-email").value;
  $("#user-avatar").textContent = role[0];
  document.querySelectorAll(".nav-item[data-view]").forEach((button) => {
    button.hidden = !account.views.includes(button.dataset.view);
  });
  showView("dashboard");
  toast(`Signed in as ${role}`);
});
$("#logout").addEventListener("click", () => { $("#app-shell").hidden = true; $("#login-screen").hidden = false; });

const views = { dashboard: "Overview", inventory: "Inventory management", sales: "Sales & billing", queries: "Customer queries", production: "Production management", statistics: "Sales statistics" };
function showView(name) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === `${name}-view`));
  document.querySelectorAll(".nav-item[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === name));
  $("#page-kicker").textContent = views[name]; $("#page-title").innerHTML = name === "dashboard" ? "Good morning, <em>bookseller.</em>" : views[name];
}
$("#app-nav").addEventListener("click", (event) => { const button = event.target.closest("[data-view]"); if (button) showView(button.dataset.view); });
document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.go)));
$("#theme-button").addEventListener("click", () => { document.body.classList.toggle("dark"); localStorage.setItem("bookshop-theme", document.body.classList.contains("dark") ? "dark" : "light"); });
if (localStorage.getItem("bookshop-theme") === "dark") document.body.classList.add("dark");

function renderMetrics() {
  $("#metric-books").textContent = books.length;
  $("#metric-value").textContent = `$${Math.round(books.reduce((sum, book) => sum + book.price * book.stock, 0)).toLocaleString()}`;
  $("#metric-queries").textContent = queries.filter((query) => query.status === "Open").length;
  $("#attention-list").innerHTML = books.filter((book) => book.stock <= book.reorder).map((book) => `<div class="attention-row"><span class="book-dot">▤</span><div><b>${book.title}</b><small>${book.stock} copies left · reorder at ${book.reorder}</small></div><button class="stock-action" data-restock="${books.indexOf(book)}">+ 1</button></div>`).join("") || `<p class="muted">All shelves are healthy.</p>`;
  $("#activity-list").innerHTML = activities.slice(0, 4).map((activity, index) => `<div class="activity-row"><span>${["✓", "!", "?", "◈"][index]}</span><p>${activity}<small>${index + 1} hour${index ? "s" : ""} ago</small></p></div>`).join("");
}
function renderInventory() {
  const query = ($("#inventory-search").value || "").toLowerCase();
  const filter = $("#inventory-filter").value;
  const visible = books.filter((book) => (`${book.title} ${book.author}`).toLowerCase().includes(query)).filter((book) => filter === "all" || (filter === "low" ? book.stock <= book.reorder : book.stock > book.reorder));
  $("#inventory-table").innerHTML = visible.map((book) => `<tr><td><b>${book.title}</b><small>${book.author}</small></td><td>${book.category}</td><td>${money(book.price)}</td><td><span class="stock ${book.stock <= book.reorder ? "low" : ""}">${book.stock} copies</span></td><td>${book.reorder} copies</td><td><button class="stock-action" data-restock="${books.indexOf(book)}">Receive +1</button></td></tr>`).join("");
  $("#inventory-empty").hidden = visible.length > 0;
}
function renderSaleBooks() { $("#sale-books").innerHTML = books.map((book, index) => `<button class="sale-book" data-add-cart="${index}"><span class="mini-cover">${book.title[0]}</span><span><b>${book.title}</b><small>${money(book.price)} · ${book.stock} left</small></span><strong>＋</strong></button>`).join(""); }
function renderCart() {
  $("#cart-items").innerHTML = cart.length ? cart.map((item, index) => `<div class="cart-row"><div><b>${item.title}</b><small>${money(item.price)} each</small></div><span><button data-cart-minus="${index}">−</button> ${item.quantity} <button data-cart-plus="${index}">＋</button></span></div>`).join("") : `<p class="empty">Your cart is empty. Add a book to start a sale.</p>`;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal * (Number($("#discount").value) || 0) / 100;
  $("#subtotal").textContent = money(subtotal - discount); $("#tax").textContent = money((subtotal - discount) * .05); $("#total").textContent = money((subtotal - discount) * 1.05);
}
function renderQueries() { $("#query-list").innerHTML = queries.map((query, index) => `<article class="query-card"><div class="query-top"><span class="avatar">${query.name[0]}</span><div><b>${query.name}</b><small>${query.time}</small></div><span class="status ${query.status === "Open" ? "pending" : "resolved"}">${query.status}</span></div><p>${query.question}</p><button class="text-button" data-resolve="${index}">${query.status === "Open" ? "Mark resolved →" : "View query →"}</button></article>`).join(""); }

document.addEventListener("click", (event) => {
  const restock = event.target.closest("[data-restock]");
  if (restock) { books[Number(restock.dataset.restock)].stock += 1; save(); renderAll(); toast("Stock received and shelf updated"); }
  const add = event.target.closest("[data-add-cart]");
  if (add) { const book = books[Number(add.dataset.addCart)]; if (book.stock <= 0) return toast("This title is out of stock"); const existing = cart.find((item) => item.title === book.title); if (existing) existing.quantity += 1; else cart.push({ ...book, quantity: 1 }); renderCart(); toast(`${book.title} added to cart`); }
  const plus = event.target.closest("[data-cart-plus]"); if (plus) { cart[Number(plus.dataset.cartPlus)].quantity += 1; renderCart(); }
  const minus = event.target.closest("[data-cart-minus]"); if (minus) { const item = cart[Number(minus.dataset.cartMinus)]; item.quantity -= 1; if (!item.quantity) cart.splice(Number(minus.dataset.cartMinus), 1); renderCart(); }
  const resolve = event.target.closest("[data-resolve]"); if (resolve) { queries[Number(resolve.dataset.resolve)].status = "Resolved"; renderQueries(); renderMetrics(); toast("Query marked as resolved"); }
});
$("#inventory-search").addEventListener("input", renderInventory); $("#inventory-filter").addEventListener("change", renderInventory); $("#discount").addEventListener("input", renderCart); $("#clear-cart").addEventListener("click", () => { cart = []; renderCart(); });
$("#complete-sale").addEventListener("click", () => { if (!cart.length) return toast("Add a book to the cart first"); cart.forEach((item) => { books.find((book) => book.title === item.title).stock -= item.quantity; }); save(); activities.unshift(`Sale #${1049 + Math.floor(Math.random() * 40)} completed · ${$("#total").textContent}`); cart = []; renderAll(); renderCart(); toast("Sale complete · Bill generated"); });
function openBookModal() { $("#book-modal").showModal(); } $("#add-book").addEventListener("click", openBookModal); $("#quick-add").addEventListener("click", openBookModal); $(".close-modal").addEventListener("click", () => $("#book-modal").close());
$("#book-form").addEventListener("submit", (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); books.unshift({ title: data.get("title"), author: data.get("author"), price: Number(data.get("price")), stock: Number(data.get("stock")), reorder: 10, category: data.get("category") }); save(); event.currentTarget.reset(); $("#book-modal").close(); renderAll(); toast("Book added to catalog"); });
$("#new-query").addEventListener("click", () => { const name = prompt("Customer name:"); if (!name) return; queries.unshift({ name, question: "New customer query — follow up with the customer.", time: "Just now", status: "Open" }); renderQueries(); renderMetrics(); toast("New query created"); });
$("#receive-order").addEventListener("click", () => toast("Stock received · inventory updated"));
function renderAll() { renderMetrics(); renderInventory(); renderSaleBooks(); renderQueries(); }
renderAll();

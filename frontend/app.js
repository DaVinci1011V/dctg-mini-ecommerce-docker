const API = ""; // same origin (served by Express)
let state = { page: 1, limit: 10, category: "", inStock: "" };
let token = null;

// ---- auth (bonus) ----
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("authStatus");

loginBtn.onclick = async () => {
  const r = await fetch(`${API}/login`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ username:"admin", password:"admin123" })
  });
  if (r.ok) {
    const data = await r.json();
    token = data.token;
    authStatus.textContent = "Logged in ✔";
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    alert("Logged in as admin");
  } else alert("Login failed");
};
logoutBtn.onclick = () => {
  token = null;
  authStatus.textContent = "Not logged in";
  loginBtn.style.display = "inline-block";
  logoutBtn.style.display = "none";
};

// ---- list ----
async function loadProducts() {
  const params = new URLSearchParams();
  params.set("page", state.page);
  params.set("limit", state.limit);
  if (state.category) params.set("category", state.category);
  if (state.inStock !== "") params.set("inStock", state.inStock);

  const r = await fetch(`${API}/products?` + params.toString());
  const { data, page, limit, total } = await r.json();

  const list = document.getElementById("products");
  list.innerHTML = "";
  data.forEach(p => {
    const el = document.createElement("div");
    el.className = "product";
    el.innerHTML = `
      <h3>${p.name}</h3>
      <div>💰 ${p.price}</div>
      <div>🏷️ ${p.category}</div>
      <div>📦 ${p.inStock ? "In stock" : "Out of stock"}</div>
      <div>🗓 ${new Date(p.createdAt).toLocaleString()}</div>
    `;
    list.appendChild(el);
  });

  const pageInfo = document.getElementById("pageInfo");
  const pages = Math.max(1, Math.ceil(total / limit));
  pageInfo.textContent = `Page ${page} of ${pages}`;
  document.getElementById("prevPage").disabled = page <= 1;
  document.getElementById("nextPage").disabled = page >= pages;
}
document.getElementById("prevPage").onclick = () => { state.page--; loadProducts(); }
document.getElementById("nextPage").onclick = () => { state.page++; loadProducts(); }

// ---- filters ----
document.getElementById("applyFilters").onclick = () => {
  state.category = document.getElementById("filterCategory").value.trim();
  state.inStock = document.getElementById("filterStock").value;
  state.limit = Number(document.getElementById("limit").value);
  state.page = 1;
  loadProducts();
};
document.getElementById("clearFilters").onclick = () => {
  document.getElementById("filterCategory").value = "";
  document.getElementById("filterStock").value = "";
  document.getElementById("limit").value = "10";
  state = { page:1, limit:10, category:"", inStock:"" };
  loadProducts();
};

// ---- create ----
document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {
    name: document.getElementById("name").value.trim(),
    price: Number(document.getElementById("price").value),
    category: document.getElementById("category").value.trim(),
    inStock: document.getElementById("instock").value === "true"
  };
  const r = await fetch(`${API}/products`, {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      ...(token ? { Authorization:`Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  if (r.status === 201) {
    alert("Product added");
    e.target.reset();
    loadProducts();
  } else if (r.status === 401) {
    alert("Unauthorized. Click 'Login as admin' first.");
  } else {
    const err = await r.json().catch(()=>({}));
    alert("Error: " + (err.details || r.status));
  }
});

// initial load

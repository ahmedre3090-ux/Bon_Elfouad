let db = JSON.parse(localStorage.getItem('alfouad_data')) || {
    items: [
        { id: 1, name: "قهوة تركي مخصوص", price: 40, cat: "ساخن" },
        { id: 2, name: "آيس شيكن لاتيه", price: 65, cat: "بارد" }
    ]
};

let orders = JSON.parse(localStorage.getItem('alfouad_orders')) || [];
let cart = [];
let currentCategory = "الكل";

window.onload = () => { renderMenu(); updateBadge(); };

// --- وظائف العميل ---
function renderMenu(itemsToRender = db.items) {
    const grid = document.getElementById('menuGrid');
    grid.innerHTML = "";
    itemsToRender.filter(i => currentCategory === "الكل" || i.cat === currentCategory).forEach(item => {
        grid.innerHTML += `
            <div class="item-card">
                <h4>${item.name}</h4>
                <span style="color:#c5a059">${item.price} ج.م</span><br>
                <button class="add-item-btn" onclick="addToCart('${item.name}', ${item.price})">إضافة +</button>
            </div>
        `;
    });
}

function addToCart(name, price) {
    cart.push({ name, price });
    updateCartUI();
}

function updateCartUI() {
    const bar = document.getElementById('cartBar');
    if (cart.length > 0) {
        bar.classList.remove('hidden');
        let total = cart.reduce((sum, item) => sum + item.price, 0);
        document.getElementById('cartQty').innerText = `${cart.length} طلبات`;
        document.getElementById('cartTotal').innerText = `${total} ج.م`;
    } else { bar.classList.add('hidden'); }
}

function submitOrder() {
    const table = document.getElementById('tableInput').value;
    if (!table) return alert("دخل رقم الطاولة الأول!");

    const order = {
        id: Date.now(),
        table: table,
        items: cart.map(i => i.name).join(' + '),
        time: new Date().toLocaleTimeString('ar-EG')
    };

    orders.push(order);
    localStorage.setItem('alfouad_orders', JSON.stringify(orders));

    // تشغيل التنبيه
    document.getElementById('notificationSound').play().catch(() => {});

    alert(`✅ طلبك في الطريق لطاولة ${table}`);
    cart = [];
    document.getElementById('tableInput').value = "";
    closeModal('tableModal');
    updateCartUI();
    updateBadge();
}

// --- وظائف الإدارة ---
function openModal(id) { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

function login() {
    if (document.getElementById('userInput').value === "admin" && document.getElementById('passInput').value === "123") {
        closeModal('loginModal');
        document.getElementById('adminNav').classList.remove('hidden');
    } else { alert("خطأ!"); }
}

function openPanel(id) {
    document.getElementById(id).classList.remove('hidden');
    if (id === 'ordersPanel') renderOrders();
    if (id === 'settingsPanel') renderManager();
}

function renderOrders() {
    const cont = document.getElementById('ordersContent');
    cont.innerHTML = orders.length === 0 ? "لا توجد طلبات" : "";
    orders.forEach(o => {
        cont.innerHTML += `
            <div class="order-row">
                <b>طاولة ${o.table}</b> [${o.time}]<br>
                <span>الطلبات: ${o.items}</span><br>
                <button onclick="finishOrder(${o.id})" style="background:#27ae60; color:white; border:none; padding:5px; border-radius:5px; margin-top:10px;">تم التنفيذ ✓</button>
            </div>
        `;
    });
}

function finishOrder(id) {
    orders = orders.filter(o => o.id !== id);
    localStorage.setItem('alfouad_orders', JSON.stringify(orders));
    renderOrders();
    updateBadge();
}

function updateBadge() {
    const b = document.getElementById('badge');
    b.innerText = orders.length;
    b.style.display = orders.length > 0 ? "inline-block" : "none";
}

function addItem() {
    const n = document.getElementById('newName').value;
    const p = document.getElementById('newPrice').value;
    const c = document.getElementById('newCat').value;
    if (!n || !p) return;
    db.items.push({ id: Date.now(), name: n, price: parseInt(p), cat: c });
    localStorage.setItem('alfouad_data', JSON.stringify(db));
    renderMenu(); renderManager();
}

function renderManager() {
    const list = document.getElementById('managerList');
    list.innerHTML = "<h4>الأصناف الحالية (اضغط للحذف):</h4>";
    db.items.forEach(i => {
        list.innerHTML += `<button onclick="deleteItem(${i.id})">${i.name} ×</button> `;
    });
}

function deleteItem(id) {
    db.items = db.items.filter(i => i.id !== id);
    localStorage.setItem('alfouad_data', JSON.stringify(db));
    renderMenu(); renderManager();
}

// بحث وفلترة
function searchItems() {
    const txt = document.getElementById('searchInput').value.toLowerCase();
    const filtered = db.items.filter(i => i.name.toLowerCase().includes(txt));
    renderMenu(filtered);
}

function filterCat(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderMenu();
}

function closePanel(id) { document.getElementById(id).classList.add('hidden'); }
function logout() { location.reload(); }






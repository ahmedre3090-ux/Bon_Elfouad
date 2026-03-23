// تحميل البيانات أو وضع قيم افتراضية
let db = JSON.parse(localStorage.getItem('alfouad_data')) || {
    categories: ["الكل", "ساخن", "بارد"],
    items: [
        { id: 1, name: "قهوة تركي مخصوص", price: 40, cat: "ساخن" },
        { id: 2, name: "آيس شيكن لاتيه", price: 65, cat: "بارد" }
    ]
};

let orders = JSON.parse(localStorage.getItem('alfouad_orders')) || [];
let cart = [];
let currentCategory = "الكل";

window.onload = () => {
    refreshUI();
};

// تحديث الواجهة بالكامل
function refreshUI() {
    renderCategories();
    renderMenu();
    updateBadge();
}

// رندر الأقسام في الصفحة الرئيسية
function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = "";
    db.categories.forEach(cat => {
        const isActive = currentCategory === cat ? 'active' : '';
        container.innerHTML += `<button class="cat-btn ${isActive}" onclick="filterCat('${cat}')">${cat}</button>`;
    });
}

// فلترة حسب القسم
function filterCat(cat) {
    currentCategory = cat;
    refreshUI();
}

// عرض المنيو
function renderMenu(itemsToRender = db.items) {
    const grid = document.getElementById('menuGrid');
    grid.innerHTML = "";
    const filtered = itemsToRender.filter(i => currentCategory === "الكل" || i.cat === currentCategory);
    
    filtered.forEach(item => {
        grid.innerHTML += `
            <div class="item-card">
                <h4>${item.name}</h4>
                <span style="color:#c5a059">${item.price} ج.م</span><br>
                <button class="add-item-btn" onclick="addToCart('${item.name}', ${item.price})">إضافة +</button>
            </div>
        `;
    });
}

// --- وظائف الإدارة ---

function addCategory() {
    const name = document.getElementById('newCatName').value.trim();
    if (!name || db.categories.includes(name)) return alert("اسم القسم فارغ أو موجود مسبقاً!");
    
    db.categories.push(name);
    saveData();
    document.getElementById('newCatName').value = "";
    renderManager();
    renderCategories();
}

function deleteCategory(catName) {
    if (catName === "الكل") return alert("لا يمكن حذف قسم 'الكل'");
    if (confirm(`هل أنت متأكد؟ سيتم حذف قسم ${catName} وستبقى الأصناف التابعة له بدون قسم.`)) {
        db.categories = db.categories.filter(c => c !== catName);
        saveData();
        renderManager();
        refreshUI();
    }
}

function addItem() {
    const n = document.getElementById('newName').value;
    const p = document.getElementById('newPrice').value;
    const c = document.getElementById('newCatSelect').value;
    if (!n || !p) return alert("اكمل البيانات!");

    db.items.push({ id: Date.now(), name: n, price: parseInt(p), cat: c });
    saveData();
    renderMenu();
    renderManager();
    document.getElementById('newName').value = "";
    document.getElementById('newPrice').value = "";
}

function deleteItem(id) {
    db.items = db.items.filter(i => i.id !== id);
    saveData();
    renderMenu();
    renderManager();
}

function renderManager() {
    // قائمة الأقسام في الإدارة
    const catList = document.getElementById('adminCatList');
    catList.innerHTML = "";
    db.categories.forEach(c => {
        catList.innerHTML += `<button class="del-item" onclick="deleteCategory('${c}')">${c} ×</button>`;
    });

    // تحديث قائمة الاختيار (Select)
    const select = document.getElementById('newCatSelect');
    select.innerHTML = "";
    db.categories.filter(c => c !== "الكل").forEach(c => {
        select.innerHTML += `<option value="${c}">${c}</option>`;
    });

    // قائمة الأصناف
    const itemList = document.getElementById('managerList');
    itemList.innerHTML = "<h4>الأصناف الحالية:</h4>";
    db.items.forEach(i => {
        itemList.innerHTML += `<button class="del-item" onclick="deleteItem(${i.id})">${i.name} (${i.cat}) ×</button>`;
    });
}

function saveData() {
    localStorage.setItem('alfouad_data', JSON.stringify(db));
}

// باقي الوظائف (السلة، الطلبات، الخروج) تبقى كما هي في الكود الأصلي...
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
    const order = { id: Date.now(), table: table, items: cart.map(i => i.name).join(' + '), time: new Date().toLocaleTimeString('ar-EG') };
    orders.push(order);
    localStorage.setItem('alfouad_orders', JSON.stringify(orders));
    document.getElementById('notificationSound').play().catch(() => {});
    alert(`✅ طلبك في الطريق لطاولة ${table}`);
    cart = [];
    document.getElementById('tableInput').value = "";
    closeModal('tableModal');
    updateCartUI();
    updateBadge();
}

function login() {
    if (document.getElementById('userInput').value === "admin" && document.getElementById('passInput').value === "123") {
        closeModal('loginModal');
        document.getElementById('adminNav').classList.remove('hidden');
    } else { alert("خطأ!"); }
}

function openModal(id) { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }
function openPanel(id) {
    document.getElementById(id).classList.remove('hidden');
    if (id === 'settingsPanel') renderManager();
    if (id === 'ordersPanel') renderOrders();
}
function closePanel(id) { document.getElementById(id).classList.add('hidden'); }

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
    if(b) {
        b.innerText = orders.length;
        b.style.display = orders.length > 0 ? "inline-block" : "none";
    }
}

function searchItems() {
    const txt = document.getElementById('searchInput').value.toLowerCase();
    const filtered = db.items.filter(i => i.name.toLowerCase().includes(txt));
    renderMenu(filtered);
}

function logout() { location.reload(); }

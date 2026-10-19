// ================= MOBILE NAVIGATION =================
const menuOpenButton = document.querySelector("#menu-open-button");
const menuCloseButton = document.querySelector("#menu-close-button");
const navLinks = document.querySelectorAll(".nav-link");

if (menuOpenButton) {
    menuOpenButton.addEventListener("click", () => {
        document.body.classList.add("show-mobile-menu");
    });
}

if (menuCloseButton) {
    menuCloseButton.addEventListener("click", () => {
        document.body.classList.remove("show-mobile-menu");
    });
}

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        document.body.classList.remove("show-mobile-menu");
    });
});

// ================= NAVBAR SCROLL EFFECT =================
const header = document.querySelector("header");
window.addEventListener("scroll", () => {
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }
});

// ================= BACK TO TOP BUTTON =================
const backToTopButton = document.querySelector("#back-to-top");
if (backToTopButton) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
            backToTopButton.classList.add("show");
        } else {
            backToTopButton.classList.remove("show");
        }
    });

    backToTopButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

// ================= API & DATA CONFIGURATION =================
const API_BASE = 'http://127.0.0.1:8000/api';

function formatImageUrl(image, category) {
    if (image) {
        if (image.startsWith('http')) return image;
        return `http://127.0.0.1:8000${image}`;
    }
    if (category === 'coffee') return 'images/hot-beverages.png';
    if (category === 'drinks') return 'images/cold-beverages.png';
    if (category === 'dessert') return 'images/desserts.png';
    return 'images/special-combo.png';
}

const categoryTitles = {
    all: "All Items",
    coffee: "Hot Coffee",
    drinks: "Cold Beverages",
    food: "Food & Bites",
    dessert: "Desserts & Bakery"
};

// ================= STATE & DOM ELEMENTS =================
let allMenuItems = [];
let currentCategory = "all";
let currentSearch = "";

const fullMenuGrid = document.querySelector("#full-menu-grid");
const filterButtons = document.querySelectorAll(".menu-page-filters .filter-btn");
const searchInput = document.querySelector("#menu-search-input");
const searchClearBtn = document.querySelector("#search-clear-btn");
const dishCountElement = document.querySelector("#dish-count");
const activeCategoryLabel = document.querySelector("#active-category-label");
const noDishesMsg = document.querySelector("#no-dishes-msg");
const resetSearchBtn = document.querySelector("#reset-search-btn");

// Category badge elements
const countAll = document.querySelector("#count-all");
const countCoffee = document.querySelector("#count-coffee");
const countDrinks = document.querySelector("#count-drinks");
const countFood = document.querySelector("#count-food");
const countDessert = document.querySelector("#count-dessert");

// ================= SHOPPING CART (LOCALSTORAGE SYNCED) =================
const orderCount = document.querySelector("#order-count");
const orderButton = document.querySelector("#order-button");
const cartPanel = document.querySelector("#cart-panel");
const cartClose = document.querySelector("#cart-close");
const cartItemsContainer = document.querySelector("#cart-items");
const cartTotalElement = document.querySelector("#cart-total");
const placeOrderButton = document.querySelector("#place-order-button");

let cart = JSON.parse(localStorage.getItem('cafe_cart') || '[]');

function saveCart() {
    localStorage.setItem('cafe_cart', JSON.stringify(cart));
}

function updateCart() {
    saveCart();
    if (!cartItemsContainer || !orderCount || !cartTotalElement) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;
    let itemCount = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemCount += item.quantity;

        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>₹${item.price} each</p>
                <div class="quantity-controls">
                    <button class="decrease-button" data-index="${index}">−</button>
                    <span>${item.quantity}</span>
                    <button class="increase-button" data-index="${index}">+</button>
                </div>
            </div>
            <strong class="cart-item-price">₹${itemTotal}</strong>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    orderCount.textContent = itemCount;
    cartTotalElement.textContent = `₹${total}`;

    // Attach event listeners for quantity buttons
    cartItemsContainer.querySelectorAll(".increase-button").forEach(button => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.index);
            cart[index].quantity++;
            updateCart();
        });
    });

    cartItemsContainer.querySelectorAll(".decrease-button").forEach(button => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.index);
            cart[index].quantity--;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            updateCart();
        });
    });
}

function addItemToCart(dishName, dishPrice, buttonEl) {
    const existingItem = cart.find(item => item.name === dishName);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            name: dishName,
            price: Number(dishPrice),
            quantity: 1
        });
    }

    updateCart();

    if (buttonEl) {
        const originalContent = buttonEl.innerHTML;
        buttonEl.innerHTML = `Added <i class="fa-solid fa-check"></i>`;
        buttonEl.style.background = "var(--secondary-color)";
        buttonEl.style.color = "var(--primary-color)";

        setTimeout(() => {
            buttonEl.innerHTML = originalContent;
            buttonEl.style.background = "";
            buttonEl.style.color = "";
        }, 900);
    }
}

// ================= RENDER MENU ITEMS =================
function updateCategoryBadges() {
    if (countAll) countAll.textContent = allMenuItems.length;
    if (countCoffee) countCoffee.textContent = allMenuItems.filter(i => i.category === 'coffee').length;
    if (countDrinks) countDrinks.textContent = allMenuItems.filter(i => i.category === 'drinks').length;
    if (countFood) countFood.textContent = allMenuItems.filter(i => i.category === 'food').length;
    if (countDessert) countDessert.textContent = allMenuItems.filter(i => i.category === 'dessert').length;
}

function renderMenu() {
    if (!fullMenuGrid) return;

    const filtered = allMenuItems.filter(dish => {
        const matchesCategory = (currentCategory === "all" || dish.category === currentCategory);
        const nameMatch = dish.name ? dish.name.toLowerCase().includes(currentSearch) : false;
        const descMatch = dish.description ? dish.description.toLowerCase().includes(currentSearch) : false;
        const matchesSearch = !currentSearch || nameMatch || descMatch;
        return matchesCategory && matchesSearch;
    });

    if (dishCountElement) {
        dishCountElement.textContent = filtered.length;
    }

    if (activeCategoryLabel) {
        activeCategoryLabel.textContent = categoryTitles[currentCategory] || "Menu";
    }

    if (noDishesMsg) {
        noDishesMsg.style.display = (filtered.length === 0) ? "block" : "none";
    }

    fullMenuGrid.innerHTML = "";

    filtered.forEach(dish => {
        const card = document.createElement("div");
        card.className = "menu-card";
        card.dataset.category = dish.category;
        card.innerHTML = `
            <div class="menu-card-image">
                <img src="${formatImageUrl(dish.image, dish.category)}" alt="${dish.name}" loading="lazy">
                <span class="price">₹${Math.round(dish.price)}</span>
            </div>
            <div class="menu-card-content">
                <div class="menu-card-heading">
                    <h3>${dish.name}</h3>
                    <span class="rating">★ ${dish.rating || '5.0'}</span>
                </div>
                <p>${dish.description || ''}</p>
                <button class="add-button" data-name="${dish.name}" data-price="${Math.round(dish.price)}">
                    Add to Order
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
        `;
        fullMenuGrid.appendChild(card);
    });

    // Attach click listeners to all dynamically created Add buttons
    fullMenuGrid.querySelectorAll(".add-button").forEach(btn => {
        btn.addEventListener("click", () => {
            const name = btn.dataset.name;
            const price = btn.dataset.price;
            addItemToCart(name, price, btn);
        });
    });
}

// ================= LOAD MENU FROM DJANGO BACKEND =================
function loadFullMenu() {
    if (!fullMenuGrid) return;

    fullMenuGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #aaa;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--secondary-color); margin-bottom: 12px;"></i>
            <p style="font-size: 1rem; color: #fff;">Loading menu dishes...</p>
        </div>
    `;

    fetch(`${API_BASE}/menu/`)
        .then(res => res.json())
        .then(dishes => {
            allMenuItems = dishes || [];
            updateCategoryBadges();
            renderMenu();
        })
        .catch(err => {
            console.error("Error fetching menu from backend:", err);
            fullMenuGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #aaa;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; color: var(--secondary-color); margin-bottom: 10px;"></i>
                    <p style="font-size: 1rem; color: #fff;">Unable to load dishes from server.</p>
                    <p style="font-size: 0.85rem; color: #888;">Make sure the Django backend is running at ${API_BASE}.</p>
                </div>
            `;
        });
}

// ================= FILTER & SEARCH EVENT LISTENERS =================
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        currentCategory = button.dataset.filter || "all";
        renderMenu();
    });
});

if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        renderMenu();
    });
}

if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
        if (searchInput) {
            searchInput.value = "";
            currentSearch = "";
            searchInput.focus();
            renderMenu();
        }
    });
}

if (resetSearchBtn) {
    resetSearchBtn.addEventListener("click", () => {
        currentCategory = "all";
        currentSearch = "";
        if (searchInput) searchInput.value = "";
        filterButtons.forEach(btn => {
            if (btn.dataset.filter === "all") btn.classList.add("active");
            else btn.classList.remove("active");
        });
        renderMenu();
    });
}

// ================= CART DRAWER HANDLERS =================
if (orderButton && cartPanel) {
    orderButton.addEventListener("click", () => {
        cartPanel.classList.add("show");
    });
}

if (cartClose && cartPanel) {
    cartClose.addEventListener("click", () => {
        cartPanel.classList.remove("show");
    });
}

if (placeOrderButton && cartPanel) {
    placeOrderButton.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Your cart is empty. Please add items before placing an order.");
            return;
        }

        alert("🎉 Thank you! Your order has been placed successfully.");
        cart = [];
        updateCart();
        cartPanel.classList.remove("show");
    });
}

// ================= INITIALIZE =================
updateCart();
loadFullMenu();

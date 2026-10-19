const menuOpenButton = document.querySelector("#menu-open-button");
const menuCloseButton = document.querySelector("#menu-close-button");
const navLinks = document.querySelectorAll(".nav-link");

// Open mobile menu
menuOpenButton.addEventListener("click", () => {
    document.body.classList.add("show-mobile-menu");
});

// Close mobile menu
menuCloseButton.addEventListener("click", () => {
    document.body.classList.remove("show-mobile-menu");
});

// Close mobile menu when a link is clicked
navLinks.forEach(link => {
    link.addEventListener("click", () => {
        document.body.classList.remove("show-mobile-menu");
    });
});

// ================= MENU FILTER =================

const filterButtons = document.querySelectorAll(".filter-btn");
const menuCards = document.querySelectorAll(".menu-card");

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Remove active from all buttons
        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        // Add active to clicked button
        button.classList.add("active");


        // Get selected category
        const selectedCategory = button.dataset.filter;


        // Show/hide cards
        menuCards.forEach(card => {

            const cardCategory = card.dataset.category;

            if (
                selectedCategory === "all" ||
                selectedCategory === cardCategory
            ) {

                card.classList.remove("hide");

            } else {

                card.classList.add("hide");

            }

        });

    });

});

// ================= TESTIMONIAL SLIDER =================

const testimonialCards =
    document.querySelectorAll(".testimonial-card");

const sliderDots =
    document.querySelectorAll(".slider-dot");

const previousButton =
    document.querySelector("#prev-button");

const nextButton =
    document.querySelector("#next-button");

let currentTestimonial = 0;


// Show testimonial

function showTestimonial(index) {

    // Handle going beyond the last card

    if (index >= testimonialCards.length) {
        currentTestimonial = 0;
    }

    // Handle going before the first card

    else if (index < 0) {
        currentTestimonial =
            testimonialCards.length - 1;
    }

    else {
        currentTestimonial = index;
    }


    // Hide all cards

    testimonialCards.forEach(card => {
        card.classList.remove("active");
    });


    // Remove active from all dots

    sliderDots.forEach(dot => {
        dot.classList.remove("active");
    });


    // Show current card

    testimonialCards[currentTestimonial]
        .classList.add("active");


    // Activate current dot

    sliderDots[currentTestimonial]
        .classList.add("active");

}


// Previous button

previousButton.addEventListener("click", () => {

    showTestimonial(currentTestimonial - 1);

});


// Next button

nextButton.addEventListener("click", () => {

    showTestimonial(currentTestimonial + 1);

});


// Dot buttons

sliderDots.forEach(dot => {

    dot.addEventListener("click", () => {

        const slideNumber =
            Number(dot.dataset.slide);

        showTestimonial(slideNumber);

    });

});

// Automatic testimonial slider

setInterval(() => {

    showTestimonial(currentTestimonial + 1);

}, 5000);

// ================= GALLERY LIGHTBOX =================

const galleryItems =
    document.querySelectorAll(".gallery-item");


// Create lightbox

const lightbox = document.createElement("div");

lightbox.classList.add("lightbox");

lightbox.innerHTML = `
    <button class="lightbox-close">
        &times;
    </button>

    <img class="lightbox-image" src="" alt="">
`;

document.body.appendChild(lightbox);


// Get elements

const lightboxImage =
    lightbox.querySelector(".lightbox-image");

const lightboxClose =
    lightbox.querySelector(".lightbox-close");


// Open image

galleryItems.forEach(item => {

    item.addEventListener("click", () => {

        const image =
            item.querySelector("img");

        lightboxImage.src = image.src;

        lightboxImage.alt = image.alt;

        lightbox.classList.add("show");

        document.body.style.overflow = "hidden";

    });

});


// Close button

lightboxClose.addEventListener("click", () => {

    lightbox.classList.remove("show");

    document.body.style.overflow = "";

});


// Close when clicking outside image

lightbox.addEventListener("click", event => {

    if (event.target === lightbox) {

        lightbox.classList.remove("show");

        document.body.style.overflow = "";

    }

});


// Close with Escape key

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        lightbox.classList.remove("show");

        document.body.style.overflow = "";

    }

});

// Contact Form
const contactForm = document.querySelector("#contact-form");
const formMessage = document.querySelector("#form-message");

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    formMessage.textContent = "Thank you! Your message has been received.";
    formMessage.style.display = "block";
    formMessage.style.color = "green";

    contactForm.reset();

    setTimeout(() => {
        formMessage.style.display = "none";
    }, 4000);
});

// Back To Top Button
const backToTopButton = document.querySelector("#back-to-top");

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

// Scroll Reveal Animation
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    },
    {
        threshold: 0.15
    }
);

revealElements.forEach((element) => {
    revealObserver.observe(element);
});

// Navbar Scroll Effect
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

// ================= ORDER / CART FUNCTIONALITY =================

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

function bindAddButtons() {
    document.querySelectorAll(".add-button").forEach((button) => {
        if (button.dataset.bound) return;
        button.dataset.bound = "true";

        button.addEventListener("click", () => {
            const card = button.closest(".menu-card");
            if (!card) return;

            const itemName = card.querySelector("h3").textContent.trim();
            const priceText = card.querySelector(".price").textContent.trim();
            const price = Number(priceText.replace("₹", "").replace(",", ""));

            const existingItem = cart.find((item) => item.name === itemName);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    name: itemName,
                    price: price,
                    quantity: 1
                });
            }

            updateCart();

            button.innerHTML = `Added <i class="fa-solid fa-check"></i>`;
            setTimeout(() => {
                button.innerHTML = `Add to Order <i class="fa-solid fa-plus"></i>`;
            }, 1000);
        });
    });
}

function loadLandingMenu() {
    const landingGrid = document.querySelector("#landing-menu-grid");
    if (!landingGrid) return;

    fetch(`${API_BASE}/menu/`)
        .then(res => res.json())
        .then(dishes => {
            landingGrid.innerHTML = "";
            if (!dishes || dishes.length === 0) {
                landingGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #aaa;">
                        <i class="fa-solid fa-utensils" style="font-size: 2rem; color: var(--secondary-color); margin-bottom: 10px;"></i>
                        <p style="font-size: 1.05rem; color: #fff;">No dishes added yet</p>
                        <p style="font-size: 0.9rem; color: #888;">Add dishes in Django Admin to see them here.</p>
                    </div>
                `;
                return;
            }

            // Display up to 3 dishes
            dishes.slice(0, 3).forEach(dish => {
                const card = document.createElement("div");
                card.className = "menu-card";
                card.dataset.category = dish.category;
                card.innerHTML = `
                    <div class="menu-card-image">
                        <img src="${formatImageUrl(dish.image, dish.category)}" alt="${dish.name}">
                        <span class="price">₹${Math.round(dish.price)}</span>
                    </div>
                    <div class="menu-card-content">
                        <div class="menu-card-heading">
                            <h3>${dish.name}</h3>
                            <span class="rating">★ ${dish.rating || '5.0'}</span>
                        </div>
                        <p>${dish.description || ''}</p>
                        <button class="add-button">
                            Add to Order
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                `;
                landingGrid.appendChild(card);
            });

            bindAddButtons();
        })
        .catch(err => {
            console.error("Error loading landing menu:", err);
        });
}


/* Update cart */

function updateCart() {
    saveCart();
    if (!cartItemsContainer || !orderCount || !cartTotalElement) return;

    cartItemsContainer.innerHTML = "";

    let total = 0;
    let itemCount = 0;


    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `
            <p class="empty-cart">
                Your cart is empty.
            </p>
        `;

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

                    <button
                        class="decrease-button"
                        data-index="${index}">
                        −
                    </button>

                    <span>${item.quantity}</span>

                    <button
                        class="increase-button"
                        data-index="${index}">
                        +
                    </button>

                </div>

            </div>

            <strong class="cart-item-price">
                ₹${itemTotal}
            </strong>
        `;

        cartItemsContainer.appendChild(cartItem);

    });


    orderCount.textContent = itemCount;

    cartTotalElement.textContent = `₹${total}`;


    /* Increase quantity */

    document.querySelectorAll(".increase-button").forEach((button) => {

        button.addEventListener("click", () => {

            const index = Number(button.dataset.index);

            cart[index].quantity++;

            updateCart();

        });

    });


    /* Decrease quantity */

    document.querySelectorAll(".decrease-button").forEach((button) => {

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


/* Open cart */

orderButton.addEventListener("click", () => {

    cartPanel.classList.add("show");

});


/* Close cart */

cartClose.addEventListener("click", () => {

    cartPanel.classList.remove("show");

});


/* Place order */

placeOrderButton.addEventListener("click", () => {

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;

    }

    alert("Thank you! Your order has been placed.");

    cart = [];
    saveCart();
    updateCart();

    cartPanel.classList.remove("show");

});

// Initial load of cart from localStorage and menu from API
updateCart();
loadLandingMenu();
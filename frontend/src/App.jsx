import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import './home.css';

const API_BASE = 'http://127.0.0.1:8000/api';

const formatMenuItem = (item) => ({
    ...item,
    image: item.image || (
        item.category === 'coffee' ? 'images/hot-beverages.png' :
        item.category === 'drinks' ? 'images/cold-beverages.png' :
        item.category === 'dessert' ? 'images/desserts.png' : 'images/special-combo.png'
    )
});

function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [allDishes, setAllDishes] = useState([]);
    const [category, setCategory] = useState('all');
    const [cart, setCart] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('cafe_cart') || '[]');
        } catch {
            return [];
        }
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [contactStatus, setContactStatus] = useState('');
    
    useEffect(() => {
        try {
            localStorage.setItem('cafe_cart', JSON.stringify(cart));
        } catch (e) {
            console.error(e);
        }
    }, [cart]);

    // Fetch all dishes once for category counts and landing page preview
    const fetchAllDishes = () => {
        axios.get(`${API_BASE}/menu/`).then(res => {
            const formatted = (res.data || []).map(formatMenuItem);
            setAllDishes(formatted);
        }).catch(err => {
            console.error('Error fetching all dishes:', err);
        });
    };

    useEffect(() => {
        fetchAllDishes();
    }, []);

    // Fetch category items when category changes
    useEffect(() => {
        let url = `${API_BASE}/menu/`;
        if (category !== 'all') {
            url += `?category=${category}`;
        }
        axios.get(url).then(res => {
            const formatted = (res.data || []).map(formatMenuItem);
            setMenuItems(formatted);
        }).catch(err => {
            console.error('Error fetching menu:', err);
            setMenuItems([]);
        });
    }, [category]);
    
    // Cart functions
    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.menu_item === item.id);
            if (existing) {
                return prev.map(i => i.menu_item === item.id ? {...i, quantity: i.quantity + 1} : i);
            }
            return [...prev, { menu_item: item.id, item_name: item.name, price: item.price, quantity: 1 }];
        });
    };
    
    const increaseQty = (id) => {
        setCart(prev => prev.map(i => i.menu_item === id ? {...i, quantity: i.quantity + 1} : i));
    };
    
    const decreaseQty = (id) => {
        setCart(prev => {
            const existing = prev.find(i => i.menu_item === id);
            if (existing.quantity === 1) {
                return prev.filter(i => i.menu_item !== id);
            }
            return prev.map(i => i.menu_item === id ? {...i, quantity: i.quantity - 1} : i);
        });
    };
    
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    const placeOrder = () => {
        if (cart.length === 0) return alert('Cart is empty');
        const orderData = {
            customer_name: 'Guest',
            customer_phone: '9999999999',
            customer_email: 'guest@example.com',
            delivery_address: 'Cafe pickup',
            notes: '',
            items: cart.map(i => ({ menu_item: i.menu_item, quantity: i.quantity }))
        };
        axios.post(`${API_BASE}/orders/`, orderData)
            .then(() => {
                alert('Order placed successfully!');
                setCart([]);
                setIsCartOpen(false);
            })
            .catch(console.error);
    };
    
    useEffect(() => {
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
            { threshold: 0.15 }
        );
        revealElements.forEach((element) => revealObserver.observe(element));

        // Navbar Scroll Effect
        const header = document.querySelector("header");
        const handleScroll = () => {
            if (window.scrollY > 50) header.classList.add("scrolled");
            else header.classList.remove("scrolled");
        };
        window.addEventListener("scroll", handleScroll);

        // Back To Top Button
        const backToTopButton = document.querySelector("#back-to-top");
        const handleBackToTopScroll = () => {
            if (window.scrollY > 400) backToTopButton.classList.add("show");
            else backToTopButton.classList.remove("show");
        };
        window.addEventListener("scroll", handleBackToTopScroll);
        
        const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
        if(backToTopButton) backToTopButton.addEventListener("click", scrollToTop);

        // Testimonial Slider
        const testimonialCards = document.querySelectorAll(".testimonial-card");
        const sliderDots = document.querySelectorAll(".slider-dot");
        const prevButton = document.querySelector("#prev-button");
        const nextButton = document.querySelector("#next-button");
        let currentTestimonial = 0;

        const showTestimonial = (index) => {
            if (index >= testimonialCards.length) currentTestimonial = 0;
            else if (index < 0) currentTestimonial = testimonialCards.length - 1;
            else currentTestimonial = index;

            testimonialCards.forEach(card => card.classList.remove("active"));
            sliderDots.forEach(dot => dot.classList.remove("active"));

            if(testimonialCards[currentTestimonial]) testimonialCards[currentTestimonial].classList.add("active");
            if(sliderDots[currentTestimonial]) sliderDots[currentTestimonial].classList.add("active");
        };

        if(prevButton) prevButton.addEventListener("click", () => showTestimonial(currentTestimonial - 1));
        if(nextButton) nextButton.addEventListener("click", () => showTestimonial(currentTestimonial + 1));
        
        sliderDots.forEach(dot => {
            dot.addEventListener("click", () => showTestimonial(Number(dot.dataset.slide)));
        });

        const sliderInterval = setInterval(() => {
            showTestimonial(currentTestimonial + 1);
        }, 5000);

        // Gallery Lightbox
        const galleryItems = document.querySelectorAll(".gallery-item");
        let lightbox = document.querySelector(".lightbox");
        if (!lightbox) {
            lightbox = document.createElement("div");
            lightbox.classList.add("lightbox");
            lightbox.innerHTML = `
                <button class="lightbox-close">&times;</button>
                <img class="lightbox-image" src="" alt="">
            `;
            document.body.appendChild(lightbox);
        }
        const lightboxImage = lightbox.querySelector(".lightbox-image");
        const lightboxClose = lightbox.querySelector(".lightbox-close");

        const openLightbox = (e) => {
            const item = e.currentTarget;
            const image = item.querySelector("img");
            if(image) {
                lightboxImage.src = image.src;
                lightboxImage.alt = image.alt;
                lightbox.classList.add("show");
                document.body.style.overflow = "hidden";
            }
        };

        galleryItems.forEach(item => item.addEventListener("click", openLightbox));

        const closeLightbox = () => {
            lightbox.classList.remove("show");
            document.body.style.overflow = "";
        };

        lightboxClose.addEventListener("click", closeLightbox);
        const handleLightboxClick = (e) => { if (e.target === lightbox) closeLightbox(); };
        lightbox.addEventListener("click", handleLightboxClick);
        
        const handleKeyDown = (e) => { if (e.key === "Escape") closeLightbox(); };
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            revealObserver.disconnect();
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("scroll", handleBackToTopScroll);
            if(backToTopButton) backToTopButton.removeEventListener("click", scrollToTop);
            clearInterval(sliderInterval);
            galleryItems.forEach(item => item.removeEventListener("click", openLightbox));
            lightboxClose.removeEventListener("click", closeLightbox);
            lightbox.removeEventListener("click", handleLightboxClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleContact = (e) => {
        e.preventDefault();
        const data = {
            name: e.target.name.value,
            email: e.target.email.value,
            subject: e.target.subject.value,
            message: e.target.message.value
        };
        axios.post(`${API_BASE}/contact/`, data)
            .then(() => {
                setContactStatus('Thank you! Your message has been received.');
                e.target.reset();
                setTimeout(() => setContactStatus(''), 4000);
            })
            .catch(() => setContactStatus('Error sending message.'));
    };

    const filteredMenuItems = menuItems.filter(item => {
        const matchesCategory = category === 'all' || item.category === category;
        const matchesSearch = !searchQuery || 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className={`app-container ${isMobileMenuOpen ? "show-mobile-menu" : ""}`}>

    {/*  navbar */}
    <header className={currentPage === 'menu' ? 'menu-page-header' : ''}>
    <nav className="navbar section-content">

        <a 
            href="#home" 
            className="nav-logo"
            onClick={(e) => {
                e.preventDefault();
                setCurrentPage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
        >
            <h2 className="logo-text">☕ The Untitled Cafe</h2>
        </a>

        <ul className="nav-menu">

            <button id="menu-close-button" onClick={() => setIsMobileMenuOpen(false)} className="fas fa-times"></button>

            <li className="nav-item">
                <a 
                    href="#home" 
                    className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
                    onClick={() => {
                        setCurrentPage('home');
                        setIsMobileMenuOpen(false);
                    }}
                >
                    Home
                </a>
            </li>

            <li className="nav-item">
                <a 
                    href="#about" 
                    className="nav-link"
                    onClick={() => {
                        setCurrentPage('home');
                        setIsMobileMenuOpen(false);
                    }}
                >
                    About
                </a>
            </li>

            <li className="nav-item">
                <a 
                    href="#menu" 
                    className={`nav-link ${currentPage === 'menu' ? 'active' : ''}`}
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage('menu');
                        setIsMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                >
                    Menu
                </a>
            </li>

            <li className="nav-item">
                <a 
                    href="#testimonials" 
                    className="nav-link"
                    onClick={() => {
                        setCurrentPage('home');
                        setIsMobileMenuOpen(false);
                    }}
                >
                    Testimonials
                </a>
            </li>

            <li className="nav-item">
                <a 
                    href="#gallery" 
                    className="nav-link"
                    onClick={() => {
                        setCurrentPage('home');
                        setIsMobileMenuOpen(false);
                    }}
                >
                    Gallery
                </a>
            </li>

            <li className="nav-item">
                <a 
                    href="#contact" 
                    className="nav-link"
                    onClick={() => {
                        setCurrentPage('home');
                        setIsMobileMenuOpen(false);
                    }}
                >
                    Contact
                </a>
            </li>

        </ul>

        <button id="menu-open-button" onClick={() => setIsMobileMenuOpen(true)} className="fas fa-bars"></button>
        <button className="order-button" id="order-button" onClick={() => setIsCartOpen(true)}>
            <i className="fa-solid fa-cart-shopping"></i>
            <span id="order-count">{cartCount}</span>
        </button>

        {/*  Cart  */}
        <div className={`cart-panel ${isCartOpen ? "show" : ""}`} id="cart-panel">

            <div className="cart-header">
                <h2>Your Order</h2>

                <button id="cart-close" onClick={() => setIsCartOpen(false)} className="cart-close">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div className="cart-items" id="cart-items">
                {cart.length === 0 ? (
                    <p className="empty-cart">Your cart is empty.</p>
                ) : (
                    cart.map(item => (
                        <div key={item.menu_item} className="cart-item">
                            <div className="cart-item-info">
                                <h3>{item.item_name}</h3>
                                <p>₹{item.price} each</p>
                                <div className="quantity-controls">
                                    <button className="decrease-button" onClick={() => decreaseQty(item.menu_item)}>−</button>
                                    <span>{item.quantity}</span>
                                    <button className="increase-button" onClick={() => increaseQty(item.menu_item)}>+</button>
                                </div>
                            </div>
                            <strong className="cart-item-price">₹{item.price * item.quantity}</strong>
                        </div>
                    ))
                )}
            </div>
<div className="cart-footer">

                <div className="cart-total">
                    <span>Total</span>
                    <strong id="cart-total">₹{cartTotal}</strong>
                </div>

                <button className="place-order-button" id="place-order-button" onClick={placeOrder}>
                    Place Order
                    <i className="fa-solid fa-arrow-right"></i>
                </button>

            </div>

        </div>

    </nav>
</header>

    <main>
        {currentPage === 'menu' ? (
            <>
                <section className="menu-hero-section">
                    <div className="section-content">
                        <div className="breadcrumbs">
                            <a href="#home" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a>
                            <span>/</span>
                            <span>Menu</span>
                        </div>

                        <p className="menu-hero-tag">Taste The Difference</p>
                        <h1 className="menu-hero-title">Our Full Menu</h1>
                        <p className="menu-hero-desc">
                            Explore our complete collection of artisanal coffees, chilled refreshers, mouthwatering gourmet bites, and freshly baked sweet treats.
                        </p>

                        <div className="menu-controls">
                            <div className="search-box-wrapper">
                                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                                <input 
                                    type="text" 
                                    className="search-input" 
                                    placeholder="Search your favourite coffee, drinks, dishes or desserts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button 
                                        className="search-clear-btn" 
                                        style={{ display: 'block' }}
                                        onClick={() => setSearchQuery('')}
                                        aria-label="Clear search"
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                )}
                            </div>

                            <div className="menu-page-filters">
                                {[
                                    { key: 'all', label: 'All Dishes', icon: 'fa-utensils', count: allDishes.length },
                                    { key: 'coffee', label: 'Hot Coffee', icon: 'fa-mug-hot', count: allDishes.filter(i => i.category === 'coffee').length },
                                    { key: 'drinks', label: 'Cold Beverages', icon: 'fa-glass-water', count: allDishes.filter(i => i.category === 'drinks').length },
                                    { key: 'food', label: 'Food & Bites', icon: 'fa-burger', count: allDishes.filter(i => i.category === 'food').length },
                                    { key: 'dessert', label: 'Desserts', icon: 'fa-cake-candles', count: allDishes.filter(i => i.category === 'dessert').length }
                                ].map(cat => (
                                    <button 
                                        key={cat.key}
                                        className={`filter-btn ${category === cat.key ? "active" : ""}`}
                                        onClick={() => setCategory(cat.key)}
                                    >
                                        <i className={`fa-solid ${cat.icon}`}></i>
                                        {cat.label}
                                        <span className="badge-count">{cat.count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="menu-section" style={{ paddingTop: '20px' }}>
                    <div className="section-content">
                        <div className="menu-results-bar">
                            <span className="menu-results-count">
                                Showing <strong>{filteredMenuItems.length}</strong> items
                            </span>
                            <span className="active-category-name">
                                {category === 'all' ? 'All Items' : category.toUpperCase()}
                            </span>
                        </div>

                        {filteredMenuItems.length > 0 ? (
                            <div className="menu-grid">
                                {filteredMenuItems.map(item => (
                                    <div key={item.id} className="menu-card" data-category={item.category}>
                                        <div className="menu-card-image">
                                            {item.tag && <span className="menu-card-tag">{item.tag}</span>}
                                            {item.image && <img src={item.image} alt={item.name} />}
                                            <span className="price">₹{item.price}</span>
                                        </div>
                                        <div className="menu-card-content">
                                            <div className="menu-card-heading">
                                                <h3>{item.name}</h3>
                                                <span className="rating">★ {item.rating}</span>
                                            </div>
                                            <p>{item.description}</p>
                                            <button className="add-button" onClick={() => addToCart(item)}>
                                                Add to Order <i className="fa-solid fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-dishes-found">
                                <i className="fa-solid fa-mug-saucer"></i>
                                <h3>No dishes matched your search</h3>
                                <p>Try searching for a different dish, or choose another category above.</p>
                                <button 
                                    className="reset-search-btn"
                                    onClick={() => { setCategory('all'); setSearchQuery(''); }}
                                >
                                    View All Dishes
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </>
        ) : (
            <>
        {/* header */}
        <section id="home" className="hero-section">
            <div className="section-content">
                <div className="hero-details">

                    <h2 className="title">Best Cafe</h2>

                    <h1 className="subtitle">
                        Make your day great with our coffee!
                    </h1>

                    <p className="description">
                        Welcome to The Untitled Cafe , where every bean tells a story
                        and every cup brings a little happiness to your day.
                    </p>

                    <div className="buttons">

                        <a 
                            href="#menu" 
                            className="button order-now"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage('menu');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            Explore Menu
                            <i className="fa-solid fa-arrow-right"></i>
                        </a>

                        <a href="#contact" className="button contact-us">
                            Contact Us
                        </a>

                    </div>

                    {/*  Small highlights  */}
                    <div className="hero-features">

                        <div className="hero-feature">
                            <i className="fa-solid fa-mug-hot"></i>
                            <div>
                                <strong>Fresh Coffee</strong>
                                <span>Every single day</span>
                            </div>
                        </div>

                        <div className="hero-feature">
                            <i className="fa-solid fa-leaf"></i>
                            <div>
                                <strong>Fresh Ingredients</strong>
                                <span>Quality you can taste</span>
                            </div>
                        </div>

                    </div>

                </div>
                <div className="hero-image-wrapper" >
                    <img src="./images/coffee-hero-section.png" alt="Hero" className="hero-image" />
                </div>
            </div>
        </section>

        
        {/*  about  */}
        <section id="about" className="about-section">

            <div className="section-content about-content reveal">

                {/*  About Image  */}
                <div className="about-image-wrapper">

                    <img src="images/about-image.jpg"
                        alt="People enjoying coffee at The Untitled Cafe"
                        className="about-image" />

                    <div className="experience-badge">
                        <strong>5+</strong>
                        <span>Years of<br />Good Coffee</span>
                    </div>

                </div>


                {/*  About Content  */}
                <div className="about-details">

                    <p className="about-tag">Our Story</p>

                    <h2 className="section-title about-title">
                        A little cafe with a lot of heart.
                    </h2>

                    <p className="about-text">
                        The Untitled Cafe was created as a simple place where
                        people can slow down, enjoy a great cup of coffee,
                        and spend quality time with friends.
                    </p>

                    <p className="about-text">
                        From carefully selected coffee beans to refreshing
                        drinks and delicious bites, everything is prepared
                        with care. Whether you're here for a quick coffee
                        or a long conversation, there's always a seat for you.
                    </p>


                    {/*  Features  */}
                    <div className="about-features">

                        <div className="about-feature">
                            <i className="fa-solid fa-leaf"></i>
                            <span>Fresh Ingredients</span>
                        </div>

                        <div className="about-feature">
                            <i className="fa-solid fa-heart"></i>
                            <span>Made With Love</span>
                        </div>

                        <div className="about-feature">
                            <i className="fa-solid fa-wifi"></i>
                            <span>Free Wi-Fi</span>
                        </div>

                        <div className="about-feature">
                            <i className="fa-solid fa-couch"></i>
                            <span>Cozy Atmosphere</span>
                        </div>

                    </div>


                    {/*  Social Links  */}
                    <div className="social-link-list">

                        <a href="#" className="social-link"
                        aria-label="Facebook">
                            <i className="fa-brands fa-facebook-f"></i>
                        </a>

                        <a href="#" className="social-link"
                        aria-label="Instagram">
                            <i className="fa-brands fa-instagram"></i>
                        </a>

                        <a href="#" className="social-link"
                        aria-label="X">
                            <i className="fa-brands fa-x-twitter"></i>
                        </a>

                    </div>

                </div>

            </div>

        </section>

        {/* menu */}
        

    <section id="menu" className="menu-section">

        <div className="section-heading">

            <p className="section-tag">Taste the difference</p>

            <h2 className="section-title">
                Featured Dishes
            </h2>

            <p>
                A handpicked selection of our cafe's signature favourites.
            </p>

        </div>


        <div className="section-content">

            {/*  Featured Preview Menu Cards  */}
            <div className="menu-grid reveal">
                {allDishes.length > 0 ? (
                    allDishes.slice(0, 3).map(item => (
                        <div key={item.id} className="menu-card" data-category={item.category}>
                            <div className="menu-card-image">
                                {item.tag && <span className="menu-card-tag">{item.tag}</span>}
                                {item.image && <img src={item.image} alt={item.name} />}
                                <span className="price">₹{item.price}</span>
                            </div>
                            <div className="menu-card-content">
                                <div className="menu-card-heading">
                                    <h3>{item.name}</h3>
                                    <span className="rating">★ {item.rating}</span>
                                </div>
                                <p>{item.description}</p>
                                <button className="add-button" onClick={() => addToCart(item)}>
                                    Add to Order <i className="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: '#aaa' }}>
                        <i className="fa-solid fa-utensils" style={{ fontSize: '2rem', color: 'var(--secondary-color)', marginBottom: '10px' }}></i>
                        <p style={{ fontSize: '1.05rem', color: '#fff' }}>No dishes added yet</p>
                        <p style={{ fontSize: '0.9rem', color: '#888' }}>Dishes added in Django Admin will show up here automatically.</p>
                    </div>
                )}
            </div>

            {/* Show More Dishes Button */}
            <div className="show-more-dishes-wrapper">
                <button 
                    type="button"
                    className="show-more-dishes-btn"
                    onClick={() => {
                        setCurrentPage('menu');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                >
                    <span>Show More Dishes</span>
                    <i className="fa-solid fa-arrow-right"></i>
                </button>
                <p className="show-more-hint">Explore our full menu with 20+ handcrafted coffees, drinks, bites & desserts</p>
            </div>
        </div>
    </section>
        {/*  ================= TESTIMONIALS =================  */}

    <section id="testimonials" className="testimonial-section">

        <div className="section-content">

            {/*  Section Heading  */}

            <div className="testimonial-heading">

                <p className="testimonial-tag">
                    Happy Customers
                </p>

                <h2 className="section-title">
                    What They Say
                </h2>

                <p className="testimonial-intro">
                    Good coffee tastes even better with good company.
                </p>

            </div>


            {/*  Testimonial Slider  */}

            <div className="testimonial-slider reveal">

                {/*  Previous Button  */}

                <button
                    className="slider-button prev-button"
                    id="prev-button"
                    aria-label="Previous testimonial">

                    <i className="fa-solid fa-chevron-left"></i>

                </button>


                {/*  Testimonial Cards  */}

                <div className="testimonial-container">


                    {/*  Testimonial 1  */}

                    <div className="testimonial-card active">

                        <div className="quote-icon">
                            <i className="fa-solid fa-quote-left"></i>
                        </div>

                        <div className="stars">
                            ★★★★★
                        </div>

                        <p className="testimonial-text">
                            "The coffee is amazing and the atmosphere
                            is so peaceful. It is the perfect place
                            to catch up with friends!"
                        </p>

                        <div className="customer">

                            <div className="customer-image">
                                A
                            </div>

                            <div className="customer-info">

                                <h3>Ananya</h3>

                                <span>
                                    Regular Customer
                                </span>

                            </div>

                        </div>

                    </div>


                    {/*  Testimonial 2  */}

                    <div className="testimonial-card">

                        <div className="quote-icon">
                            <i className="fa-solid fa-quote-left"></i>
                        </div>

                        <div className="stars">
                            ★★★★★
                        </div>

                        <p className="testimonial-text">
                            "Loved the cold coffee and burger combo.
                            Everything was fresh and the staff were
                            very friendly."
                        </p>

                        <div className="customer">

                            <div className="customer-image">
                                R
                            </div>

                            <div className="customer-info">

                                <h3>Rahul</h3>

                                <span>
                                    Coffee Lover
                                </span>

                            </div>

                        </div>

                    </div>


                    {/*  Testimonial 3  */}

                    <div className="testimonial-card">

                        <div className="quote-icon">
                            <i className="fa-solid fa-quote-left"></i>
                        </div>

                        <div className="stars">
                            ★★★★★
                        </div>

                        <p className="testimonial-text">
                            "A cozy little place with beautiful
                            presentation and really good desserts.
                            Definitely coming back!"
                        </p>

                        <div className="customer">

                            <div className="customer-image">
                                S
                            </div>

                            <div className="customer-info">

                                <h3>Shreya</h3>

                                <span>
                                    Happy Customer
                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                {/*  Next Button  */}

                <button
                    className="slider-button next-button"
                    id="next-button"
                    aria-label="Next testimonial">

                    <i className="fa-solid fa-chevron-right"></i>

                </button>

            </div>


            {/*  Slider Dots  */}

            <div className="slider-dots">

                <button
                    className="slider-dot active"
                    data-slide="0"
                    aria-label="Show testimonial 1">
                </button>

                <button
                    className="slider-dot"
                    data-slide="1"
                    aria-label="Show testimonial 2">
                </button>

                <button
                    className="slider-dot"
                    data-slide="2"
                    aria-label="Show testimonial 3">
                </button>

            </div>

        </div>

    </section>
        {/*  ================= GALLERY =================  */}

    <section id="gallery" className="gallery-section">

        <div className="section-content">

            {/*  Gallery Heading  */}

            <div className="gallery-heading">

                <p className="gallery-tag">
                    Inside The Cafe
                </p>

                <h2 className="section-title">
                    Our Gallery
                </h2>

                <p className="gallery-description">
                    A glimpse of coffee, food and cozy moments.
                </p>

            </div>


            {/*  Gallery  */}

            <div className="gallery-grid reveal">


                {/*  Image 1  */}

                <div className="gallery-item gallery-large">

                    <img src="images/about-image.jpg"
                        alt="People enjoying coffee at the cafe" />

                    <div className="gallery-overlay">

                        <i className="fa-solid fa-magnifying-glass"></i>

                    </div>

                </div>


                {/*  Image 2  */}

                <div className="gallery-item">

                    <img src="images/hot-beverages.png"
                        alt="Hot coffee" />

                    <div className="gallery-overlay">

                        <i className="fa-solid fa-magnifying-glass"></i>

                    </div>

                </div>


                {/*  Image 3  */}

                <div className="gallery-item">

                    <img src="images/cold-beverages.png"
                        alt="Cold coffee" />

                    <div className="gallery-overlay">

                        <i className="fa-solid fa-magnifying-glass"></i>

                    </div>

                </div>


                {/*  Image 4  */}

                <div className="gallery-item">

                    <img src="images/refreshment.png"
                        alt="Refreshing drink" />

                    <div className="gallery-overlay">

                        <i className="fa-solid fa-magnifying-glass"></i>

                    </div>

                </div>


                {/*  Image 5  */}

                <div className="gallery-item">

                    <img src="images/desserts.png"
                        alt="Cafe dessert" />

                    <div className="gallery-overlay">

                        <i className="fa-solid fa-magnifying-glass"></i>

                    </div>

                </div>


                {/*  Image 6  */}

                <div className="gallery-item gallery-wide">

                    <img src="images/burger-frenchfries - Copy.png"
                        alt="Burger and french fries" />

                    <div className="gallery-overlay">

                        <i className="fa-solid fa-magnifying-glass"></i>

                    </div>

                </div>


            </div>

        </div>

    </section>
        {/*  Contact Section  */}
    <section id="contact" className="contact-section">
        <div className="section-content">

            <div className="contact-heading">
                <p className="contact-tag">Get In Touch</p>
                <h2 className="section-title">Contact Us</h2>
                <p>
                    Have a question, suggestion, or just want to say hello?
                    We'd love to hear from you.
                </p>
            </div>

            <div className="contact-content reveal">

                {/*  Contact Information  */}
                <div className="contact-info">

                    <div className="contact-info-item">
                        <div className="contact-icon">
                            <i className="fa-solid fa-location-dot"></i>
                        </div>
                        <div>
                            <h3>Visit Us</h3>
                            <p>Your Cafe Address<br />Coimbatore, Tamil Nadu</p>
                        </div>
                    </div>

                    <div className="contact-info-item">
                        <div className="contact-icon">
                            <i className="fa-solid fa-phone"></i>
                        </div>
                        <div>
                            <h3>Call Us</h3>
                            <p>+91 XXXXX XXXXX</p>
                        </div>
                    </div>

                    <div className="contact-info-item">
                        <div className="contact-icon">
                            <i className="fa-solid fa-envelope"></i>
                        </div>
                        <div>
                            <h3>Email Us</h3>
                            <p>yourcafe@email.com</p>
                        </div>
                    </div>

                    <div className="contact-info-item">
                        <div className="contact-icon">
                            <i className="fa-solid fa-clock"></i>
                        </div>
                        <div>
                            <h3>Opening Hours</h3>
                            <p>Monday - Sunday<br />9:00 AM - 10:00 PM</p>
                        </div>
                    </div>

                </div>

                {/*  Contact Form  */}
                <form className="contact-form" id="contact-form" onSubmit={handleContact}>

                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Your Name"
                        required
                     />

                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Your Email"
                        required
                     />

                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        placeholder="Subject"
                        required
                     />

                    <textarea
                        id="message"
                        name="message"
                        rows="6"
                        placeholder="Your Message"
                        required
                    ></textarea>

                    <button type="submit" className="contact-submit">
                        Send Message
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>

                    <p className="form-message" id="form-message" style={{ display: contactStatus ? 'block' : 'none', color: contactStatus.includes('Error') ? 'red' : 'green' }}>
                        {contactStatus}
                    </p>

                </form>

            </div>
        </div>
    </section>
            </>
        )}
        {/*  Footer  */}
    <footer className="footer-section">

        <div className="section-content footer-content">

            {/*  Footer Brand  */}
            <div className="footer-brand">
                <a 
                    href="#home" 
                    className="footer-logo"
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage('home');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                >
                    <span className="footer-logo-icon">☕</span>
                    <span>The Untitled Cafe</span>
                </a>

                <p>
                    A cozy place for good coffee, great food,
                    and unforgettable moments.
                </p>

                <div className="footer-social-links">
                    <a href="#" aria-label="Facebook">
                        <i className="fa-brands fa-facebook-f"></i>
                    </a>

                    <a href="#" aria-label="Instagram">
                        <i className="fa-brands fa-instagram"></i>
                    </a>

                    <a href="#" aria-label="X">
                        <i className="fa-brands fa-x-twitter"></i>
                    </a>
                </div>
            </div>


            {/*  Quick Links  */}
            <div className="footer-column">
                <h3>Quick Links</h3>

                <a href="#home" onClick={() => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a>
                <a href="#about" onClick={() => { setCurrentPage('home'); }}>About</a>
                <a href="#menu" onClick={(e) => { e.preventDefault(); setCurrentPage('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Menu</a>
                <a href="#testimonials" onClick={() => { setCurrentPage('home'); }}>Testimonials</a>
                <a href="#gallery" onClick={() => { setCurrentPage('home'); }}>Gallery</a>
                <a href="#contact" onClick={() => { setCurrentPage('home'); }}>Contact</a>
            </div>


            {/*  Opening Hours  */}
            <div className="footer-column">
                <h3>Opening Hours</h3>

                <p>Monday - Friday</p>
                <span>9:00 AM - 10:00 PM</span>

                <p>Saturday - Sunday</p>
                <span>9:00 AM - 11:00 PM</span>
            </div>


            {/*  Contact  */}
            <div className="footer-column">
                <h3>Contact</h3>

                <p>
                    <i className="fa-solid fa-location-dot"></i>
                    Your Cafe Address
                </p>

                <p>
                    <i className="fa-solid fa-phone"></i>
                    +91 XXXXX XXXXX
                </p>

                <p>
                    <i className="fa-solid fa-envelope"></i>
                    yourcafe@email.com
                </p>
            </div>

        </div>


        {/*  Footer Bottom  */}
        <div className="footer-bottom">

            <p>
                © 2026 The Untitled Cafe. All Rights Reserved.
            </p>

            <p>
                Made with <i className="fa-solid fa-heart"></i> for coffee lovers.
            </p>

        </div>

    </footer>


    {/*  Back To Top Button  */}
    <button className="back-to-top" id="back-to-top" aria-label="Back to top">
        <i className="fa-solid fa-arrow-up"></i>
    </button>
    </main>
    
        </div>
    );
}

export default App;

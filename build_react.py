import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# basic conversions
body_match = re.search(r'<body>(.*?)<script', html, re.DOTALL)
body = body_match.group(1)
body = body.replace('class=', 'className=')
body = body.replace('for=', 'htmlFor=')
body = re.sub(r'<img([^>]*?)(?<!/)>', r'<img\1 />', body)
body = re.sub(r'<input([^>]*?)(?<!/)>', r'<input\1 />', body)
body = re.sub(r'<br([^>]*?)(?<!/)>', r'<br\1 />', body)
body = re.sub(r'<hr([^>]*?)(?<!/)>', r'<hr\1 />', body)
body = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', body, flags=re.DOTALL)
body = re.sub(r'style="(.*?)"', '', body)

# 1. State and imports
react_imports = """import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import './home.css';

const API_BASE = 'http://127.0.0.1:8000/api';

function App() {
    const [menuItems, setMenuItems] = useState([]);
    const [category, setCategory] = useState('all');
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [contactStatus, setContactStatus] = useState('');
    
    useEffect(() => {
        let url = `${API_BASE}/menu/`;
        if (category !== 'all') {
            url += `?category=${category}`;
        }
        axios.get(url).then(res => setMenuItems(res.data)).catch(console.error);
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
"""

# Now replace the dynamic parts in body

# Navbar cart count
body = re.sub(
    r'<span id="order-count">0</span>',
    r'<span id="order-count">{cartCount}</span>',
    body
)

# Open Cart
body = body.replace('id="order-button"', 'id="order-button" onClick={() => setIsCartOpen(true)}')
# Close Cart
body = body.replace('id="cart-close"', 'id="cart-close" onClick={() => setIsCartOpen(false)}')
# Cart Panel className
body = body.replace('className="cart-panel"', 'className={`cart-panel ${isCartOpen ? "show" : ""}`}')

# Cart Items
cart_items_replacement = """<div className="cart-items" id="cart-items">
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
            </div>"""
body = re.sub(r'<div className="cart-items" id="cart-items">.*?</div>\s*<div className="cart-footer">', cart_items_replacement + '\n<div className="cart-footer">', body, flags=re.DOTALL)

# Cart Total
body = re.sub(r'<strong id="cart-total">.*?</strong>', r'<strong id="cart-total">₹{cartTotal}</strong>', body)

# Place Order Button
body = body.replace('id="place-order-button"', 'id="place-order-button" onClick={placeOrder}')

# Menu Filter Buttons
filter_replacement = """<div className="filter-buttons">
                {['all', 'coffee', 'drinks', 'food', 'dessert'].map(cat => (
                    <button 
                        key={cat}
                        className={`filter-btn ${category === cat ? "active" : ""}`}
                        onClick={() => setCategory(cat)}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>"""
body = re.sub(r'<div className="filter-buttons">.*?</div>\s*\{/\*  Menu Cards  \*/\}', filter_replacement + '\n{/*  Menu Cards  */}', body, flags=re.DOTALL)

# Menu Grid
menu_grid_replacement = """<div className="menu-grid reveal">
                {menuItems.map(item => (
                    <div key={item.id} className="menu-card" data-category={item.category}>
                        <div className="menu-card-image">
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
            </div>"""
body = re.sub(r'<div className="menu-grid reveal">.*?</div>\s*</div>\s*</section>', menu_grid_replacement + '\n</div>\n</section>', body, flags=re.DOTALL)

# Contact Form
contact_form_replacement = """<form className="contact-form" id="contact-form" onSubmit={handleContact}>"""
body = re.sub(r'<form className="contact-form" id="contact-form">', contact_form_replacement, body)

form_message_replacement = """<p className="form-message" id="form-message" style={{ display: contactStatus ? 'block' : 'none', color: contactStatus.includes('Error') ? 'red' : 'green' }}>
                        {contactStatus}
                    </p>"""
body = re.sub(r'<p className="form-message" id="form-message"></p>', form_message_replacement, body)

# Combine
final_code = react_imports + """
    return (
        <div className={`app-container ${isMobileMenuOpen ? "show-mobile-menu" : ""}`}>
""" + body + """
        </div>
    );
}

export default App;
"""

final_code = final_code.replace('id="menu-open-button"', 'id="menu-open-button" onClick={() => setIsMobileMenuOpen(true)}')
final_code = final_code.replace('id="menu-close-button"', 'id="menu-close-button" onClick={() => setIsMobileMenuOpen(false)}')


with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(final_code)

print("Updated App.jsx created successfully")

// Data
const products = [
    {
        id: 1,
        name: "Hamburguesa Clásica",
        description: "Jugosa hamburguesa de carne 100% res con lechuga fresca, tomate, queso cheddar derretido y nuestra salsa especial en un pan artesanal.",
        price: 50.00,
        image: "https://images.unsplash.com/photo-1607474980662-599ebd12f6ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBoYW1idXJnZXJ8ZW58MXx8fHwxNzYxMDE2MzczfDA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
        id: 2,
        name: "Sandwich Especial",
        description: "Delicioso sandwich con jamón de pavo, queso suizo, lechuga crujiente, tomate fresco y mayonesa casera en pan integral recién horneado.",
        price: 50.00,
        image: "https://images.unsplash.com/photo-1673534409216-91c3175b9b2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW5kd2ljaCUyMGZvb2R8ZW58MXx8fHwxNzYxMDU0Nzg4fDA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
        id: 3,
        name: "Hamburguesa Doble",
        description: "Doble carne de res premium, doble queso americano, bacon crujiente, cebolla caramelizada y salsa BBQ sobre pan de papa tostado.",
        price: 50.00,
        image: "https://images.unsplash.com/photo-1607474980662-599ebd12f6ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBoYW1idXJnZXJ8ZW58MXx8fHwxNzYxMDE2MzczfDA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
        id: 4,
        name: "Papas Fritas",
        description: "Crujientes papas fritas cortadas a mano, doradas a la perfección con un toque de sal marina y servidas con nuestra salsa de la casa.",
        price: 35.00,
        image: "https://images.unsplash.com/photo-1630431341973-02e1b662ec35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBmcmllc3xlbnwxfHx8fDE3NjEwMjU0MzB8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
        id: 5,
        name: "Pizza Personal",
        description: "Pizza artesanal con masa recién preparada, salsa de tomate casera, mozzarella fresca y tus ingredientes favoritos horneados en horno de piedra.",
        price: 45.00,
        image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMHNsaWNlfGVufDF8fHx8MTc2MTA0MTYwMXww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
        id: 6,
        name: "Combo Familiar",
        description: "El combo perfecto para compartir: 2 hamburguesas grandes, porción grande de papas fritas, aros de cebolla y bebidas para toda la familia.",
        price: 150.00,
        image: "https://images.unsplash.com/photo-1607474980662-599ebd12f6ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBoYW1idXJnZXJ8ZW58MXx8fHwxNzYxMDE2MzczfDA&ixlib=rb-4.1.0&q=80&w=1080"
    }
];

// State
let cart = [];
let isLoggedIn = false;
const API_BASE = 'http://localhost:3000';

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartBadge = document.getElementById('cartBadge');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartFooter = document.getElementById('cartFooter');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const confirmationModal = document.getElementById('confirmationModal');
const contactForm = document.getElementById('contactForm');
const toast = document.getElementById('toast');

// Initialize
function init() {
    renderProducts();
    setupEventListeners();
    // Restore session if token exists
    const existingToken = getAuthToken();
    if (existingToken) {
        isLoggedIn = true;
        loginScreen.style.display = 'none';
        mainApp.style.display = 'block';
    }
}

// Event Listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    // Register modal link
    const registerLink = document.getElementById('openRegister');
    if (registerLink) {
        registerLink.addEventListener('click', (e) => { e.preventDefault(); openRegister(); });
    }
    // Close register by clicking outside
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        registerModal.addEventListener('click', (e) => {
            if (e.target === registerModal) closeRegister();
        });
    }
    // Register form submit
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
    cartBtn.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartSidebar);
    checkoutForm.addEventListener('submit', handleCheckout);
    contactForm.addEventListener('submit', handleContactForm);
    
    // Close cart when clicking outside
    cartSidebar.addEventListener('click', (e) => {
        if (e.target === cartSidebar) {
            closeCartSidebar();
        }
    });
    
    // Close modals when clicking outside
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            closeCheckout();
        }
    });
    
    confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal) {
            closeConfirmation();
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Auth helpers
function getAuthToken() {
    try {
        return localStorage.getItem('authToken');
    } catch (_) { return null; }
}

function setAuthToken(token) {
    try {
        localStorage.setItem('authToken', token);
    } catch (_) {}
}

async function authFetch(path, options = {}) {
    const token = getAuthToken();
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, Object.assign({}, options, { headers }));
    return res;
}

// Login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) return;
    try {
        const res = await fetch(`${API_BASE}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            showToast(err.error || 'Error de autenticación', 'error');
            return;
        }
        const data = await res.json();
        if (data && data.token) {
            setAuthToken(data.token);
            isLoggedIn = true;
            loginScreen.style.display = 'none';
            mainApp.style.display = 'block';
            showToast('¡Bienvenido a Food Divcode!', 'success');
        } else {
            showToast('Respuesta inválida del servidor', 'error');
        }
    } catch (error) {
        showToast('No se pudo conectar con el servidor', 'error');
    }
}

// Register modal controls and submit
function openRegister() {
    const m = document.getElementById('registerModal');
    if (m) m.classList.add('active');
}

function closeRegister() {
    const m = document.getElementById('registerModal');
    if (m) m.classList.remove('active');
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const nombre = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    if (!nombre || !email || !password) return;
    try {
        const res = await fetch(`${API_BASE}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, nombre })
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
            showToast(payload.error || 'No se pudo registrar', 'error');
            return;
        }
        showToast('Registro exitoso, iniciando sesión...', 'success');
        // Auto-login
        const loginRes = await fetch(`${API_BASE}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (loginRes.ok) {
            const data = await loginRes.json();
            if (data && data.token) {
                setAuthToken(data.token);
                isLoggedIn = true;
                closeRegister();
                loginScreen.style.display = 'none';
                mainApp.style.display = 'block';
            }
        }
    } catch (_) {
        showToast('Error de red en registro', 'error');
    }
}

// Products
function renderProducts() {
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-buttons">
                    <button class="btn btn-outline" onclick="addToCart(${product.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Agregar
                    </button>
                    <button class="btn btn-primary">Ver Menú</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCart();
    showToast(`${product.name} agregado al carrito`, 'success');
}

function removeFromCart(productId) {
    const item = cart.find(item => item.id === productId);
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    if (item) {
        showToast(`${item.name} eliminado del carrito`, 'error');
    }
}

function updateQuantity(productId, quantity) {
    if (quantity === 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        updateCart();
    }
}

function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 5;
    const total = subtotal + shipping;
    
    // Update badge
    if (totalItems > 0) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = 'block';
    } else {
        cartBadge.style.display = 'none';
    }
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <p>Tu carrito está vacío</p>
                <p>Agrega algunos productos deliciosos</p>
            </div>
        `;
        cartFooter.innerHTML = '';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-header">
                        <h4>${item.name}</h4>
                        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        cartFooter.innerHTML = `
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Envío</span>
                    <span>$${shipping.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total</span>
                    <span class="text-red">$${total.toFixed(2)}</span>
                </div>
            </div>
            <button class="btn btn-primary" style="width: 100%;" onclick="openCheckout()">FINALIZAR PEDIDO</button>
        `;
    }
}

function openCart() {
    cartSidebar.classList.add('active');
}

function closeCartSidebar() {
    cartSidebar.classList.remove('active');
}

function openCheckout() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + 5;
    
    document.getElementById('checkoutSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('checkoutTotal').textContent = `$${total.toFixed(2)}`;
    
    // Ocultar botón de Mercado Pago inicialmente
    const walletContainer = document.getElementById('walletBrick_container');
    if (walletContainer) {
        walletContainer.style.display = 'none';
        walletContainer.innerHTML = '';
    }
    
    // Asegurar que el botón "Confirmar Pedido" sea visible
    const confirmButton = checkoutForm.querySelector('button[type="submit"]');
    if (confirmButton) {
        confirmButton.style.display = 'block';
    }
    
    // Listener para detectar cambios en el método de pago
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });
    
    closeCartSidebar();
    checkoutModal.classList.add('active');
}

function handlePaymentMethodChange() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const walletContainer = document.getElementById('walletBrick_container');
    const confirmButton = checkoutForm.querySelector('button[type="submit"]');
    
    if (selectedMethod === 'mercadopago') {
        // Ocultar botón de confirmar pedido
        if (confirmButton) {
            confirmButton.style.display = 'none';
        }
        // Mostrar contenedor y renderizar botón de Mercado Pago
        if (walletContainer) {
            walletContainer.style.display = 'block';
            renderMercadoPagoButton();
        }
    } else {
        // Ocultar botón de Mercado Pago
        if (walletContainer) {
            walletContainer.style.display = 'none';
            walletContainer.innerHTML = '';
        }
        // Mostrar botón de confirmar pedido
        if (confirmButton) {
            confirmButton.style.display = 'block';
        }
    }
}

function closeCheckout() {
    // Limpiar botón de Mercado Pago al cerrar
    const walletContainer = document.getElementById('walletBrick_container');
    if (walletContainer) {
        walletContainer.style.display = 'none';
        walletContainer.innerHTML = '';
    }
    
    // Asegurar que el botón "Confirmar Pedido" sea visible
    const confirmButton = checkoutForm.querySelector('button[type="submit"]');
    if (confirmButton) {
        confirmButton.style.display = 'block';
    }
    
    checkoutModal.classList.remove('active');
}

function handleCheckout(e) {
    e.preventDefault();
    
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Si el método de pago es Mercado Pago, no procesar aquí (el botón de Mercado Pago lo hará)
    if (paymentMethod === 'mercadopago') {
        return;
    }
    
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const orderNotes = document.getElementById('orderNotes').value;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + 5;
    
    // Generate order number
    const orderNumber = `FD${Date.now().toString().slice(-8)}`;
    
    // Update confirmation modal
    document.getElementById('orderNumber').textContent = orderNumber;
    document.getElementById('confirmAddress').textContent = customerAddress;
    document.getElementById('confirmPhone').textContent = customerPhone;
    
    let paymentMethodText = 'Efectivo';
    if (paymentMethod === 'card') {
        paymentMethodText = 'Tarjeta';
    }
    
    document.getElementById('confirmPaymentMethod').textContent = paymentMethodText;
    document.getElementById('confirmTotal').textContent = `$${total.toFixed(2)}`;
    
    // Close checkout and open confirmation
    closeCheckout();
    confirmationModal.classList.add('active');
    
    // Reset form
    checkoutForm.reset();
}

function closeConfirmation() {
    confirmationModal.classList.remove('active');
    cart = [];
    updateCart();
    showToast('¡Gracias por tu pedido!', 'success');
}

// Contact Form
function handleContactForm(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const phone = document.getElementById('contactPhone').value;
    const message = document.getElementById('contactMessage').value;
    
    showToast('¡Mensaje enviado! Te contactaremos pronto.', 'success');
    contactForm.reset();
}

// Contact Actions
function orderWhatsApp() {
    const phoneNumber = "5215512345678"; // Reemplaza con tu número real
    const message = "Hola, me gustaría hacer un pedido";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

function callNow() {
    window.location.href = "tel:+525512345678";
}

// Toast Notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Mercado Pago Functions
const publicKey = "APP_USR-d4625eba-109d-4ab5-88ed-3c7f1c723e40";
//const preferenceId = "2670517922-879aff76-aa32-4bd1-aa92-595bb947176b"; // Preference ID que funcionaba antes

// app.js (Reemplazar la función actual)

async function renderMercadoPagoButton() {
    try {
        const containerId = 'walletBrick_container';
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error('Contenedor de Mercado Pago no encontrado');
            return;
        }
        
        container.innerHTML = 'Cargando botón de pago...'; // Mensaje de carga

        // *** PASO 1: OBTENER EL ID DE PREFERENCIA DEL BACKEND ***
        const cartItems = getCartItems(); // Obtener el carrito con cantidades
        
        if (cartItems.length === 0) {
            showToast('El carrito está vacío.', 'warning');
            container.innerHTML = 'Añade productos para pagar.';
            return;
        }

        const fetchRes = await fetch('http://localhost:3000/create_preference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items: cartItems }), // <-- Aquí se envía el array 'items'
        });

        // Manejar errores de respuesta del servidor (Error 400, 500, etc.)
        if (!fetchRes.ok) {
            const errorPayload = await fetchRes.json().catch(() => ({}));
            console.error('Error del Servidor al crear preferencia:', fetchRes.status, errorPayload);
            showToast(`Error ${fetchRes.status}: ${errorPayload.error || 'No se pudo crear la preferencia.'}`, 'error');
            container.innerHTML = 'Error de conexión con MP.';
            return; 
        }

        const data = await fetchRes.json();
        const dynamicPreferenceId = data.preference_id;

        // *** PASO 2: Inicializar SDK y renderizar el Wallet Brick con el ID dinámico ***
        
        container.innerHTML = ''; // Limpiar el mensaje de "cargando"

        const mp = new MercadoPago(publicKey, { locale: 'es-AR' });
        const bricksBuilder = mp.bricks();
        
        await bricksBuilder.create('wallet', containerId, {
            initialization: {
                preferenceId: dynamicPreferenceId,
            },
        });
        
    } catch (error) {
        console.error('Error FATAL al renderizar botón de Mercado Pago:', error);
        showToast('Error de red. Asegúrate de que tu servidor esté corriendo.', 'error');
        container.innerHTML = 'Error de red o servidor no disponible.';
    }
}
// app.js (Función getCartItems)

function getCartItems() {
    // Solo usamos los productos realmente agregados al carrito
    return cart.map(item => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price).toFixed(2),
        quantity: parseInt(item.quantity)
    }));


}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

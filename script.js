let productsList = [];
let cart = [];

// Load cart from local storage
function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Save cart to local storage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

async function fetchProducts() {
    const url = "https://670a38ffaf1a3998baa36678.mockapi.io/api/products/products";

    try {
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        productsList = await response.json();

        console.log("Products fetched successfully:", productsList);
        renderProducts();
        updateProductsStock();
    } catch (error) {
        console.error("Failed to fetch products:", error);
        productsList = [];
    }
}

function renderProducts() {
    const productSection = document.getElementById("products-container");
    productSection.innerHTML = ''; // Clear existing content

    productsList.forEach(product => {
        productSection.innerHTML += `
            <div class="product-item ${product.stock === 0 ? 'out-of-stock' : ''}" data-id="${product.id}">
                <h2>${product.name}</h2>
                <img src="https://picsum.photos/seed/${product.id}/200/100" /> 
                <p class="product-description">${product.description}</p>          
                <p class="product-stock">${product.stock} products left</p> 
                
                <div>
                    <button type="button" class="add-to-cart-btn" ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'Out of Stock' : 'Add to cart'}
                    </button>
                </div>
            </div>
        `;
    });
}

function updateProductsStock() {
    cart.forEach(cartItem => {
        const product = productsList.find(p => p.id === cartItem.id);
        if (product) {
            product.stock -= cartItem.quantity;
        }
    });
    productsList.forEach(product => updateProductDisplay(product.id));
}

loadCartFromLocalStorage();
fetchProducts().then(() => {
    setupCartFunctionality();
    updateCartDisplay();
});

function setupCartFunctionality() {
    document.getElementById("cart-icon").addEventListener("click", () => document.getElementById("cart-container").classList.toggle("active"));
    document.getElementById("close-cart").addEventListener("click", handleCloseCart);
    document.getElementById("checkout-btn").addEventListener("click", handleCheckout);
    document.getElementById("increase-btn").addEventListener("click", handleIncrease);
    document.getElementById("decrease-btn").addEventListener("click", handleDecrease);
    
    document.getElementById("products-container").addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const productId = event.target.closest('.product-item').dataset.id;
            handleAddToCart(productId);
        }
    });
}

function handleAddToCart(id) {
    const product = productsList.find(p => p.id === id);
    if (product && product.stock > 0) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        product.stock--;
        updateCartDisplay();
        updateProductDisplay(id);
        saveCartToLocalStorage();
    }
}

function updateCartDisplay() {
    const cartContainer = document.getElementById("cart-container");
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const increaseBtn = document.getElementById("increase-btn");
    const decreaseBtn = document.getElementById("decrease-btn");

    if (cart.length > 0) {
        cartContainer.classList.add("active");
        cartItems.innerHTML = cart.map(item => `
            <div>
                ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}
            </div>
        `).join('');
        cartTotal.textContent = `$${calculateTotal().toFixed(2)}`;
        increaseBtn.style.display = "inline-block";
        decreaseBtn.style.display = "inline-block";
    } else {
        cartContainer.classList.remove("active");
        cartItems.innerHTML = "";
        cartTotal.textContent = "$0.00";
        increaseBtn.style.display = "none";
        decreaseBtn.style.display = "none";
    }
}

function updateProductDisplay(id) {
    const productElement = document.querySelector(`.product-item[data-id="${id}"]`);
    if (productElement) {
        const product = productsList.find(p => p.id === id);
        const stockElement = productElement.querySelector('.product-stock');
        const addToCartBtn = productElement.querySelector('.add-to-cart-btn');
        
        stockElement.textContent = `${product.stock} products left`;
        if (product.stock === 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Out of Stock';
            productElement.classList.add('out-of-stock');
        } else {
            addToCartBtn.disabled = false;
            addToCartBtn.textContent = 'Add to cart';
            productElement.classList.remove('out-of-stock');
        }
    }
}

function calculateTotal() {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function handleCloseCart() {
    document.getElementById("cart-container").classList.remove("active");
}

function handleCheckout() {
    alert("Checkout clicked");
    cart = [];
    updateCartDisplay();
    handleCloseCart();
    saveCartToLocalStorage();
    location.reload(); // Reload the page to reset product stock
}

function handleIncrease() {
    if (cart.length > 0) {
        const lastItem = cart[cart.length - 1];
        const product = productsList.find(p => p.id === lastItem.id);
        
        if (product && product.stock > 0) {
            lastItem.quantity++;
            product.stock--;
            updateCartDisplay();
            updateProductDisplay(lastItem.id);
            saveCartToLocalStorage();
        }
    }
}

function handleDecrease() {
    if (cart.length > 0) {
        const lastItem = cart[cart.length - 1];
        const product = productsList.find(p => p.id === lastItem.id);
        
        if (product) {
            lastItem.quantity--;
            product.stock++;
            
            if (lastItem.quantity === 0) {
                cart.pop();
            }
            
            updateCartDisplay();
            updateProductDisplay(lastItem.id);
            saveCartToLocalStorage();
        }
    }
}

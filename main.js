// DOM Elements
const titleInput = document.getElementById('title');
const priceInput = document.getElementById('price');
const taxesInput = document.getElementById('taxes');
const adsInput = document.getElementById('ads');
const discountInput = document.getElementById('discount');
const totalElement = document.getElementById('total');
const countInput = document.getElementById('count');
const categoryInput = document.getElementById('category');
const submitBtn = document.getElementById('submitBtn');
const productForm = document.getElementById('productForm');
const tableBody = document.getElementById('tableBody');
const deleteAllBtn = document.getElementById('deleteAll');
const searchInput = document.getElementById('searchInput');
const searchByTitleBtn = document.getElementById('searchByTitle');
const searchByCategoryBtn = document.getElementById('searchByCategory');
const productCount = document.getElementById('productCount');

// Application State
let products = [];
let updateMode = false;
let updateIndex = null;
let searchMode = '';

// Initialize Application
function init() {
    loadFromLocalStorage();
    displayProducts();
    updateProductCount();
}

// Calculate Total Price
function calculateTotal() {
    const price = parseFloat(priceInput.value) || 0;
    const taxes = parseFloat(taxesInput.value) || 0;
    const ads = parseFloat(adsInput.value) || 0;
    const discount = parseFloat(discountInput.value) || 0;

    const total = (price + taxes + ads) - discount;
    totalElement.textContent = `Total: $${total.toFixed(2)}`;
    totalElement.style.background = total > 0 
        ? 'linear-gradient(135deg, var(--accent-gold-dark) 0%, var(--accent-gold) 100%)' 
        : 'linear-gradient(135deg, #555 0%, #666 100%)';

    return total;
}

// Event Listeners for Price Calculation
priceInput.addEventListener('input', calculateTotal);
taxesInput.addEventListener('input', calculateTotal);
adsInput.addEventListener('input', calculateTotal);
discountInput.addEventListener('input', calculateTotal);

// Create Product
function createProduct(e) {
    e.preventDefault();

    const product = {
        title: titleInput.value.trim(),
        price: parseFloat(priceInput.value) || 0,
        taxes: parseFloat(taxesInput.value) || 0,
        ads: parseFloat(adsInput.value) || 0,
        discount: parseFloat(discountInput.value) || 0,
        total: calculateTotal(),
        count: parseInt(countInput.value) || 1,
        category: categoryInput.value.trim()
    };

    // Validation
    if (!product.title || !product.category || product.price <= 0) {
        alert('Please fill in all required fields correctly');
        return;
    }

    if (updateMode) {
        // Update existing product
        products[updateIndex] = product;
        updateMode = false;
        updateIndex = null;
        submitBtn.textContent = 'Create Product';
        submitBtn.classList.remove('btn-update');
        submitBtn.classList.add('btn-primary');
    } else {
        // Create new product(s)
        if (product.count > 1) {
            // Create multiple products
            for (let i = 0; i < product.count; i++) {
                products.push({ ...product, count: 1 });
            }
        } else {
            products.push(product);
        }
    }

    saveToLocalStorage();
    displayProducts();
    updateProductCount();
    clearForm();
}

// Display Products
function displayProducts(productList = products) {
    tableBody.innerHTML = '';

    if (productList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 30px; color: var(--text-muted);">
                    No products found. Start by adding your first product!
                </td>
            </tr>
        `;
        return;
    }

    productList.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${product.title}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>$${product.taxes.toFixed(2)}</td>
            <td>$${product.ads.toFixed(2)}</td>
            <td>$${product.discount.toFixed(2)}</td>
            <td><strong>$${product.total.toFixed(2)}</strong></td>
            <td>${product.count}</td>
            <td>${product.category}</td>
            <td>
                <button class="btn btn-update" onclick="updateProduct(${index})">Update</button>
                <button class="btn btn-delete" onclick="deleteProduct(${index})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update Product
function updateProduct(index) {
    const product = products[index];

    titleInput.value = product.title;
    priceInput.value = product.price;
    taxesInput.value = product.taxes;
    adsInput.value = product.ads;
    discountInput.value = product.discount;
    countInput.value = product.count;
    categoryInput.value = product.category;

    calculateTotal();

    updateMode = true;
    updateIndex = index;
    submitBtn.textContent = 'Update Product';
    submitBtn.classList.remove('btn-primary');
    submitBtn.classList.add('btn-update');

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Delete Product
function deleteProduct(index) {
    if (confirm('Are you sure you want to delete this product?')) {
        products.splice(index, 1);
        saveToLocalStorage();
        displayProducts();
        updateProductCount();
    }
}

// Delete All Products
function deleteAllProducts() {
    if (products.length === 0) {
        alert('No products to delete');
        return;
    }

    if (confirm(`Are you sure you want to delete all ${products.length} products? This action cannot be undone.`)) {
        products = [];
        saveToLocalStorage();
        displayProducts();
        updateProductCount();
        clearSearch();
    }
}

// Search Products
function searchProducts(mode) {
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) {
        displayProducts();
        searchMode = '';
        return;
    }

    searchMode = mode;

    const filteredProducts = products.filter(product => {
        if (mode === 'title') {
            return product.title.toLowerCase().includes(searchTerm);
        } else if (mode === 'category') {
            return product.category.toLowerCase().includes(searchTerm);
        }
        return false;
    });

    displayProducts(filteredProducts);
}

// Clear Search
function clearSearch() {
    searchInput.value = '';
    searchMode = '';
    displayProducts();
}

// Update Product Count
function updateProductCount() {
    productCount.textContent = `(${products.length})`;
}

// Clear Form
function clearForm() {
    titleInput.value = '';
    priceInput.value = '';
    taxesInput.value = '0';
    adsInput.value = '0';
    discountInput.value = '0';
    countInput.value = '1';
    categoryInput.value = '';
    calculateTotal();
}

// Local Storage Operations
function saveToLocalStorage() {
    localStorage.setItem('products', JSON.stringify(products));
}

function loadFromLocalStorage() {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
    }
}

// Event Listeners
productForm.addEventListener('submit', createProduct);
deleteAllBtn.addEventListener('click', deleteAllProducts);
searchByTitleBtn.addEventListener('click', () => searchProducts('title'));
searchByCategoryBtn.addEventListener('click', () => searchProducts('category'));
searchInput.addEventListener('input', () => {
    if (searchMode) {
        searchProducts(searchMode);
    }
});

// Show/Hide Delete All button
function toggleDeleteAllButton() {
    deleteAllBtn.style.display = products.length > 0 ? 'block' : 'none';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

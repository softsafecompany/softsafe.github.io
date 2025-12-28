document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("product-list");
  const modal = document.getElementById("product-modal");
  const closeBtn = document.querySelector(".close");
  const searchBar = document.getElementById("search-bar");
  const searchButton = document.getElementById("search-button");
  const searchContainer = document.querySelector(".search-container");

  let allProducts = [];
  let currentFilteredProducts = [];
  const ITEMS_PER_PAGE = 6;
  let currentPage = 1;

  // Inject CSS for animations
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes skeleton-pulse {
      0% { opacity: 0.6; }
      50% { opacity: 0.3; }
      100% { opacity: 0.6; }
    }
    .skeleton-anim {
      animation: skeleton-pulse 1.5s infinite ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }
  `;
  document.head.appendChild(style);

  function showSkeleton() {
    productList.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const skeletonHTML = `
          <div class="produto skeleton skeleton-anim">
            <div style="width: 100%; height: 150px; background-color: #ccc; margin-bottom: 10px; border-radius: 4px;"></div>
            <div style="width: 80%; height: 20px; background-color: #ccc; margin-bottom: 10px; border-radius: 4px;"></div>
            <div style="width: 100px; height: 35px; background-color: #ccc; border-radius: 4px;"></div>
          </div>
        `;
      productList.innerHTML += skeletonHTML;
    }
  }

  // Create Clear Button
  const clearBtn = document.createElement("button");
  clearBtn.textContent = "Limpar";
  clearBtn.style.cssText = "display: none; margin-left: 10px; padding: 10px 15px; background-color: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;";
  if (searchContainer) searchContainer.appendChild(clearBtn);

  // Create Load More Button
  const loadMoreBtn = document.createElement("button");
  loadMoreBtn.textContent = "Carregar Mais";
  loadMoreBtn.style.cssText = "display: none; margin: 20px auto; padding: 10px 20px; background-color: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;";
  productList.parentNode.insertBefore(loadMoreBtn, productList.nextSibling);

  // Event Delegation for View More
  productList.addEventListener("click", (e) => {
    if (e.target.classList.contains("view-more-btn")) {
      const productId = parseInt(e.target.getAttribute("data-id"));
      const product = allProducts.find(p => p.id === productId);
      openModal(product);
    }
  });

  function renderBatch() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = currentPage * ITEMS_PER_PAGE;
    const productsToRender = currentFilteredProducts.slice(start, end);

    let productsHTML = "";
    productsToRender.forEach((product, index) => {
      const productCard = `
          <div class="produto fade-in" style="animation-delay: ${index * 0.1}s">
            <img src="${product.image}" alt="${product.name}">
            <h4>${product.name}</h4>
            <button class="view-more-btn" data-id="${product.id}">Ver Mais</button>
          </div>
        `;
      productsHTML += productCard;
    });
    productList.insertAdjacentHTML('beforeend', productsHTML);

    if (currentFilteredProducts.length > end) {
      loadMoreBtn.style.display = "block";
    } else {
      loadMoreBtn.style.display = "none";
    }
  }

  function renderProducts(products) {
    productList.innerHTML = "";
    currentFilteredProducts = products;
    currentPage = 1;

    if (products.length === 0) {
      productList.innerHTML = '<p class="no-results" style="width: 100%; text-align: center; padding: 20px;">Nenhum produto encontrado.</p>';
      loadMoreBtn.style.display = "none";
      return;
    }
    renderBatch();
  }

  loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    renderBatch();
  });

  clearBtn.addEventListener("click", () => {
    searchBar.value = "";
    performSearch();
  });

  // Fetch product data
  showSkeleton();
  fetch("content.json")
    .then(response => response.json())
    .then(data => {
      allProducts = data;
      renderProducts(allProducts);
    });

  // Search functionality
  function performSearch() {
    const query = searchBar.value.toLowerCase();
    clearBtn.style.display = query.length > 0 ? "inline-block" : "none";
    const filteredProducts = allProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    );
    renderProducts(filteredProducts);
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  if (searchButton) {
    searchButton.addEventListener("click", performSearch);
  }

  if (searchBar) {
    searchBar.placeholder = "Pesquisar por nome ou descrição...";
    searchBar.addEventListener("input", debounce(performSearch, 300));
  }

  // Open modal with product details
  function openModal(product) {
    document.getElementById("modal-title").textContent = product.title;
    document.getElementById("modal-size").textContent = product.size;
    document.getElementById("modal-version").textContent = product.version;
    document.getElementById("modal-compatibility").textContent = product.compatibility;
    document.getElementById("modal-description").innerHTML = product.description.replace(/\n/g, '<br>');

    const downloadBtn = document.querySelector(".download-btn");

    // Reset button state
    downloadBtn.classList.remove("downloading");
    downloadBtn.textContent = "Download";
    downloadBtn.disabled = false;

    downloadBtn.onclick = () => {
      downloadBtn.classList.add("downloading");
      downloadBtn.textContent = "Baixando...";
      downloadBtn.disabled = true;
      window.location.href = product.download_link;
    };

    modal.style.display = "block";
  }

  // Close modal
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
});

function scrollToProducts() {
  document.getElementById("produtos").scrollIntoView({
    behavior: "smooth"
  });
}

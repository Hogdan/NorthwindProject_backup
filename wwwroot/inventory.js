document.getElementById("CategoryId").addEventListener("change", (e) => {
  document.getElementById('product_rows').dataset['id'] = e.target.value;
  fetchProducts();
});

document.getElementById('OutOfStock').addEventListener("change", (e) => {
  fetchProducts();
});

document.getElementById('NeedsReorder').addEventListener("change", (e) => {
  fetchProducts();
});

// function to display commas in number
const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
async function fetchProducts() {
  const id = document.getElementById('product_rows').dataset['id'];

  const outOfStock = document.getElementById('OutOfStock').checked ? true : false;
  const needsReorder = document.getElementById('NeedsReorder').checked ? true : false;
  let filter = "";
  if (outOfStock == true && !needsReorder) {
    filter += "/out-of-stock";
  } else if (needsReorder == true && !outOfStock) {
    filter += "/needs-reorder";
  } else if (outOfStock == true && needsReorder == true) {
    filter += "/out-of-stock/needs-reorder";
  }

  const { data: fetchedProducts } = await axios.get(`../../api/category/${id}/product/discontinued/false${filter}`);

  let product_rows = "";
  fetchedProducts.map(product => {
    let css = "";
    if (product.unitsInStock == 0) {
      css += " out-of-stock";
    } else if (product.unitsInStock <= product.reorderLevel) {
      css += " need-reorder";
    }
    product_rows +=
      `<tr class="product${css}" data-id="${product.productId}" data-name="${product.productName}" data-price="${product.unitPrice}" data-category-id="${product.categoryId}" data-quantity-per-unit="${product.quantityPerUnit}" data-units-in-stock="${product.unitsInStock}" data-units-on-order="${product.unitsOnOrder}" data-reorder-level="${product.reorderLevel}">
        <td class="${css}">${product.productName}</td>
        <td class="text-end${css}">${product.unitPrice.toFixed(2)}</td>
        <td class="text-end${css}">${product.quantityPerUnit}</td>
        <td class="text-end${css}">${product.unitsOnOrder}</td>
        <td class="text-end${css}">${product.reorderLevel}</td>
        <td class="text-end${css}">${product.unitsInStock}</td>
      </tr>`;
  });
  document.getElementById('product_rows').innerHTML = product_rows;
}

// delegated event listener
document.getElementById('product_rows').addEventListener("click", (e) => {
  p = e.target.parentElement;
  if (p.classList.contains('product')) {
    e.preventDefault()
      document.getElementById('ProductId').value = p.dataset['id'];
      document.getElementById('ProductName').value = p.dataset['name'];
      document.getElementById('CategoryId').value = p.dataset['categoryId'];
      document.getElementById('QuantityPerUnit').value = p.dataset['quantityPerUnit'];
      document.getElementById('UnitPrice').value = Number(p.dataset['price']).toFixed(2);
      document.getElementById('UnitsInStock').value = p.dataset['unitsInStock'];
      document.getElementById('UnitsOnOrder').value = p.dataset['unitsOnOrder'];
      document.getElementById('ReorderLevel').value = p.dataset['reorderLevel'];
      
      new bootstrap.Modal('#inventoryModal', {}).show();
  }
});
const toast = (header, message) => {
  document.getElementById('toast_header').innerHTML = header;
  document.getElementById('toast_body').innerHTML = message;
  bootstrap.Toast.getOrCreateInstance(document.getElementById('liveToast')).show();
}
document.getElementById('saveProduct').addEventListener("click", (e) => {
  // hide modal
  bootstrap.Modal.getInstance(document.getElementById('inventoryModal')).hide();
  // use axios post to save product changes
  product = {
    "productId": Number(document.getElementById('ProductId').value),
    "productName": document.getElementById('ProductName').value,
    "categoryId": Number(document.getElementById('CategoryId').value),
    "quantityPerUnit": document.getElementById('QuantityPerUnit').value,
    "unitPrice": Number(document.getElementById('UnitPrice').value),
    "unitsInStock": Number(document.getElementById('UnitsInStock').value),
    "unitsOnOrder": Number(document.getElementById('UnitsOnOrder').value),
    "reorderLevel": Number(document.getElementById('ReorderLevel').value),
    "discontinued": false
  }
  postProduct(product);
});
async function postProduct(product) {
  axios.post('../../api/editproduct', product).then(res => {
    toast("Product Updated", `${product.productName} successfully updated.`);
    fetchProducts();
  }).catch(err => {
    toast("Error", `Failed to update product: ${err.response?.data || err.message}`);
  });
}
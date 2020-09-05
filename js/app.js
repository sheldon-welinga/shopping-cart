//Import the modules
// const Products = require("./Products");

/**
 * Select the elements from the html and assign them to variables
 * @param cartBtn - The cart button on top of the page showing the items in the cart
 * @param closecartBtn - The button for closing the cart sidebar/overlay
 * @param clearCartBtn - The button for clearing the cart items in the cart sidebar/overlay
 * @param cartDOM - The cart container/sidebar for holding all items in the cart
 * @param cartOverlay - The overlay page shown when the cart sidebar is open on screen with min-width of 768px
 * @param cartItems -  The total number of items count in the cart
 * @param cartTotal - The total amount of money for all the items in the cart
 * @param cartContent - The cart content holder for items in the cart
 * @param productDOM - The product content container for all the products
 * @param cart - The cart array for the items
 *
 */

const cartBtn = document.getElementById("cart-btn");
const closeCartBtn = document.getElementById("close-cart");
const clearCartBtn = document.getElementById("clear-cart");
const cartDOM = document.getElementById("cart");
const cartOverlay = document.getElementById("cart-overlay");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartContent = document.getElementById("cart-content");
const productDOM = document.getElementById("product");
let cart = [];

//getting the products
class Products {
  async getProduct() {
    try {
      // Get the response for the data
      const response = await fetch("../products.json");

      // convert the response to json file
      const data = await response.json();

      // filter/clean the data that we get back
      const products = data.items.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;

        return { title, price, id, image };
      });

      // return the products
      return products;
    } catch (err) {
      // return the error if any
      console.log(err.message);
    }
  }
}

//display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
      <!-- single product -->
        <article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fa fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
        <!-- End of single product -->
        `;
    });

    productDOM.innerHTML = result;
  }
}

//local storage
class Storage {
  //save a product to local storage first
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
}

//events kicker
document.addEventListener("DOMContentLoaded", async (e) => {
  const ui = new UI();
  const products = new Products();

  //get all products
  const productsItems = await products.getProduct();

  // diplay the products
  ui.displayProducts(productsItems);

  //save the product
  Storage.saveProducts(productsItems);
});

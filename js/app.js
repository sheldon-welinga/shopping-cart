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
let buttonsDOM = [];

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

//display all products on the DOM under the products section
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

  /**
   * @param id - The id of each product
   * @param inCart - Check if the item is already in the cart and return either true or false
   * @param cartItem - The item in the cart
   * @param itemTotalCount - The number of items of that product in the cart
   *
   */

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;

    buttons.forEach((btn) => {
      const id = btn.dataset.id;
      //   console.log(id);
      const inCart = cart.find((item) => item.id === id);

      if (inCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }

      btn.addEventListener("click", (e) => {
        //   console.log(e.target);
        e.target.innerText = "In Cart";
        e.target.disabled = true;

        //get single product from all products
        const cartItem = { ...Storage.getProduct(id), itemTotalCount: 1 };

        //add product to the cart
        cart = [...cart, cartItem];

        //save the cart in localStorage
        Storage.saveCart(cart);

        // set cart values
        this.setCartValues(cart);

        // add/display cart item
        this.addcartItem(cartItem);

        //show the cart and overlay
        this.showCart();
      });
    });
  }

  // set values in the cart to show in the shopping DOM
  setCartValues(cart) {
    /**
     * @param tempTotal - The total for the amount of the items i.e. price * totalNumberOfItems
     * @param itemsTotal - The item total number being added in the cart
     */

    let tempTotal = 0;
    let itemsTotal = 0;

    cart.map((item) => {
      tempTotal += item.price * item.itemTotalCount;
      itemsTotal += item.itemTotalCount;
    });

    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;

    // console.log(cartTotal, cartItems);
  }

  // add an item into the cart
  addcartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
        <img src=${item.image} alt="product" />
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>Remove Item</span>
        </div>
        <div>
            <i class="fa fa-chevron-up" data-id=${item.id}></i>
            <p class="item-count">${item.itemTotalCount}</p>
            <i class="fa fa-chevron-down" data-id=${item.id}></i>
        </div>
    `;

    cartContent.appendChild(div);
    // console.log(cartContent);
  }

  //show the cart sidebar
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  // hide the cart sidebar
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  // get specific button used to add item into the cart
  getSingleButton(id) {
    return buttonsDOM.find((btn) => btn.dataset.id === id);
  }

  //remove item(s) from the cart
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);

    const btn = this.getSingleButton(id);
    btn.disabled = false;
    btn.innerHTML = `<i class="fa fa-shopping-cart"></i> add to cart`;
  }

  //clear the entire cart to default nothing
  clearCart() {
    /**
     * @param cartItems - The id of items in the cart
     */
    const cartItems = cart.map((item) => item.id);

    cartItems.forEach((id) => this.removeItem(id));
    // console.log(cartContent.children);

    //clear the DOM with the cart content
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }

    //hide the cart
    this.hideCart();
  }

  // set up the app to display according to the current contents in the storage and functionalities
  setupApp() {
    cart = Storage.getCart();
    // console.log(cart);
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  // display all items in the cart
  populateCart(cart) {
    cart.forEach((item) => this.addcartItem(item));
  }

  cartLogic() {
    //clear cart items using the clear cart button
    clearCartBtn.addEventListener("click", () => this.clearCart());

    //cart functionality for removeItem, increase item(arrow up) or decrease item (arrow down)
    cartContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item")) {
        /**
         * @param itemId - The id of the dataset value for the item i.e. data-id
         * @param cartItem - The parent element that the button is located in
         */

        const itemId = e.target.dataset.id;
        // removes item from the cart
        this.removeItem(itemId);

        //remove item from the DOM
        const cartItem = e.target.parentElement.parentElement;
        cartContent.removeChild(cartItem);
      }

      if (e.target.classList.contains("fa-chevron-up")) {
        /**
         * @param addItemCountId - The id of the dataset value for the item i.e. data-id
         * @param tempItem - The found element containing the id
         */

        const addItemCountId = e.target.dataset.id;
        let tempItem = cart.find((item) => item.id === addItemCountId);

        //increment the tempItem count
        tempItem.itemTotalCount += 1;

        //Save the  cart item in the local storage
        Storage.saveCart(cart);

        //update the cart values
        this.setCartValues(cart);

        //update the actual value of the count
        e.target.nextElementSibling.innerText = tempItem.itemTotalCount;
      }

      if (e.target.classList.contains("fa-chevron-down")) {
        /**
         * @param lowerItemCountId - The id of the dataset value for the item i.e. data-id
         * @param tempItem - The found element containing the id
         * @param cartItem - The parent element that the button is located in
         */

        const lowerItemCountId = e.target.dataset.id;
        const cartItem = e.target.parentElement.parentElement;
        let tempItem = cart.find((item) => item.id === lowerItemCountId);

        //decrease the tempItem count
        tempItem.itemTotalCount -= 1;

        // check if the count is less than 0 and remove from the dom and storage
        if (tempItem.itemTotalCount <= 0) {
          cartContent.removeChild(cartItem);
          this.removeItem(lowerItemCountId);
        }

        //else reduce the count of the item and save it in the localStorage
        Storage.saveCart(cart);
        this.setCartValues(cart);
        e.target.previousElementSibling.innerText = tempItem.itemTotalCount;
      }
    });
  }
}

//local storage
class Storage {
  //save a product to local storage first
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    const products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

//events kicker
document.addEventListener("DOMContentLoaded", async (e) => {
  const ui = new UI();
  const products = new Products();

  //setup application
  await ui.setupApp();

  //get all products
  const productsItems = await products.getProduct();

  // diplay the products
  await ui.displayProducts(productsItems);

  //save the product
  await Storage.saveProducts(productsItems);

  //get bag buttons
  await ui.getBagButtons();

  // toggle between cart amount values
  await ui.cartLogic();
});

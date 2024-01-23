// ==UserScript==
// @name         GC - Remove the Add Item to Wishlist option from shops
// @namespace    https://www.grundos.cafe/
// @version      1.0
// @description  Remove the Add item to wishlist option from shops when the item is already on the wishlist. For Grundo's Cafe.
// @author       Teffy
// @match        https://www.grundos.cafe/viewshop/?shop_id=*
// @match        https://grundos.cafe/viewshop/?shop_id=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=grundos.cafe
// @grant        none
// @license      MIT
// @downloadURL  https://update.greasyfork.org/scripts/485470/GC%20-%20Remove%20the%20Add%20Item%20to%20Wishlist%20option%20from%20shops.user.js
// @updateURL    https://update.greasyfork.org/scripts/485470/GC%20-%20Remove%20the%20Add%20Item%20to%20Wishlist%20option%20from%20shops.meta.js
// ==/UserScript==

// Function to convert text to HTML
const textToHTML = (text) => new DOMParser().parseFromString(text, "text/html");

// Function to get wishlist items
const getWishlistItems = (node = document) => {
    const allItems = node.querySelectorAll('.data');
    const wishlistItems = [];
    
    allItems.forEach((divElement) => {
        const itemName = divElement.querySelector('strong:not([class])');
        itemName && wishlistItems.push(itemName.textContent.trim());
    });
    
    return wishlistItems;
};

// Function to fetch wishlist items
const getWishlistItemsAsync = () =>
  fetch("/wishlist/edit/")
    .then((res) => res.text())
    .then(textToHTML)
    .then(getWishlistItems);

// Function to find the option to remove based on the item name
function findOptionToRemove(itemName) {
    const searchHelpLinks = document.querySelectorAll('.searchhelp a[title="Add Item To Wishlist"]');
    
    for (const link of searchHelpLinks) {
        const itemNameInLink = link.closest('.searchhelp').previousElementSibling.querySelector('strong').textContent.trim();
        if (itemNameInLink === itemName) {
            return link;
        }
    }

    return null;
}

// Main function to check and remove the "Add Item To Wishlist" option
function main(wishlistItems) {
    const itemsInHTML = Array.from(document.querySelectorAll('.item-info strong'), element => element.textContent.trim());
    
    itemsInHTML.forEach((itemNameHTML) => {
        const normalizedHTML = itemNameHTML.toLowerCase().replace(/\s/g, ''); // Convert to lowercase and remove whitespace
        const isWishlistItemPresent = wishlistItems.some((wishlistItem) => wishlistItem.toLowerCase().replace(/\s/g, '') === normalizedHTML);
        
        if (isWishlistItemPresent) {
            const optionToRemove = findOptionToRemove(itemNameHTML);
            optionToRemove && optionToRemove.parentNode.removeChild(optionToRemove);
        }
    });
}

// Execute the main function after fetching wishlist items
getWishlistItemsAsync().then(main);
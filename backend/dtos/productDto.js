function toProductResponse(product) {
    if (!product) return null;
    return {
        ...product,
        precio: parseFloat(product.precio)
    };
}

function toProductsResponse(products) {
    if (!products) return [];
    return products.map(toProductResponse);
}

module.exports = { toProductResponse, toProductsResponse };

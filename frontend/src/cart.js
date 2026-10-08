export const shippingFor = subtotal => subtotal === 0 || subtotal >= 1999 ? 0 : 99;
export function addItem(cart, product, quantity = 1) {
 const existing = cart.find(x => x.id === product.id);
 return existing ? cart.map(x => x.id === product.id ? {...x, quantity: Math.min(x.quantity + quantity, product.stock)} : x) : [...cart, {id: product.id, quantity: Math.min(quantity, product.stock)}];
}
export function cartTotal(cart, products) {
 return cart.reduce((sum, line) => sum + (products.find(p => p.id === line.id)?.price || 0) * line.quantity, 0);
}

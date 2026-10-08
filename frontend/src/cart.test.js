import test from 'node:test';
import assert from 'node:assert/strict';
import { addItem, cartTotal, shippingFor } from './cart.js';
test('repeated additions consolidate and respect available stock', () => {
 const p = {id:1, stock:2}; let cart = addItem([], p); cart = addItem(cart,p); cart = addItem(cart,p);
 assert.deepEqual(cart, [{id:1, quantity:2}]);
});
test('totals use catalogue prices and free shipping threshold', () => {
 assert.equal(cartTotal([{id:1,quantity:2},{id:2,quantity:1}], [{id:1,price:1000},{id:2,price:499}]),2499);
 assert.equal(shippingFor(1999),0); assert.equal(shippingFor(1998),99); assert.equal(shippingFor(0),0);
});
test('detail-page quantities are added together and capped against stock', () => {
 const p={id:1,stock:5};
 assert.deepEqual(addItem([],p,3),[{id:1,quantity:3}]);
 assert.deepEqual(addItem([{id:1,quantity:3}],p,4),[{id:1,quantity:5}]);
});

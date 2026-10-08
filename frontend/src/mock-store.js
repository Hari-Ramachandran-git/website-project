import products from './data/products.json' with { type: 'json' };
import { shippingFor } from './cart.js';

export { products };
const emailIsValid = email => typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// This adapter is entirely local: it never calls an API or retains delivery details.
export function createDemoOrder({customer,items}) {
 if (!customer || typeof customer.name !== 'string' || customer.name.trim().length < 2 || customer.name.length > 100 ||
     !emailIsValid(customer.email) || !/^\d{10}$/.test(customer.phone || '') ||
     typeof customer.address !== 'string' || customer.address.trim().length < 5 || customer.address.length > 300 ||
     typeof customer.city !== 'string' || !customer.city.trim() || customer.city.length > 100 || !/^[1-9]\d{5}$/.test(customer.postalCode || ''))
  throw new Error('Please check your name, email, phone number, delivery address and PIN code.');
 if (!Array.isArray(items) || !items.length || items.length > 20 || new Set(items.map(i=>i.id)).size !== items.length)
  throw new Error('Please add a saree to your bag before checking out.');
 const lines=items.map(item=>{
  const product=products.find(p=>p.id===item.id);
  if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > Math.min(product.stock,20))
   throw new Error('A bag item is unavailable or exceeds its quantity limit. Please review your bag.');
  return {id:product.id,name:product.name,unitPrice:product.price,quantity:item.quantity};
 });
 const subtotal=lines.reduce((sum,item)=>sum+item.unitPrice*item.quantity,0);
 const shipping=shippingFor(subtotal);
 return {id:`OMS-DEMO-${globalThis.crypto.randomUUID().slice(0,8).toUpperCase()}`,createdAt:new Date().toISOString(),items:lines,subtotal,shipping,total:subtotal+shipping,status:'Demo confirmed',demo:true};
}

const pause = () => new Promise(resolve=>setTimeout(resolve,400));
function browserStorage(){try{return globalThis.localStorage;}catch{return null;}}
export async function submitDemoOrder(request,storage=browserStorage()) {
 const receipt=createDemoOrder(request);
 await pause();
 // Only the receipt is saved. Names, email, phone and address are never persisted.
 try { storage?.setItem('oms-last-demo-order',JSON.stringify(receipt)); } catch { /* private browsing / quota */ }
 return receipt;
}
export async function subscribeDemo(email,storage=browserStorage()) {
 if (!emailIsValid(email)) throw new Error('Please enter a valid email address.');
 await pause();
 try { storage?.setItem('oms-demo-newsletter','joined'); } catch { /* interaction still works in memory */ }
 return {demo:true,message:'Demo signup complete. No emails will be sent.'};
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoOrder, submitDemoOrder, subscribeDemo } from './mock-store.js';
const customer={name:'Demo Customer',email:'demo@example.com',phone:'9876543210',address:'123 Sample Street',city:'Chennai',postalCode:'600001'};
const request={customer,items:[{id:1,quantity:2,price:1}]};
test('mock checkout uses catalogue prices and excludes personal details from receipts',()=>{
 const receipt=createDemoOrder(request);
 assert.equal(receipt.total,12980);assert.equal(receipt.shipping,0);assert.equal(receipt.demo,true);
 assert.match(receipt.id,/^OMS-DEMO-/);assert.equal(receipt.items[0].unitPrice,6490);
 for(const value of Object.values(customer))assert.ok(!JSON.stringify(receipt).includes(value));
});
test('mock checkout rejects invalid details, quantities, duplicates and unknown items',()=>{
 assert.throws(()=>createDemoOrder({customer:{...customer,postalCode:'123'},items:request.items}));
 for(const items of [[],[{id:1,quantity:99}],[{id:999,quantity:1}],[{id:1,quantity:1.5}],[{id:1,quantity:1},{id:1,quantity:1}]])assert.throws(()=>createDemoOrder({customer,items}));
});
test('checkout and newsletter work without network requests or persisted email',async()=>{
 const original=globalThis.fetch;globalThis.fetch=()=>{throw new Error('Mock mode must not call an API');};
 const saved=new Map(),storage={setItem:(key,value)=>saved.set(key,value)};
 try{
  const receipt=await submitDemoOrder(request,storage);
  assert.equal(JSON.parse(saved.get('oms-last-demo-order')).id,receipt.id);
  await subscribeDemo(customer.email,storage);assert.equal(saved.get('oms-demo-newsletter'),'joined');
  assert.ok(!JSON.stringify([...saved.values()]).includes(customer.email));
  await assert.rejects(subscribeDemo('invalid',storage));
 }finally{globalThis.fetch=original;}
});
test('blocked browser storage does not prevent simulated checkout',async()=>{
 const storage={setItem(){throw new Error('Storage is blocked');}};
 assert.equal((await submitDemoOrder(request,storage)).demo,true);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clearFilters, selectProducts } from './catalogue.js';
const products=JSON.parse(readFileSync(new URL('./data/products.json',import.meta.url)));
test('reset filters preserves the search and sort choices',()=>{
 const params=new URLSearchParams('search=silk&sort=low&category=Silk&occasion=Wedding&color=Rose&price=under4000');
 assert.equal(clearFilters(params).toString(),'search=silk&sort=low');
 assert.equal(params.get('category'),'Silk');
});
test('search matches occasions and materials as well as saree names',()=>{
 assert.equal(selectProducts(products,{search:' wedding '}).length,2);
 assert.equal(selectProducts(products,{search:'art silk'}).length,2);
 assert.equal(selectProducts(products,{search:'emerald'}).length,2);
});
test('draft mobile filters count the same products as the committed selection',()=>{
 const result=selectProducts(products,{color:'Emerald',price:'under4000',sort:'low'});
 assert.deepEqual(result.map(p=>p.id),[6]);
 assert.equal(selectProducts(products,{category:'Banarasi'},[3]).length,1);
});

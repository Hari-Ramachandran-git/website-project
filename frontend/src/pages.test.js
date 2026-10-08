import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createServer } from 'vite';
const products=JSON.parse(readFileSync(new URL('./data/products.json',import.meta.url)));
test('every saree has a renderable dedicated detail page; invalid IDs have a recovery link',async()=>{
 const vite=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',optimizeDeps:{noDiscovery:true,include:[]}});
 try{
  const {SareePage,productUrl}=await vite.ssrLoadModule('/src/StorePages.jsx');
  const props={products,wishlist:[],cart:[],toggleWish(){},add(){},buyNow(){}};
  const render=url=>renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:[url]},React.createElement(Routes,null,React.createElement(Route,{path:'/sarees/:id/:slug?',element:React.createElement(SareePage,props)}))));
  for(const p of products){const html=render(productUrl(p));assert.ok(html.includes(p.name));assert.ok(html.includes('ADD TO BAG'));assert.ok(html.includes(p.length));assert.ok(html.includes('You may also fall in love with'));}
  assert.ok(render('/sarees/999/unknown').includes('This drape isn’t in our collection.'));
 }finally{await vite.close();}
});
test('catalogue query filters select the correct products and wishlist is a separate selection',async()=>{
 const vite=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',optimizeDeps:{noDiscovery:true,include:[]}});
 try{
  const {CataloguePage}=await vite.ssrLoadModule('/src/StorePages.jsx');
  const render=(url,wishlistOnly=false)=>renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:[url]},React.createElement(CataloguePage,{products,wishlist:[3],wishlistOnly,toggleWish(){},add(){}})));
  const full=render('/sarees');assert.equal((full.match(/class="product"/g)||[]).length,6);
  const emerald=render('/sarees?color=Emerald&price=under4000');assert.ok(emerald.includes('Emerald Evening'));assert.ok(!emerald.includes('The Maragatham Edit'));
  const wishlist=render('/wishlist',true);assert.ok(wishlist.includes('Gulabi Banarasi'));assert.ok(!wishlist.includes('The Kumkum Silk'));
  assert.ok(render('/sarees?search=missing-saree').includes('No sarees found.'));
 }finally{await vite.close();}
});

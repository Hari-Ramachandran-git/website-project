export function selectProducts(products, filters={}, wishlist=null) {
 const {category='All Sarees',occasion='All',color='All',price='All',sort='featured',search=''}=filters;
 const result=products.filter(p=>(!wishlist||wishlist.includes(p.id))&&(category==='All Sarees'||p.category===category)&&(occasion==='All'||p.occasion===occasion)&&(color==='All'||p.color===color)&&(price==='All'||(price==='under4000'?p.price<4000:p.price>=4000))&&`${p.name} ${p.category} ${p.color} ${p.material} ${p.occasion}`.toLowerCase().includes(search.trim().toLowerCase()));
 if(sort==='low')result.sort((a,b)=>a.price-b.price);if(sort==='high')result.sort((a,b)=>b.price-a.price);
 return result;
}
export function clearFilters(params) {
 const next=new URLSearchParams(params);for(const key of ['category','occasion','color','price'])next.delete(key);return next;
}

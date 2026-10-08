import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export function Overlay({children,title,close,drawer=false,sheet=false,className=''}) {
 const ref=useRef(null),closeRef=useRef(close);closeRef.current=close;
 useEffect(()=>{
  const previous=document.activeElement,old=document.body.style.overflow;
  document.body.style.overflow='hidden';
  const backgrounds=[];
  for(let current=ref.current.parentElement;current&&current!==document.body;current=current.parentElement){for(const sibling of current.parentElement?.children||[]){if(sibling!==current){backgrounds.push([sibling,sibling.inert]);sibling.inert=true;}}}
  const node=ref.current;
  const initial=node.querySelector('[data-autofocus]');
  (initial||node).focus();
  const handle=e=>{
   if(e.key==='Escape'){e.preventDefault();closeRef.current();}
   if(e.key==='Tab'){
    const items=[...node.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]')].filter(el=>el.getClientRects().length>0);
    const first=items[0],last=items.at(-1);
    if(!first){e.preventDefault();node.focus();}
    else if(e.shiftKey&&(document.activeElement===first||document.activeElement===node)){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===node)){e.preventDefault();first.focus();}
   }
  };
  document.addEventListener('keydown',handle);
  return()=>{document.body.style.overflow=old;for(const [element,inert] of backgrounds)element.inert=inert;document.removeEventListener('keydown',handle);if(previous?.isConnected)previous.focus({preventScroll:true});else document.querySelector('header .bag-button')?.focus({preventScroll:true});};
 },[title]);
 return <div className={`overlay ${sheet?'sheet-overlay':''}`} onClick={e=>e.target===e.currentTarget&&closeRef.current()}><section ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={`dialog ${drawer?'drawer':''} ${sheet?'bottom-sheet':''} ${className}`}><button className="icon close" onClick={()=>closeRef.current()} aria-label="Close dialog"><X/></button>{children}</section></div>;
}

(() => {
 document.querySelectorAll('.answer').forEach((answer,index)=>{
  const button=document.createElement('button');button.type='button';button.className='answer-toggle';button.textContent='Reveal answer';
  answer.id=answer.id||`answer-${index}`;button.setAttribute('aria-controls',answer.id);button.setAttribute('aria-expanded','false');answer.hidden=true;answer.before(button);
  button.addEventListener('click',()=>{answer.hidden=!answer.hidden;button.textContent=answer.hidden?'Reveal answer':'Hide answer';button.setAttribute('aria-expanded',String(!answer.hidden));window.Reveal?.layout();});
 });
 document.querySelectorAll('.duckdash-link').forEach(link=>{const url=new URL(window.WEEK4_DUCKDASH_URL||'https://josephpb.github.io/2026-sdpa/additional_materials/duckdash/',location.href);url.searchParams.set('stage',link.dataset.stage||'1');link.href=url.href;link.target='duckdash';});
 document.querySelectorAll('[data-faq-link]').forEach(link=>{if(window.WEEK4_FAQ_URL){link.href=window.WEEK4_FAQ_URL;link.textContent='Open this week’s FAQs';link.target='_blank';link.rel='noopener';}else{link.removeAttribute('href');link.textContent='FAQ link to be added';link.setAttribute('aria-disabled','true');}});
})();

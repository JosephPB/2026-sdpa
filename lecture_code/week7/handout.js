// Student exercise boards retain the prompt, without an answer-reveal action.
if(new URLSearchParams(location.search).get('handout')==='1'){
 const quizModes=new Set(['slice2','slice3','broadcast','mask','group','aggregate']);
 if(quizModes.has(new URLSearchParams(location.search).get('mode'))){
  const lock=()=>document.querySelectorAll('button').forEach(button=>{
   if(/^(Slice|Reveal|Next step|Next calculation)/.test(button.textContent.trim())){
    button.disabled=true;button.hidden=true;
   }
  });
  new MutationObserver(lock).observe(document.body,{childList:true,subtree:true});lock();
 }
}

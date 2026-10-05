(() => {
  document.querySelectorAll('.answer').forEach((answer, index) => {
    const button=document.createElement('button');
    button.type='button'; button.className='answer-toggle';button.textContent='Reveal answer';
    answer.id=answer.id||`answer-${index}`;button.setAttribute('aria-controls',answer.id);
    button.setAttribute('aria-expanded','false');answer.hidden=true;answer.before(button);
    button.addEventListener('click',()=>{
      answer.hidden=!answer.hidden;button.textContent=answer.hidden?'Reveal answer':'Hide answer';
      button.setAttribute('aria-expanded',String(!answer.hidden));window.Reveal?.layout();
    });
  });
})();

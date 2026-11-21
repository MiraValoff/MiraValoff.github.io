(function(){
  'use strict';
  const form = document.querySelector('#brief-form');
  const output = document.querySelector('#result');
  const status = document.querySelector('#status');
  const copy = document.querySelector('#copy');
  const download = document.querySelector('#download');
  let generated = null;
  function renderError(message) {
    status.textContent = message;
    status.className = 'error';
    output.textContent = 'Complete the fields to build an exportable draft.';
    generated = null;
    copy.disabled = true;
    download.disabled = true;
  }
  function gather() {
    return Object.fromEntries(new FormData(form).entries());
  }
  form.addEventListener('submit', function(event){
    event.preventDefault();
    try {
      generated = window.BriefKit.createBrief(gather());
      output.textContent = window.BriefKit.toText(generated);
      status.textContent = 'Draft ready. Nothing was uploaded; review the details before sharing.';
      status.className = 'ok';
      copy.disabled = false;
      download.disabled = false;
    } catch(err) { renderError(err.message || 'Invalid form data.'); }
  });
  form.addEventListener('input', function(){
    if(generated) { generated=null; copy.disabled=true; download.disabled=true; status.textContent='Fields changed. Generate a fresh draft before exporting.'; status.className=''; }
  });
  copy.addEventListener('click', async function(){
    if(!generated) return;
    const text=window.BriefKit.toText(generated);
    try { await navigator.clipboard.writeText(text); status.textContent='Draft copied.'; status.className='ok'; }
    catch(_) { status.textContent='Clipboard is not available in this browser. Select and copy the draft text manually.'; status.className='error'; }
  });
  download.addEventListener('click', function(){
    if(!generated) return;
    const file = new Blob([JSON.stringify(generated,null,2)+'\n'], {type:'application/json'});
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href=url; a.download=window.BriefKit.safeFilename(generated.project);
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  });
})();

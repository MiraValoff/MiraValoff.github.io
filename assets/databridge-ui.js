(function(){
  'use strict';
  const csv=document.getElementById('csv'), result=document.getElementById('json'), status=document.getElementById('status'),summary=document.getElementById('summary'),download=document.getElementById('download');
  let parsed=null;
  function invalidate(){parsed=null;download.disabled=true;status.textContent='Input changed. Run validation again before exporting.';status.className='';}
  csv.addEventListener('input',invalidate);
  document.getElementById('form').addEventListener('submit',function(event){
    event.preventDefault();
    try{
      parsed=window.DataBridge.parseCSV(csv.value);
      result.textContent=window.DataBridge.toJSON(parsed);
      summary.textContent=`${parsed.meta.row_count} data rows · ${parsed.meta.column_count} columns · ${parsed.meta.empty_cell_count} empty cells`;
      status.textContent='CSV validated. Review the preview and download the JSON when ready.';
      status.className='ok'; download.disabled=false;
    }catch(e){parsed=null;result.textContent='Correct the CSV input and try again.';summary.textContent='No valid dataset';status.textContent=e.message || 'CSV is invalid.';status.className='error';download.disabled=true;}
  });
  download.addEventListener('click',function(){
    if(!parsed)return;
    const blob=new Blob([window.DataBridge.toJSON(parsed)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='databridge-export.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  document.getElementById('example').addEventListener('click',function(){
    csv.value='name,email,source,budget_usd\n"Morgan, Taylor",morgan@example.org,web,1200\nCasey,casey@example.org,referral,700';invalidate();
  });
})();

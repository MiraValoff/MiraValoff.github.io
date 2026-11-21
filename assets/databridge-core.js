/* Mira Val DataBridge — standalone, zero-network, bounded CSV to JSON converter. */
(function (host) {
  'use strict';
  const MAX_INPUT = 262144; // number of UTF-16 code units, not byte exact
  const MAX_ROWS = 500;
  const MAX_COLUMNS = 40;
  const MAX_FIELD_LENGTH = 8192;
  function parseCSV(input) {
    if (typeof input !== 'string') throw new Error('Input must be CSV text.');
    if (input.length > MAX_INPUT) throw new Error('CSV exceeds the 256 KiB character limit.');
    const text = input.replace(/^\uFEFF/, '');
    if (!text.trim()) throw new Error('Paste CSV including a header row.');
    const records=[]; let row=[], field='', quoted=false, finishedQuote=false, atFieldStart=true;
    for(let i=0;i<text.length;i++){
      const ch=text[i];
      if(quoted){
        if(ch==='"') {if(text[i+1]==='"'){field+='"';i++;}else {quoted=false;finishedQuote=true;} }
        else field+=ch;
      }else if(finishedQuote){
        if(ch===','){row.push(field);field='';atFieldStart=true;finishedQuote=false;}
        else if(ch==='\n' || ch==='\r'){row.push(field);records.push(row);row=[];field='';atFieldStart=true;finishedQuote=false;if(ch==='\r'&&text[i+1]==='\n')i++;}
        else throw new Error(`Unexpected character after closing quote at offset ${i+1}.`);
      }else if(ch==='"'){
        if(!atFieldStart)throw new Error(`Unexpected quote at offset ${i+1}.`);
        quoted=true;atFieldStart=false;
      }else if(ch===','){
        row.push(field);field='';atFieldStart=true;
      }else if(ch==='\n'||ch==='\r'){
        row.push(field);records.push(row);row=[];field='';atFieldStart=true;
        if(ch==='\r'&&text[i+1]==='\n')i++;
      }else {field+=ch;atFieldStart=false;}
      if(field.length>MAX_FIELD_LENGTH)throw new Error('A CSV cell exceeds the maximum field length.');
      if(row.length>=MAX_COLUMNS)throw new Error('CSV exceeds 40 columns.');
      if(records.length>MAX_ROWS+1)throw new Error('CSV exceeds 500 data rows.');
    }
    if(quoted)throw new Error('CSV contains an unclosed quoted field.');
    if(row.length || field.length || finishedQuote || !atFieldStart){row.push(field);records.push(row);}
    // An input ending in newline is already complete; avoid a phantom empty final row.
    if(records.length<2)throw new Error('Include a header row and at least one data row.');
    const headers=records.shift().map((x)=>x.trim());
    if(headers.length>MAX_COLUMNS)throw new Error('CSV exceeds 40 columns.');
    if(headers.some(h=>!h))throw new Error('Headers cannot be empty.');
    if(headers.some(h=>['__proto__','constructor','prototype'].includes(h.toLowerCase())))throw new Error('Reserved header name. Rename the column before exporting.');
    if(new Set(headers.map(h=>h.toLocaleLowerCase('en-US'))).size!==headers.length)throw new Error('Duplicate headers are not allowed.');
    if(records.length>MAX_ROWS)throw new Error('CSV exceeds 500 data rows.');
    const output=records.map((fields,index)=>{
      if(fields.length!==headers.length)throw new Error(`Row ${index+2} has ${fields.length} fields; expected ${headers.length}.`);
      return Object.fromEntries(headers.map((h,i)=>[h,fields[i]]));
    });
    return {format:'mira-val.databridge.v1',columns:headers,rows:output,meta:{row_count:output.length,column_count:headers.length,empty_cell_count:output.reduce((n,obj)=>n+headers.filter(h=>obj[h]==='').length,0),warning:'Values remain strings; review types and sensitive data before sharing.'}};
  }
  function toJSON(parsed) {
    if (!parsed || !Array.isArray(parsed.rows)) throw new Error('No parsed data.');
    return JSON.stringify(parsed,null,2)+'\n';
  }
  const api=Object.freeze({parseCSV,toJSON,MAX_INPUT,MAX_ROWS,MAX_COLUMNS});
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else host.DataBridge=api;
})(typeof window!=='undefined'?window:globalThis);

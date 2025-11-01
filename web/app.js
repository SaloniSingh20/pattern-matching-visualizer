// app.js — interactive visualizer logic for KMP and Boyer-Moore
(function(){
  const el = id => document.getElementById(id);
  const textEl = el('text');
  const patEl = el('pattern');
  const alignment = el('alignment');
  const tables = el('tables');
  // const logArea = el('logArea');
  const speed = el('speed');
  const stepsList = el('stepsList');

  let state = null;
  let timer = null;

  function log(msg){}
  function addStep(msg) {
    if (!stepsList) return;
    const li = document.createElement('li');
    li.textContent = msg;
    stepsList.appendChild(li);
    stepsList.scrollTop = stepsList.scrollHeight;
  }

  // Build LPS (KMP)
  function computeLPS(p){
    const m = p.length; const lps = new Array(m).fill(0);
    let len = 0, i = 1;
    while(i < m){
      if(p[i] === p[len]){ lps[i++] = ++len; }
      else { if(len !== 0) len = lps[len-1]; else lps[i++] = 0; }
    }
    return lps;
  }

  // Build bad character table for BM: badChar[c] = pattern.length - 1 - index of c in pattern (rightmost occurrence)
  function buildBadChar(p){
    const badChar = {};
    for(let i=0;i<p.length;++i) badChar[p[i]] = p.length - 1 - i;
    return badChar;
  }

  // Render tables
  function renderTablesForKMP(p){
    const lps = computeLPS(p);
    tables.innerHTML = '';
    const t = document.createElement('table');
    const h = document.createElement('thead');
    const hr = document.createElement('tr'); hr.innerHTML = '<th>Index</th>' + p.split('').map((c,i)=>`<th>${i}</th>`).join('');
    const hv = document.createElement('tr'); hv.innerHTML = '<th>Char</th>' + p.split('').map(c=>`<th>${c}</th>`).join('');
    const vr = document.createElement('tr'); vr.innerHTML = '<th>LPS</th>' + lps.map(v=>`<td>${v}</td>`).join('');
    t.appendChild(hr); t.appendChild(hv); t.appendChild(vr);
    tables.appendChild(t);
  }

  function renderTablesForBM(p){
    const badChar = buildBadChar(p);
    tables.innerHTML = '';
    const t = document.createElement('table');
    const keys = Object.keys(badChar).sort();
    const hr = document.createElement('tr'); hr.innerHTML = '<th>Char</th>' + keys.map(k=>`<th>${k}</th>`).join('');
    const vr = document.createElement('tr'); vr.innerHTML = '<th>BadChar</th>' + keys.map(k=>`<td>${badChar[k]}</td>`).join('');
    t.appendChild(hr); t.appendChild(vr); tables.appendChild(t);
  }

  // Visual alignment helper
  function renderAlignment(text, pat, shift, compIdx, patIdx, matched){
    // Build text line
    const tline = document.createElement('div');
    for(let i=0;i<text.length;i++){
      const span = document.createElement('span'); span.textContent = text[i];
      if(i === compIdx) span.className = matched ? 'char-match' : 'char-miss';
      if(i >= shift && i < shift + pat.length) span.classList.add('highlight-text');
      tline.appendChild(span);
    }

    // Build pattern line
    const pline = document.createElement('div'); pline.className='pattern';
    const left = ' '.repeat(Math.max(0, shift));
    // render with monospace-like spacing using spans
    for(let i=0;i<shift;i++){ const sp=document.createElement('span'); sp.textContent=' '; pline.appendChild(sp); }
    for(let j=0;j<pat.length;j++){ const sp=document.createElement('span'); sp.textContent=pat[j]; if(j===patIdx) sp.className = matched ? 'char-match' : 'char-miss'; pline.appendChild(sp);} 

    alignment.innerHTML = '';
    alignment.appendChild(tline); alignment.appendChild(pline);
  }

  // KMP state machine
  function makeKMP(text, pat){
    return {
      text, pat, n:text.length, m:pat.length,
      lps: computeLPS(pat), i:0, j:0, comparisons:0, finished:false, found: []
    };
  }

  function stepKMP(s){
    if(s.finished) return;
    const {text,pat} = s;
    if(s.i >= s.n) { s.finished = true; log('KMP finished'); addStep('KMP finished'); return; }
    const match = text[s.i] === pat[s.j]; s.comparisons++;
    renderAlignment(text, pat, s.i - s.j, s.i, s.j, match);
    const stepMsg = `Compare text[${s.i}]='${text[s.i]}' with pat[${s.j}]='${pat[s.j]}' → ${match? 'MATCH' : 'MISMATCH'}`;
    log(stepMsg);
    addStep(stepMsg);
    if(match){
      s.i++; s.j++;
      if(s.j === s.m){
        const idx = s.i - s.j;
        const foundMsg = `Pattern found at index ${idx}`;
        log(foundMsg); addStep(foundMsg);
        s.found.push(idx); s.j = s.lps[s.j-1];
      }
    } else {
      if(s.j !== 0) s.j = s.lps[s.j-1]; else s.i++;
    }
  }

  // Boyer-Moore bad-character step
  function makeBM(text, pat){
    return { text, pat, n:text.length, m:pat.length, badChar: buildBadChar(pat), s:0, comparisons:0, finished:false, found: [] };
  }

  function stepBM(s){
    if(s.finished) return;
    if(s.s > s.n - s.m){ s.finished = true; log('BM finished'); addStep('BM finished'); return; }
    // If not in the middle of a shift, start at rightmost
    if(s.j === undefined || s.j < 0 || s.j >= s.m) s.j = s.m - 1;
    const compIdx = s.s + s.j;
    // Out of bounds (should not happen)
    if(compIdx >= s.n) { s.finished = true; log('BM finished'); addStep('BM finished'); return; }
    const match = s.pat[s.j] === s.text[compIdx]; s.comparisons++;
    renderAlignment(s.text, s.pat, s.s, compIdx, s.j, match);
    const stepMsg = `Compare text[${compIdx}]='${s.text[compIdx]}' with pat[${s.j}]='${s.pat[s.j]}' → ${match? 'MATCH' : 'MISMATCH'}`;
    log(stepMsg);
    addStep(stepMsg);
    if(match){
      s.j--;
      if(s.j < 0){
        const foundMsg = `Pattern found at index ${s.s}`;
        log(foundMsg); addStep(foundMsg);
        s.found.push(s.s);
        // Shift pattern for next possible match
        const nextCharIdx = s.s + s.m;
        let shift = 1;
        if(nextCharIdx < s.n){
          const bc = (s.badChar[s.text[nextCharIdx]] ?? s.m);
          shift = s.m - bc;
        }
        s.s += shift;
        s.j = s.m - 1;
      }
    } else {
      // Mismatch: shift pattern
      const bc = (s.badChar[s.text[compIdx]] ?? s.m);
      const shift = Math.max(1, bc);
      const shiftMsg = `Bad-char table['${s.text[compIdx]}']=${bc} → shift ${shift}`;
      log(shiftMsg); addStep(shiftMsg);
      s.s += shift;
      s.j = s.m - 1;
    }
  }

  // Controls
  el('build').addEventListener('click', ()=>{
    const text = textEl.value; const pat = patEl.value; if(!pat){ alert('Please enter a pattern'); return; }
    const algo = document.querySelector('input[name=algo]:checked').value;
    if(algo === 'kmp'){ renderTablesForKMP(pat); state = makeKMP(text,pat); log('Built LPS table'); addStep('Built LPS table'); }
    else { renderTablesForBM(pat); state = makeBM(text,pat); log('Built bad character table'); addStep('Built bad character table'); }
    alignment.innerHTML = '';
    if(stepsList) stepsList.innerHTML = '';
    log('Ready — press Next or Auto');
  });

  el('step').addEventListener('click', ()=>{
    if(!state){ alert('Build tables first'); return; }
    if(timer) { clearInterval(timer); timer = null; el('auto').textContent='Auto'; }
    const algo = document.querySelector('input[name=algo]:checked').value;
    if(algo === 'kmp') stepKMP(state); else stepBM(state);
  });

  el('auto').addEventListener('click', ()=>{
    if(!state){ alert('Build tables first'); return; }
    if(timer){ clearInterval(timer); timer = null; el('auto').textContent='Auto'; return; }
    const delay = Number(speed.value);
    timer = setInterval(()=>{
      if(state.finished){ clearInterval(timer); timer=null; el('auto').textContent='Auto'; return; }
      const algo = document.querySelector('input[name=algo]:checked').value;
      if(algo === 'kmp') stepKMP(state); else stepBM(state);
    }, delay);
    el('auto').textContent='Stop';
  });

  // Play until first match (stops when first match found)
  el('playMatch').addEventListener('click', ()=>{
    if(!state){ alert('Build tables first'); return; }
    if(timer){ clearInterval(timer); timer=null; el('auto').textContent='Auto'; }
    // if already found at least one match, do nothing
    if(state.found && state.found.length > 0){ log('Already found a match at index ' + state.found[0]); return; }
    const delay = Number(speed.value);
    timer = setInterval(()=>{
      if(state.finished){ clearInterval(timer); timer=null; el('auto').textContent='Auto'; return; }
      const algo = document.querySelector('input[name=algo]:checked').value;
      if(algo === 'kmp') stepKMP(state); else stepBM(state);
      // stop if at least one match found
      if(state.found && state.found.length > 0){ log('Stopping at first match index ' + state.found[0]); clearInterval(timer); timer=null; }
    }, delay);
    el('auto').textContent='Stop';
  });

  el('finish').addEventListener('click', ()=>{
    if(!state){ alert('Build tables first'); return; }
    if(timer){ clearInterval(timer); timer=null; el('auto').textContent='Auto'; }
    const algo = document.querySelector('input[name=algo]:checked').value;
    while(!state.finished){ if(algo==='kmp') stepKMP(state); else stepBM(state); }
  });

  el('reset').addEventListener('click', ()=>{ alignment.innerHTML=''; tables.innerHTML=''; if(stepsList) stepsList.innerHTML=''; if(timer){ clearInterval(timer); timer=null; el('auto').textContent='Auto'; } state = null; });

  // auto-build on load
  window.addEventListener('load', ()=>{ el('build').click(); });

})();

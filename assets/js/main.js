'use strict';

const SRC  = 'data/data.json';
const SC   = '!#%ABCDEFabcdef0123456789';

/* ── init ── */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const id = a.getAttribute('href').replace('#','');
    if(!id) return;
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({behavior:'smooth'});
  });
});

fetch(SRC)
  .then(r=>{ if(!r.ok) throw r.status; return r.json(); })
  .then(d=>{
    buildSkills(d.skills);
    buildExperience(d.experience);
    buildProjects(d.projects);
    buildServices(d.services);
    buildContact(d.contact);
    buildStats(d.stats);
    initReveal();
    initTW(d.personal);
    initToggle();
    initDecrypt();
    initSectionBg();
    initGlitchPulse();
    document.getElementById('yr').textContent = new Date().getFullYear();
  })
  .catch(e=>console.error('[bk]',e));

/* ── experience ── */
function buildExperience(list){
  const wrap=i('expList'); if(!wrap) return;
  wrap.className='exp-timeline rv';
  wrap.innerHTML=`<div class="exp-tl-spine"></div>`+list.map((e,idx)=>{
    const side = idx%2===0 ? 'left' : 'right';
    const box=`
      <div class="exp-hud ${e.color==='cy'?'cy':e.color==='pk'?'pk':''}">
        <div class="hud-corner tl"></div><div class="hud-corner tr"></div>
        <div class="hud-corner bl"></div><div class="hud-corner br"></div>
        <div class="exp-hud-top">
          <span class="exp-role">${e.role}</span>
          <span class="exp-date">${e.date}</span>
        </div>
        <div class="exp-co">${e.company}</div>
        <p class="exp-desc">${e.description}</p>
        <div class="exp-tags">${e.tags.map(t=>`<span class="etag">${t}</span>`).join('')}</div>
      </div>`;
    const dot=`<div class="exp-tl-dot-wrap"><div class="exp-tl-dot ${e.color==='cy'?'cy':e.color==='pk'?'pk':''}"></div></div>`;
    return `<div class="exp-tl-row" data-side="${side}">
      ${side==='left'
        ? `<div class="exp-tl-cell-box">${box}</div><div class="exp-tl-dot-wrap"><div class="exp-tl-dot ${e.color==='cy'?'cy':e.color==='pk'?'pk':''}"></div></div><div class="exp-tl-cell-empty"></div>`
        : `<div class="exp-tl-cell-empty"></div><div class="exp-tl-dot-wrap"><div class="exp-tl-dot ${e.color==='cy'?'cy':e.color==='pk'?'pk':''}"></div></div><div class="exp-tl-cell-box">${box}</div>`}
    </div>`;
  }).join('');
}

/* ── skills ── */
function buildSkills(data){
  const wrap=i('skBody'); wrap.className='sk-hud-grid';

  const colors = {
    'Languages':    {corner:'var(--vi)',  label:'var(--vi)'},
    'Tools & Dev':  {corner:'var(--cy)',  label:'var(--cy)'},
    'SEO':          {corner:'#f472b6',    label:'#f472b6'},
    'Web Security': {corner:'#fb923c',    label:'#fb923c'},
    'Productivity': {corner:'#a78bfa',    label:'#a78bfa'},
  };

  Object.entries(data).forEach(([grp,items])=>{
    const vis=(items||[]).filter(s=>s.level>0);
    if(!vis.length) return;
    const col = colors[grp] || {corner:'var(--vi)',label:'var(--vi)'};
    const box = el('div','sk-hud-box rv');
    box.style.setProperty('--cc', col.corner);
    box.innerHTML=`
      <div class="sk-hud-corner tl"></div>
      <div class="sk-hud-corner tr"></div>
      <div class="sk-hud-corner bl"></div>
      <div class="sk-hud-corner br"></div>
      <div class="sk-hud-title">${grp}</div>
      <div class="sk-hud-items">
        ${vis.map(s=>`
          <span class="sk-hud-item">
            ${s.icon?`<i class="${s.icon}" style="font-size:.7rem;margin-right:5px;opacity:.7"></i>`:''}${s.name}
          </span>
        `).join('')}
      </div>
    `;
    wrap.append(box);
  });
}

/* ── projects ── */
function buildProjects(list){
  const grid=i('prGrid');
  list.forEach(p=>{
    const {c,l}=getBadge(p.status,p.private);
    const card=el('div','pc rv');
    card.innerHTML=`
      <div class="c-tl"></div><div class="c-tr"></div>
      <div class="c-bl"></div><div class="c-br"></div>
      <div class="pr">
        <span class="pt${p.private?' dm':''}">${p.title}</span>
        <span class="pb ${c}">${l}</span>
      </div>
      <p class="pd">${p.description}</p>
      <div class="techs">
        ${p.technologies.map(t=>`<span class="tg">${t}</span>`).join('')}
        ${(p.tags||[]).map(t=>`<span class="tg special">${t}</span>`).join('')}
      </div>
      <div class="pls">${getPlinks(p)}</div>
    `;
    grid.append(card);
  });
  const wip=el('div','pc dash rv');
  wip.innerHTML=`
    <div class="c-tl"></div><div class="c-tr"></div>
    <div class="c-bl"></div><div class="c-br"></div>
    <div class="pr"><span class="pt dm">More Building...</span><span class="pb wip">WIP</span></div>
    <p class="pd dm">More tools in progress. Proxy checkers, security scripts and automation utilities. Always something running in the background.</p>
    <div class="pls"><a href="https://github.com/bijay085" target="_blank" rel="noopener noreferrer" class="pl"><i class="fab fa-github"></i>All Repos</a></div>
  `;
  grid.append(wip);
}

function getBadge(s,priv){
  if(priv) return {c:'prv',l:'Private'};
  const v=Array.isArray(s)?s[0]:s;
  if(v==='active')    return {c:'act',l:'Active'};
  if(v==='completed') return {c:'don',l:'Done'};
  return {c:'don',l:v||'Done'};
}

function getPlinks(p){
  if(p.private||(!p.github&&!p.demo))
    return `<span class="pl lk"><i class="fas fa-lock"></i>Private</span>`;
  let h='';
  if(p.github) h+=`<a href="${p.github}" target="_blank" rel="noopener noreferrer" class="pl"><i class="fab fa-github"></i>GitHub</a>`;
  if(p.demo)   h+=`<a href="${p.demo}"   target="_blank" rel="noopener noreferrer" class="pl"><i class="fas fa-arrow-up-right-from-square"></i>Live</a>`;
  return h;
}

/* ── services ── */
function buildServices(list){
  const grid=i('svGrid');
  list.forEach(s=>{
    const c=el('div','sc rv');
    c.innerHTML=`
      <div class="c-tl"></div><div class="c-tr"></div>
      <div class="c-bl"></div><div class="c-br"></div>
      <div class="si"><i class="${s.icon}"></i></div>
      <div class="stt">${s.title}</div>
      <p class="sd">${s.description}</p>
      <div class="sp">${s.price_range}</div>
    `;
    grid.append(c);
  });
}

/* ── contact ── */
function buildContact(c){
  const bar = i('ctInfoBar');
  const grid = i('ctSocialGrid');
  if(!bar||!grid) return;

  bar.className='ct-info-bar rv';
  bar.innerHTML=`
    <div class="ct-field">
      <div class="ct-label">Email</div>
      <div class="ct-val" id="demailw">
        <span id="demailt">${c.email_b64}</span>
        <span class="db" id="demailb">Decrypt</span>
      </div>
    </div>
    <div class="ct-field">
      <div class="ct-label">Phone</div>
      <div class="ct-val" id="dphonew">
        <span id="dphonet">${c.phone_b64}</span>
        <span class="db" id="dphoneb">Decrypt</span>
      </div>
    </div>
    <div class="ct-field">
      <div class="ct-label">Location</div>
      <div class="ct-val plain">${c.location} · ${c.timezone}</div>
    </div>
    <div class="ct-field">
      <div class="ct-label">Response</div>
      <div class="ct-val green">${c.response}</div>
    </div>
    <div class="ct-field">
      <div class="ct-label">Status</div>
      <div class="ct-val green">
        <span class="ct-status-dot"></span>${c.status}
      </div>
    </div>
  `;

  grid.className='ct-social-grid rv';
  grid.innerHTML=c.socials.map(s=>`
    <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="ct-sb">
      <i class="${s.icon} ct-sb-icon"></i>
      <span class="ct-sb-name">${s.name}</span>
    </a>
  `).join('');
}

/* ── stats ── */
function buildStats(s){
  if(!s) return;
  const map = [
    {id:'statProjects', val:s.projects_completed},
    {id:'statClients',  val:s.clients_served},
    {id:'statMonths',   val:s.months_experience},
  ];
  map.forEach(({id,val})=>{
    const el=i(id);
    if(!el||!val) return;
    el.dataset.count = val;
  });
  /* response is text not a number — set directly */
  const r=i('statResponse');
  if(r && s.response_time) r.textContent=s.response_time;
}

/* ── decrypt ── */
function initDecrypt(){
  const pairs=[
    {uid:'demail', type:'email', real:'bijaykoirala003@gmail.com'},
    {uid:'dphone', type:'phone', real:'+9746665541'},
  ];
  pairs.forEach(({uid,type,real})=>{
    i(`${uid}w`).onclick=()=>runDecrypt(uid,type,real);
  });
}

function runDecrypt(uid,type,real){
  const w=i(`${uid}w`),t=i(`${uid}t`),b=i(`${uid}b`);
  if(!b||b.classList.contains('done')) return;
  w.onclick=null; b.textContent='...';
  let x=0;
  const iv=setInterval(()=>{
    t.textContent=real.split('').map((_,j)=>
      j<x?real[j]:SC[Math.floor(Math.random()*SC.length)]
    ).join('');
    x+=2;
    if(x>=real.length){
      clearInterval(iv);
      b.textContent='Done'; b.classList.add('done');
      w.innerHTML=`<a href="${type==='email'?'mailto:':'tel:'}${real}" style="color:var(--vi);font-family:var(--mono);font-size:1rem">${real}</a>`;
    }
  },28);
}

/* ── reveal ── */
function initReveal(){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      e.target.classList.add('on');
      e.target.querySelectorAll('.fill[data-w]').forEach(b=>{ b.style.width=b.dataset.w+'%'; });
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      obs.unobserve(e.target);
    });
  },{threshold:0,rootMargin:'0px 0px -20px 0px'});
  document.querySelectorAll('.rv').forEach(e=>obs.observe(e));
}

function countUp(el){
  const t=+el.dataset.count; let n=0;
  const step=Math.max(1,Math.ceil(t/24));
  const iv=setInterval(()=>{
    n=Math.min(n+step,t);
    el.textContent=n<t?n:t+'+';
    if(n>=t) clearInterval(iv);
  },42);
}

/* ── typewriter ── */
function initTW(p){
  const phrases=[p.title,...p.interests.map(v=>v+' Enthusiast')];
  const tw=i('tw'); let pi=0,ci=0,del=false;
  (function tick(){
    const cur=phrases[pi];
    del?(tw.textContent=cur.slice(0,--ci)):(tw.textContent=cur.slice(0,++ci));
    if(!del&&ci===cur.length){ del=true; setTimeout(tick,2200); return; }
    if(del&&ci===0){ del=false; pi=(pi+1)%phrases.length; }
    setTimeout(tick,del?45:75);
  })();
}

/* ── nav toggle ── */
function initToggle(){
  const tog=i('tog'), dr=i('drawer');
  tog.onclick=()=>{ const o=dr.classList.toggle('open'); tog.classList.toggle('open',o); };

  /* active link on scroll */
  const sections = ['about','experience','skills','projects','services','contact'];
  const navLinks  = document.querySelectorAll('#nav a[href^="#"], #drawer a[href^="#"]');

  function setActive(id){
    navLinks.forEach(a=>{
      a.classList.toggle('active', a.getAttribute('href')==='#'+id);
    });
  }

  function onScroll(){
    const scrollY = window.scrollY + 80;
    const atBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 10;
    let current = '';
    sections.forEach(id=>{
      const el=document.getElementById(id);
      if(el && scrollY >= el.offsetTop) current=id;
    });
    if(atBottom) current = sections[sections.length-1];
    setActive(current);
  }

  navLinks.forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      const id = a.getAttribute('href').replace('#','');
      const el = document.getElementById(id);
      if(el) el.scrollIntoView({behavior:'smooth'});
      setActive(id);
    });
  });

  window.addEventListener('scroll', onScroll, {passive:true});
}
function closeMenu(){
  i('drawer').classList.remove('open');
  i('tog').classList.remove('open');
}

/* ── utils ── */
function i(id){ return document.getElementById(id); }
function el(tag,cls=''){
  const e=document.createElement(tag);
  if(cls) e.className=cls;
  return e;
}

/* ── HERO GEOMETRY ─────────────────────── */
(function(){
  const BLUE='#3b82f6',CYAN='#67e8f9',VIOLET='#a78bfa',WHITE='#ffffff';
  let paused = false;
  document.addEventListener('visibilitychange',()=>{ paused = document.hidden; });

  function spawnGeo(id,cfg){
    const canvas=document.getElementById(id);
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    const W=cfg.size,H=cfg.size,DPR=devicePixelRatio;
    canvas.width=W*DPR; canvas.height=H*DPR;
    ctx.scale(DPR,DPR);
    const cx=W/2,cy=H/2,s=cfg.scale;
    const sparks=[],flashes=[],wasClose={},CDIST=16*s;

    function spawnSpark(x,y,c1,c2){
      /* more sparks, faster, bigger */
      for(let i=0;i<14;i++){
        const a=(Math.PI*2/14)*i+Math.random()*.4;
        const spd=2+Math.random()*5;
        sparks.push({x,y,
          vx:Math.cos(a)*spd, vy:Math.sin(a)*spd,
          life:1, decay:.04+Math.random()*.03,
          color:Math.random()>.5?c1:c2,
          size:(2+Math.random()*2.5)*s});
      }
      /* shockwave ring */
      flashes.push({x,y,r:4*s,maxR:28*s,life:1,color:WHITE});
    }

    function ring(r,color,alpha,dash){
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
      ctx.strokeStyle=color; ctx.globalAlpha=alpha; ctx.lineWidth=1.5;
      ctx.setLineDash(dash||[]); ctx.stroke();
      ctx.globalAlpha=1; ctx.setLineDash([]);
    }

    let t=cfg.tOffset||0;
    function frame(){
      ctx.clearRect(0,0,W,H);

      /* rings — boosted alpha */
      cfg.rings.forEach(r=>ring(r.r*s,r.color,r.alpha*2,r.dash));
      cfg.arcs.forEach(a=>{
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(t*a.speed); ctx.translate(-cx,-cy);
        ring(a.r*s,a.color,a.alpha*2,a.dash); ctx.restore();
      });

      const pos=cfg.dots.map(d=>({
        x:cx+Math.cos(t*d.speed+d.offset)*d.r*s,
        y:cy+Math.sin(t*d.speed+d.offset)*d.r*s,
        color:d.color, size:d.size*s*1.4
      }));

      /* collision */
      for(let a=0;a<pos.length;a++){
        for(let b=a+1;b<pos.length;b++){
          const dx=pos[a].x-pos[b].x, dy=pos[a].y-pos[b].y;
          const dist=Math.sqrt(dx*dx+dy*dy), key=a+'_'+b;
          if(dist<CDIST){
            if(!wasClose[key]){
              wasClose[key]=true;
              const mx=(pos[a].x+pos[b].x)/2, my=(pos[a].y+pos[b].y)/2;
              spawnSpark(mx,my,pos[a].color,pos[b].color);
            }
          } else { wasClose[key]=false; }
        }
      }

      /* shockwave rings */
      for(let i=flashes.length-1;i>=0;i--){
        const f=flashes[i];
        f.r += (f.maxR-f.r)*.18;
        f.life -= .06;
        if(f.life<=0){flashes.splice(i,1);continue;}
        ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,Math.PI*2);
        ctx.strokeStyle=WHITE; ctx.globalAlpha=f.life*.8;
        ctx.lineWidth=2; ctx.stroke(); ctx.globalAlpha=1;
      }

      /* sparks */
      for(let i=sparks.length-1;i>=0;i--){
        const sp=sparks[i];
        sp.x+=sp.vx; sp.y+=sp.vy; sp.vx*=.9; sp.vy*=.9; sp.life-=sp.decay;
        if(sp.life<=0){sparks.splice(i,1);continue;}
        ctx.beginPath(); ctx.arc(sp.x,sp.y,sp.size*sp.life,0,Math.PI*2);
        ctx.fillStyle=sp.color; ctx.globalAlpha=sp.life; ctx.fill(); ctx.globalAlpha=1;
      }

      /* dots — bigger glow */
      pos.forEach(d=>{
        /* outer glow */
        ctx.beginPath(); ctx.arc(d.x,d.y,d.size*2.2,0,Math.PI*2);
        ctx.fillStyle=d.color; ctx.globalAlpha=.12; ctx.fill(); ctx.globalAlpha=1;
        /* core */
        ctx.beginPath(); ctx.arc(d.x,d.y,d.size,0,Math.PI*2);
        ctx.fillStyle=d.color; ctx.globalAlpha=1; ctx.fill(); ctx.globalAlpha=1;
        /* bright center */
        ctx.beginPath(); ctx.arc(d.x,d.y,d.size*.45,0,Math.PI*2);
        ctx.fillStyle=WHITE; ctx.globalAlpha=.7; ctx.fill(); ctx.globalAlpha=1;
      });

      ctx.beginPath(); ctx.arc(cx,cy,2.5*s,0,Math.PI*2);
      ctx.fillStyle=CYAN; ctx.globalAlpha=.5; ctx.fill(); ctx.globalAlpha=1;
      t+=.012; if(!paused) requestAnimationFrame(frame);
    }
    frame();
  }

  spawnGeo('heroGeo',{size:300,scale:1,tOffset:0,
    rings:[{r:100,color:BLUE,alpha:.16,dash:[7,8]},{r:58,color:CYAN,alpha:.13,dash:[4,10]},{r:28,color:VIOLET,alpha:.1,dash:[3,12]}],
    arcs:[{r:100,color:CYAN,alpha:.28,speed:.4,dash:[14,55]},{r:58,color:VIOLET,alpha:.22,speed:-.28,dash:[10,40]}],
    dots:[{r:100,speed:.5,color:CYAN,size:4,offset:0},{r:100,speed:.75,color:BLUE,size:3.5,offset:Math.PI*1.1},
      {r:100,speed:.35,color:VIOLET,size:3,offset:Math.PI*.6},{r:58,speed:-.6,color:BLUE,size:4,offset:.8},{r:58,speed:-1,color:CYAN,size:3,offset:Math.PI*1.4}]});

  spawnGeo('heroGeo2',{size:200,scale:.68,tOffset:1.2,
    rings:[{r:100,color:VIOLET,alpha:.15,dash:[6,9]},{r:58,color:BLUE,alpha:.12,dash:[4,11]}],
    arcs:[{r:100,color:BLUE,alpha:.25,speed:-.5,dash:[12,52]},{r:58,color:CYAN,alpha:.2,speed:.32,dash:[8,44]}],
    dots:[{r:100,speed:-.6,color:BLUE,size:3.5,offset:.4},{r:100,speed:-.9,color:VIOLET,size:3,offset:Math.PI},
      {r:58,speed:.7,color:CYAN,size:3.5,offset:1},{r:58,speed:1.1,color:BLUE,size:2.5,offset:Math.PI*1.5}]});

  spawnGeo('heroGeo3',{size:180,scale:.58,tOffset:2.5,
    rings:[{r:100,color:CYAN,alpha:.14,dash:[5,10]},{r:58,color:VIOLET,alpha:.1,dash:[3,13]}],
    arcs:[{r:100,color:VIOLET,alpha:.22,speed:.6,dash:[10,50]}],
    dots:[{r:100,speed:.8,color:CYAN,size:3.5,offset:0},{r:100,speed:.45,color:VIOLET,size:3,offset:Math.PI*.8},
      {r:58,speed:-.9,color:BLUE,size:3,offset:.6},{r:58,speed:-.55,color:CYAN,size:2.5,offset:Math.PI*1.2}]});

  spawnGeo('heroGeo4',{size:150,scale:.48,tOffset:.8,
    rings:[{r:100,color:BLUE,alpha:.14,dash:[6,10]},{r:58,color:CYAN,alpha:.1,dash:[4,12]}],
    arcs:[{r:58,color:BLUE,alpha:.2,speed:-.4,dash:[8,42]}],
    dots:[{r:100,speed:.65,color:BLUE,size:3.5,offset:.2},{r:100,speed:1,color:CYAN,size:3,offset:Math.PI},
      {r:58,speed:-.8,color:VIOLET,size:3,offset:1.2}]});

})();

/* ── EXTRA GEO INSTANCES ────────────────── */
(function(){
  const BLUE='#3b82f6',CYAN='#67e8f9',VIOLET='#a78bfa';
  const spawnGeo = window._spawnGeo;

  /* re-declare factory if not global */
  function sg(id,cfg){
    const canvas=document.getElementById(id);
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    const W=cfg.size,H=cfg.size,DPR=devicePixelRatio;
    canvas.width=W*DPR; canvas.height=H*DPR; ctx.scale(DPR,DPR);
    const cx=W/2,cy=H/2,s=cfg.scale;
    const sparks=[],flashes=[],wasClose={},CDIST=16*s;
    function spawnSpark(x,y,c1,c2){
      for(let i=0;i<14;i++){const a=(Math.PI*2/14)*i+Math.random()*.4;const spd=2+Math.random()*5;
        sparks.push({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,
          life:1,decay:.04+Math.random()*.03,color:Math.random()>.5?c1:c2,size:(2+Math.random()*2.5)*s});}
      flashes.push({x,y,r:4*s,maxR:28*s,life:1});
    }
    function ring(r,color,alpha,dash){
      ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle=color;
      ctx.globalAlpha=alpha;ctx.lineWidth=1.5;ctx.setLineDash(dash||[]);ctx.stroke();
      ctx.globalAlpha=1;ctx.setLineDash([]);
    }
    let t=cfg.tOffset||0;
    function frame(){
      ctx.clearRect(0,0,W,H);
      cfg.rings.forEach(r=>ring(r.r*s,r.color,r.alpha*2,r.dash));
      cfg.arcs.forEach(a=>{ctx.save();ctx.translate(cx,cy);ctx.rotate(t*a.speed);ctx.translate(-cx,-cy);ring(a.r*s,a.color,a.alpha*2,a.dash);ctx.restore();});
      const pos=cfg.dots.map(d=>({x:cx+Math.cos(t*d.speed+d.offset)*d.r*s,y:cy+Math.sin(t*d.speed+d.offset)*d.r*s,color:d.color,size:d.size*s*1.4}));
      for(let a=0;a<pos.length;a++){for(let b=a+1;b<pos.length;b++){
        const dx=pos[a].x-pos[b].x,dy=pos[a].y-pos[b].y,dist=Math.sqrt(dx*dx+dy*dy),key=a+'_'+b;
        if(dist<CDIST){if(!wasClose[key]){wasClose[key]=true;const mx=(pos[a].x+pos[b].x)/2,my=(pos[a].y+pos[b].y)/2;
          spawnSpark(mx,my,pos[a].color,pos[b].color);
        }}else{wasClose[key]=false;}
      }}
      for(let i=flashes.length-1;i>=0;i--){const f=flashes[i];f.r+=(f.maxR-f.r)*.18;f.life-=.06;
        if(f.life<=0){flashes.splice(i,1);continue;}
        ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.strokeStyle='#fff';ctx.globalAlpha=f.life*.8;ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;
      }
      for(let i=sparks.length-1;i>=0;i--){const sp=sparks[i];sp.x+=sp.vx;sp.y+=sp.vy;sp.vx*=.9;sp.vy*=.9;sp.life-=sp.decay;
        if(sp.life<=0){sparks.splice(i,1);continue;}
        ctx.beginPath();ctx.arc(sp.x,sp.y,sp.size*sp.life,0,Math.PI*2);ctx.fillStyle=sp.color;ctx.globalAlpha=sp.life;ctx.fill();ctx.globalAlpha=1;
      }
      pos.forEach(d=>{
        ctx.beginPath();ctx.arc(d.x,d.y,d.size*2.2,0,Math.PI*2);ctx.fillStyle=d.color;ctx.globalAlpha=.12;ctx.fill();ctx.globalAlpha=1;
        ctx.beginPath();ctx.arc(d.x,d.y,d.size,0,Math.PI*2);ctx.fillStyle=d.color;ctx.globalAlpha=1;ctx.fill();ctx.globalAlpha=1;
        ctx.beginPath();ctx.arc(d.x,d.y,d.size*.45,0,Math.PI*2);ctx.fillStyle='#fff';ctx.globalAlpha=.7;ctx.fill();ctx.globalAlpha=1;
      });
      ctx.beginPath();ctx.arc(cx,cy,2.5*s,0,Math.PI*2);ctx.fillStyle=CYAN;ctx.globalAlpha=.5;ctx.fill();ctx.globalAlpha=1;
      t+=.012; if(!paused) requestAnimationFrame(frame); else setTimeout(frame,200);
    }
    frame();
  }

  sg('heroGeo5',{size:130,scale:.42,tOffset:3.1,
    rings:[{r:100,color:BLUE,alpha:.15,dash:[5,11]},{r:58,color:VIOLET,alpha:.1,dash:[3,14]}],
    arcs:[{r:100,color:VIOLET,alpha:.2,speed:.55,dash:[10,48]}],
    dots:[{r:100,speed:.7,color:CYAN,size:3.5,offset:.3},{r:100,speed:1.1,color:BLUE,size:3,offset:Math.PI},
      {r:58,speed:-.75,color:VIOLET,size:3,offset:.9}]});

  sg('heroGeo6',{size:160,scale:.52,tOffset:4.2,
    rings:[{r:100,color:CYAN,alpha:.15,dash:[6,9]},{r:58,color:BLUE,alpha:.11,dash:[4,12]}],
    arcs:[{r:100,color:BLUE,alpha:.22,speed:-.45,dash:[12,46]},{r:58,color:CYAN,alpha:.18,speed:.35,dash:[7,38]}],
    dots:[{r:100,speed:-.55,color:VIOLET,size:3.5,offset:1},{r:100,speed:-.85,color:CYAN,size:3,offset:Math.PI*.9},
      {r:58,speed:.65,color:BLUE,size:3,offset:.4},{r:58,speed:1.05,color:VIOLET,size:2.5,offset:Math.PI*1.7}]});

  sg('heroGeo7',{size:140,scale:.45,tOffset:1.8,
    rings:[{r:100,color:VIOLET,alpha:.14,dash:[7,10]},{r:58,color:CYAN,alpha:.1,dash:[4,13]}],
    arcs:[{r:100,color:CYAN,alpha:.2,speed:.7,dash:[11,50]}],
    dots:[{r:100,speed:.9,color:BLUE,size:3.5,offset:.6},{r:100,speed:.5,color:VIOLET,size:3,offset:Math.PI*1.3},
      {r:58,speed:-1.1,color:CYAN,size:3,offset:.2},{r:58,speed:-.6,color:BLUE,size:2.5,offset:Math.PI*1.6}]});

  sg('heroGeo8',{size:120,scale:.38,tOffset:2.9,
    rings:[{r:100,color:BLUE,alpha:.14,dash:[5,12]},{r:58,color:CYAN,alpha:.1,dash:[3,15]}],
    arcs:[{r:58,color:VIOLET,alpha:.18,speed:-.5,dash:[8,40]}],
    dots:[{r:100,speed:.6,color:CYAN,size:3.5,offset:.5},{r:100,speed:.95,color:VIOLET,size:3,offset:Math.PI},
      {r:58,speed:-.7,color:BLUE,size:3,offset:1.5}]});

  sg('heroGeo9',{size:110,scale:.35,tOffset:.5,
    rings:[{r:100,color:CYAN,alpha:.13,dash:[4,13]}],
    arcs:[{r:100,color:BLUE,alpha:.18,speed:.6,dash:[9,46]}],
    dots:[{r:100,speed:.8,color:VIOLET,size:3.5,offset:.1},{r:100,speed:1.2,color:BLUE,size:3,offset:Math.PI*.8},
      {r:100,speed:.45,color:CYAN,size:2.5,offset:Math.PI*1.5}]});

})();
/* ══════════════════════════════════════════
   SECTION LIFE — new functions
   ══════════════════════════════════════════ */



/* ── Floating background particles on each section ── */
function initSectionBg(){
  const IDS    = ['about','experience','skills','projects','services','contact'];
  const COLORS = ['#3b82f6','#67e8f9','#a78bfa'];
  const COUNT  = 8;

  IDS.forEach(id=>{
    const sec = document.getElementById(id);
    if(!sec) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'sec-bg-canvas';
    sec.prepend(canvas);

    const ctx = canvas.getContext('2d');
    const DPR = Math.min(devicePixelRatio, 2);
    let W = 0, H = 0;

    const pts = Array.from({length:COUNT},()=>({
      x:0, y:0,
      vx:(Math.random()-.5)*.35,
      vy:(Math.random()-.5)*.35,
      r : 1.2 + Math.random()*1.8,
      c : COLORS[Math.floor(Math.random()*COLORS.length)],
      a : .15 + Math.random()*.2,
    }));

    function resize(){
      W = sec.offsetWidth;
      H = sec.offsetHeight;
      canvas.width  = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width  = W+'px';
      canvas.style.height = H+'px';
      ctx.setTransform(DPR,0,0,DPR,0,0);
      /* scatter on first resize */
      pts.forEach(p=>{
        if(p.x===0&&p.y===0){
          p.x=Math.random()*W;
          p.y=Math.random()*H;
        }
      });
    }
    resize();

    /* draw connection lines between nearby particles */
    function drawLines(){
      for(let a=0;a<pts.length;a++){
        for(let b=a+1;b<pts.length;b++){
          const dx=pts[a].x-pts[b].x, dy=pts[a].y-pts[b].y;
          const dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<120){
            ctx.beginPath();
            ctx.moveTo(pts[a].x,pts[a].y);
            ctx.lineTo(pts[b].x,pts[b].y);
            ctx.strokeStyle=pts[a].c;
            ctx.globalAlpha=(1-dist/120)*.06;
            ctx.lineWidth=.8;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha=1;
    }

    function frame(){
      ctx.clearRect(0,0,W,H);
      drawLines();
      pts.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0;
        if(p.y<0)p.y=H; if(p.y>H)p.y=0;
        /* glow */
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2);
        ctx.fillStyle=p.c; ctx.globalAlpha=p.a*.3; ctx.fill();
        /* core */
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.c; ctx.globalAlpha=p.a; ctx.fill();
        ctx.globalAlpha=1;
      });
      if(!document.hidden) requestAnimationFrame(frame);
      else setTimeout(frame,200);
    }
    frame();

    const ro = new ResizeObserver(resize);
    ro.observe(sec);
  });
}

/* ── Random glitch bursts on section headings ── */
function initGlitchPulse(){
  const heads = document.querySelectorAll('.sh-t.gl');
  heads.forEach(el=>{
    /* stagger initial delay */
    const base = 3000 + Math.random()*5000;
    el.style.setProperty('--gh-dur', (base/1000).toFixed(1)+'s');

    function burst(){
      /* temporarily shorten duration for a fast burst */
      el.style.setProperty('--gh-dur','1.2s');
      setTimeout(()=>{
        const next = (4+Math.random()*6).toFixed(1);
        el.style.setProperty('--gh-dur', next+'s');
        setTimeout(burst, parseFloat(next)*1000 + Math.random()*3000);
      }, 1200);
    }
    setTimeout(burst, base);
  });
}
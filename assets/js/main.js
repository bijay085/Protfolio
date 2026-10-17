'use strict';

let paused = false;
const VW = window.innerWidth; /* read once — avoids forced reflow on each check */
document.addEventListener('visibilitychange',()=>{ paused = document.hidden; });

/* ── spine draw on scroll ── */
function initSpineDraw(){
  const spine=document.querySelector('.exp-tl-spine');
  if(!spine||window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  spine.classList.add('spine-pre');
  const obs=new IntersectionObserver(entries=>{
    if(!entries[0].isIntersecting) return;
    spine.classList.add('spine-draw');
    obs.disconnect();
  },{threshold:0.1});
  obs.observe(spine);
}

/* ── init ──
   in-page anchors use native navigation + CSS smooth scroll, so the skip link moves focus and the URL hash updates.
   all content is static HTML; JS only adds motion and interactions */
initSpineDraw();
initTW();
initReveal();
initExperienceReadMore();
initAboutReadMore();
initToggle();
initSectionBg();
initGlitchPulse();
initMagnetic();
initCursorTrail();
updateNPTime();
setInterval(updateNPTime, 1000);

/* ── mobile Experience summaries ── */
function initExperienceReadMore(){
  document.querySelectorAll('#experience .exp-hud').forEach(card=>{
    if(card.querySelector('.exp-more')) return;
    const desc=card.querySelector('.exp-desc');
    const bullets=card.querySelector('.exp-bullets');
    if(!desc || (!bullets && desc.textContent.trim().length<150)) return;

    const button=document.createElement('button');
    button.type='button';
    button.className='exp-more';
    button.setAttribute('aria-expanded','false');
    button.textContent='Read more';
    card.append(button);

    button.addEventListener('click',()=>{
      const expanded=card.classList.toggle('is-expanded');
      button.setAttribute('aria-expanded',String(expanded));
      button.textContent=expanded?'Show less':'Read more';
    });
  });
}

/* ── mobile About summary ── */
function initAboutReadMore(){
  const about=document.querySelector('#aText');
  if(!about || about.querySelector('.about-more')) return;

  const button=document.createElement('button');
  button.type='button';
  button.className='about-more';
  button.setAttribute('aria-expanded','false');
  button.textContent='Read more';
  about.append(button);

  button.addEventListener('click',()=>{
    const expanded=about.classList.toggle('is-expanded');
    button.setAttribute('aria-expanded',String(expanded));
    button.textContent=expanded?'Show less':'Read more';
  });
}

/* live Nepal time */
function updateNPTime(){
  const el = document.getElementById('npTime');
  if(el) el.textContent = new Date().toLocaleTimeString('en-US',{timeZone:'Asia/Kathmandu',hour:'2-digit',minute:'2-digit',second:'2-digit'})+' NPT';
}

/* ── magnetic buttons ── */
function initMagnetic(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('#hCta .btn').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      const x=((e.clientX-r.left)-r.width/2)*.28;
      const y=((e.clientY-r.top)-r.height/2)*.28;
      btn.style.transform=`translate(${x}px,${y}px)`;
    });
    btn.addEventListener('mouseleave',()=>{
      btn.style.transform='';
      btn.style.transition='transform .5s cubic-bezier(.23,1,.32,1)';
      setTimeout(()=>btn.style.transition='',500);
    });
  });
}

/* ── reveal ── */
function initReveal(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('.rv').forEach(e=>{
      e.classList.add('on');
      e.querySelectorAll('[data-count]').forEach(countUp);
    });
    return;
  }

  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      /* stagger siblings with data-stagger on parent */
      const parent=e.target.parentElement;
      if(parent && parent.dataset.stagger){
        const kids=[...parent.children];
        const idx=kids.indexOf(e.target);
        e.target.style.animationDelay=(idx*parseFloat(parent.dataset.stagger))+'s';
      }
      e.target.classList.add('on');
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      obs.unobserve(e.target);
    });
  },{threshold:0.12,rootMargin:'0px 0px -32px 0px'});

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
function initTW(){
  const tw=i('tw');
  if(!tw || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const phrases=tw.dataset.phrases.split('|');
  let pi=0,ci=phrases[0].length,del=true;
  const GLITCH='@#$%&!?';
  setTimeout(function tick(){
    const cur=phrases[pi];
    del?(tw.textContent=cur.slice(0,--ci)):(tw.textContent=cur.slice(0,++ci));
    /* random glitch frame mid-type — 6% chance, only while typing forward */
    if(!del && ci>2 && ci<cur.length-1 && Math.random()<.06){
      const snap=tw.textContent;
      const g=GLITCH[Math.floor(Math.random()*GLITCH.length)];
      tw.textContent=snap.slice(0,-1)+g;
      setTimeout(()=>{ tw.textContent=snap; setTimeout(tick,75); },60);
      return;
    }
    if(!del&&ci===cur.length){ del=true; setTimeout(tick,2200); return; }
    if(del&&ci===0){ del=false; pi=(pi+1)%phrases.length; }
    setTimeout(tick,del?45:75);
  }, 2200); /* first phrase is already in the HTML */
}

/* ── nav toggle ── */
function initToggle(){
  const tog=i('tog'), dr=i('drawer');
  tog.onclick=()=>{
    const o=dr.classList.toggle('open');
    tog.classList.toggle('open',o);
    tog.setAttribute('aria-expanded', String(o));
    tog.setAttribute('aria-label',o?'Close navigation menu':'Open navigation menu');
  };

  /* close the mobile navigation when the user taps outside it */
  document.addEventListener('pointerdown',e=>{
    if(!dr.classList.contains('open')) return;
    if(dr.contains(e.target)||tog.contains(e.target)) return;
    closeMenu();
  });

  /* close drawer with Escape key */
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape' && dr.classList.contains('open')) closeMenu();
  });

  /* active link on scroll */
  const sections = ['about','experience','results','skills','projects','services','faq','contact'];
  const navLinks  = document.querySelectorAll('#nav a[href^="#"], #drawer a[href^="#"]');

  function setActive(id){
    navLinks.forEach(a=>{
      a.classList.toggle('active', a.getAttribute('href')==='#'+id);
    });
  }

  function onScroll(){
    /* a section is "current" once its top passes the upper third of the viewport */
    const scrollY = window.scrollY + window.innerHeight * .35;
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
    a.addEventListener('click', ()=>setActive(a.getAttribute('href').slice(1)));
  });

  let scrollTimer;
  window.addEventListener('scroll', ()=>{
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(onScroll, 80);
  }, {passive:true});

  /* back to top */
  const btt = i('btt');
  if(btt){
    window.addEventListener('scroll',()=>{
      btt.classList.toggle('show', window.scrollY > 400);
    },{passive:true});
    btt.onclick = ()=> window.scrollTo({top:0,behavior:'smooth'});
    const foot = i('foot');
    if(foot && 'IntersectionObserver' in window){
      new IntersectionObserver(([e])=> btt.classList.toggle('at-foot', e.isIntersecting))
        .observe(foot);
    }
  }
}
function closeMenu(){
  const dr=i('drawer'), tog=i('tog');
  if(dr)  dr.classList.remove('open');
  if(tog) tog.classList.remove('open');
  if(tog){
    tog.setAttribute('aria-expanded','false');
    tog.setAttribute('aria-label','Open navigation menu');
  }
}

/* ── utils ── */
function i(id){ return document.getElementById(id); }

/* ── HERO GEOMETRY ─────────────────────── */
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const isMobile = VW < 768;
  const BLUE='#3b82f6',CYAN='#67e8f9',VIOLET='#a78bfa',WHITE='#ffffff';
  /* idle the hero canvases once the hero is scrolled out of view */
  let heroOff = false;
  const hero = document.getElementById('hero');
  if(hero) new IntersectionObserver(e=>{ heroOff = !e[0].isIntersecting; }).observe(hero);

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
      if(paused || heroOff){ setTimeout(frame,200); return; }
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
      t+=.012;
      requestAnimationFrame(frame);
    }
    frame();
  }

  window._spawnGeo = spawnGeo; /* expose for second IIFE */
  spawnGeo('heroGeo', isMobile ? {size:200,scale:.7,tOffset:0,
    rings:[{r:100,color:BLUE,alpha:.16,dash:[7,8]}],
    arcs:[{r:100,color:CYAN,alpha:.28,speed:.4,dash:[14,55]}],
    dots:[{r:100,speed:.5,color:CYAN,size:3.5,offset:0},{r:100,speed:.75,color:BLUE,size:3,offset:Math.PI*1.1}]}
  : {size:300,scale:1,tOffset:0,
    rings:[{r:100,color:BLUE,alpha:.16,dash:[7,8]},{r:58,color:CYAN,alpha:.13,dash:[4,10]},{r:28,color:VIOLET,alpha:.1,dash:[3,12]}],
    arcs:[{r:100,color:CYAN,alpha:.28,speed:.4,dash:[14,55]},{r:58,color:VIOLET,alpha:.22,speed:-.28,dash:[10,40]}],
    dots:[{r:100,speed:.5,color:CYAN,size:4,offset:0},{r:100,speed:.75,color:BLUE,size:3.5,offset:Math.PI*1.1},
      {r:100,speed:.35,color:VIOLET,size:3,offset:Math.PI*.6},{r:58,speed:-.6,color:BLUE,size:4,offset:.8},{r:58,speed:-1,color:CYAN,size:3,offset:Math.PI*1.4}]});

  if(!isMobile){
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
  }

})();

/* ── EXTRA GEO INSTANCES — reuse spawnGeo from first IIFE via window ── */
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(VW < 768) return;
  const sg = window._spawnGeo;
  if(typeof sg !== 'function') return;

  sg('heroGeo5',{size:130,scale:.42,tOffset:3.1,
    rings:[{r:100,color:'#3b82f6',alpha:.15,dash:[5,11]},{r:58,color:'#a78bfa',alpha:.1,dash:[3,14]}],
    arcs:[{r:100,color:'#a78bfa',alpha:.2,speed:.55,dash:[10,48]}],
    dots:[{r:100,speed:.7,color:'#67e8f9',size:3.5,offset:.3},{r:100,speed:1.1,color:'#3b82f6',size:3,offset:Math.PI},
      {r:58,speed:-.75,color:'#a78bfa',size:3,offset:.9}]});

  sg('heroGeo6',{size:160,scale:.52,tOffset:4.2,
    rings:[{r:100,color:'#67e8f9',alpha:.15,dash:[6,9]},{r:58,color:'#3b82f6',alpha:.11,dash:[4,12]}],
    arcs:[{r:100,color:'#3b82f6',alpha:.22,speed:-.45,dash:[12,46]},{r:58,color:'#67e8f9',alpha:.18,speed:.35,dash:[7,38]}],
    dots:[{r:100,speed:-.55,color:'#a78bfa',size:3.5,offset:1},{r:100,speed:-.85,color:'#67e8f9',size:3,offset:Math.PI*.9},
      {r:58,speed:.65,color:'#3b82f6',size:3,offset:.4},{r:58,speed:1.05,color:'#a78bfa',size:2.5,offset:Math.PI*1.7}]});

  sg('heroGeo7',{size:140,scale:.45,tOffset:1.8,
    rings:[{r:100,color:'#a78bfa',alpha:.14,dash:[7,10]},{r:58,color:'#67e8f9',alpha:.1,dash:[4,13]}],
    arcs:[{r:100,color:'#67e8f9',alpha:.2,speed:.7,dash:[11,50]}],
    dots:[{r:100,speed:.9,color:'#3b82f6',size:3.5,offset:.6},{r:100,speed:.5,color:'#a78bfa',size:3,offset:Math.PI*1.3},
      {r:58,speed:-1.1,color:'#67e8f9',size:3,offset:.2},{r:58,speed:-.6,color:'#3b82f6',size:2.5,offset:Math.PI*1.6}]});

  sg('heroGeo8',{size:120,scale:.38,tOffset:2.9,
    rings:[{r:100,color:'#3b82f6',alpha:.14,dash:[5,12]},{r:58,color:'#67e8f9',alpha:.1,dash:[3,15]}],
    arcs:[{r:58,color:'#a78bfa',alpha:.18,speed:-.5,dash:[8,40]}],
    dots:[{r:100,speed:.6,color:'#67e8f9',size:3.5,offset:.5},{r:100,speed:.95,color:'#a78bfa',size:3,offset:Math.PI},
      {r:58,speed:-.7,color:'#3b82f6',size:3,offset:1.5}]});

  sg('heroGeo9',{size:110,scale:.35,tOffset:.5,
    rings:[{r:100,color:'#67e8f9',alpha:.13,dash:[4,13]}],
    arcs:[{r:100,color:'#3b82f6',alpha:.18,speed:.6,dash:[9,46]}],
    dots:[{r:100,speed:.8,color:'#a78bfa',size:3.5,offset:.1},{r:100,speed:1.2,color:'#3b82f6',size:3,offset:Math.PI*.8},
      {r:100,speed:.45,color:'#67e8f9',size:2.5,offset:Math.PI*1.5}]});
})();
/* ══════════════════════════════════════════
   SECTION LIFE — new functions
   ══════════════════════════════════════════ */



/* ── Floating background particles on each section ── */
function initSectionBg(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(VW < 1080) return; /* skip on mobile and tablet */
  const IDS    = ['about','experience','skills','projects','services','contact'];
  const COLORS = ['#3b82f6','#67e8f9','#a78bfa'];
  const COUNT  = VW < 1080 ? 5 : 8; /* fewer particles on mid-range */

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

    function resize(entries){
      /* use ResizeObserver contentRect — no forced reflow */
      const rect = entries?.[0]?.contentRect;
      if(!rect) return;
      W = rect.width;
      H = rect.height;
      canvas.width  = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width  = W+'px';
      canvas.style.height = H+'px';
      ctx.setTransform(DPR,0,0,DPR,0,0);
      /* scatter particles on first call */
      pts.forEach(p=>{
        if(p.x===0&&p.y===0){
          p.x=Math.random()*W;
          p.y=Math.random()*H;
        }
      });
    }
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
      if(document.hidden || !onScreen){ setTimeout(frame,200); return; }
      if(!W || !H){ requestAnimationFrame(frame); return; } /* wait for ResizeObserver */
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
      requestAnimationFrame(frame);
    }

    let onScreen = false;
    new IntersectionObserver(e=>{ onScreen = e[0].isIntersecting; }).observe(sec);
    const ro = new ResizeObserver(resize);
    ro.observe(sec); /* triggers resize() with contentRect, sets W/H */
    frame();
  });
}

function initCursorTrail(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  /* mouse only — on touch tablets the dots never move and sit stuck in the top-left corner */
  if(VW < 768 || !window.matchMedia('(pointer: fine)').matches) return;
  const TRAIL_COUNT = 10;
  const dots = Array.from({length:TRAIL_COUNT},()=>{
    const d = document.createElement('div');
    d.className = 'cur-dot';
    document.body.appendChild(d);
    return {el:d, x:0, y:0};
  });
  let mx=0, my=0;
  window.addEventListener('mousemove',e=>{ mx=e.clientX; my=e.clientY; },{passive:true});
  (function loop(){
    let x=mx, y=my;
    dots.forEach((d,idx)=>{
      const prev = idx===0 ? {x:mx,y:my} : dots[idx-1];
      d.x += (prev.x - d.x) * 0.35;
      d.y += (prev.y - d.y) * 0.35;
      const scale = 1 - idx/TRAIL_COUNT;
      const alpha = (1 - idx/TRAIL_COUNT) * 0.55;
      d.el.style.cssText=`transform:translate(${d.x}px,${d.y}px) translate(-50%,-50%) scale(${scale});opacity:${alpha}`;
    });
    requestAnimationFrame(loop);
  })();
}

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

// usage: node render.js <page.html> <width> <height> [comma-separated still times]
const {chromium}=require('/opt/node-tools/node_modules/playwright');
const fs=require('fs');
(async()=>{
  const [page,w,h,stills]=[process.argv[2]||'index.html',+process.argv[3]||1920,+process.argv[4]||1080,process.argv[5]];
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p=await b.newPage({viewport:{width:w,height:h}});
  await p.goto('file://'+__dirname+'/'+page);
  await p.waitForFunction('window.READY');await p.evaluate('document.fonts.ready');
  fs.mkdirSync('frames',{recursive:true});
  const fps=30,dur=await p.evaluate('DUR');
  if(stills){for(const t of stills.split(',').map(Number)){await p.evaluate(t=>seek(t),t);await p.screenshot({path:`frames/still_${t}.png`});}}
  else for(let i=0;i<Math.round(dur*fps);i++){await p.evaluate(t=>seek(t),i/fps);await p.screenshot({path:`frames/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:92});}
  await b.close();
})();

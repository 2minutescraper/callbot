const {chromium}=require('/opt/node-tools/node_modules/playwright');
const fs=require('fs');
(async()=>{
  const times=process.argv[2]?process.argv[2].split(',').map(Number):null;
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p=await b.newPage({viewport:{width:1920,height:1080}});
  await p.goto('file://'+__dirname+'/index.html');
  await p.waitForFunction('window.READY');
  fs.mkdirSync('frames',{recursive:true});
  const fps=30,dur=await p.evaluate('DUR');
  if(times){for(const t of times){await p.evaluate(t=>seek(t),t);await p.screenshot({path:`frames/still_${t}.png`});}}
  else for(let i=0;i<Math.round(dur*fps);i++){await p.evaluate(t=>seek(t),i/fps);await p.screenshot({path:`frames/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:92});}
  await b.close();
})();

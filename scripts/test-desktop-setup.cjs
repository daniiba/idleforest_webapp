const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=require('node:path').resolve(__dirname, '..');const ts=require(root+'/node_modules/typescript');
function load(file,requires){const exports={};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{exports,require:n=>requires[n],process:{env:{RESEND_API_KEY:'test',NEXT_PUBLIC_APP_URL:'https://www.idleforest.com'}},URL,Date,console});return exports;}
const helper=load(root+'/lib/desktop-setup.ts',{});
for(const [userAgent,platform,maxTouchPoints,expected] of [['Mozilla Android','Linux arm',5,'mobile'],['Mozilla iPhone','iPhone',5,'mobile'],['Mozilla Safari','MacIntel',5,'mobile'],['Mozilla Safari','MacIntel',0,'mac'],['Mozilla','Win32',0,'windows'],['Mozilla','Linux x86_64',0,'linux'],['Mozilla','unknown',0,'other']])assert.equal(helper.detectDesktopPlatform({userAgent,platform,maxTouchPoints}),expected);
assert.equal(helper.companySetupPath('wastefree-planet','pt'),'/pt/welcome/c/wastefree-planet');assert.equal(helper.companySetupPath('wastefree-planet','https://evil.test'),'/en/welcome/c/wastefree-planet');
let state;const company={id:'company',name:'Waste Free Planet',slug:'wastefree-planet'};
const admin={from(table){let insert=false;const q={select(){return q},eq(){return q},in(){return q},gte(){return q},limit(){return q},insert(row){insert=true;state.logs.push(row);return q},maybeSingle(){return q},then(resolve){return Promise.resolve({data:table==='companies'?company:table==='profiles'?{company_id:state.member?'company':'other'}:insert?null:state.recent?[{id:'prior'}]:[],error:state.dbError?{code:'FAIL'}:null}).then(resolve)}};return q}};
const route=load(root+'/app/api/desktop-setup-link/route.ts',{'next/server':{NextResponse:{json:(body,opts)=>({body,status:opts?.status||200})}},resend:{Resend:class{emails={send:async(payload,options)=>{state.sends.push({payload,options});return state.providerError?{error:{message:'failure'}}:{data:{id:'email-id'}}}}}},'@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user:state.user}})}})},'@/lib/supabase/admin':{createAdminClient:()=>admin},'@/lib/desktop-setup':helper});
function reset(){state={user:{id:'u1',email:'account@example.test',email_confirmed_at:'2026-01-01'},member:true,recent:false,sends:[],logs:[]}}
function request(body={},origin='https://www.idleforest.com'){return new Request('https://www.idleforest.com/api/desktop-setup-link',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({companySlug:'wastefree-planet',locale:'en',...body})})}
(async()=>{
reset();assert.equal((await route.POST(request({},'https://evil.test'))).status,403);assert.equal(state.sends.length,0);
reset();state.user=null;assert.equal((await route.POST(request())).status,401);
reset();state.user.email_confirmed_at=null;assert.equal((await route.POST(request())).status,403);
reset();state.member=false;assert.equal((await route.POST(request())).status,403);
reset();assert.equal((await route.POST(request({companySlug:'../../other'}))).status,400);
reset();state.dbError=true;assert.equal((await route.POST(request())).status,500);assert.equal(state.sends.length,0);
reset();state.recent=true;assert.equal((await route.POST(request())).status,200);assert.equal(state.sends.length,0);
reset();state.providerError=true;assert.equal((await route.POST(request())).status,500);assert.equal(state.logs.length,0);
reset();assert.equal((await route.POST(request({email:'other@example.test',locale:'pt'}))).status,200);assert.equal(state.sends[0].payload.to,'account@example.test');assert.match(state.sends[0].payload.text,/\/pt\/welcome\/c\/wastefree-planet/);assert.match(state.sends[0].options.idempotencyKey,/desktop-setup\/u1\/company\//);assert.equal(state.logs.length,1);
console.log('PASS: 7 device cases, locale preservation, and 9 email authorization/delivery cases. No external email calls.');
})().catch(e=>{console.error(e);process.exitCode=1});

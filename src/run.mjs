import {readFileSync,existsSync} from 'node:fs';
import {parseArgs} from 'node:util';
import {resolve,join} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {createEngine} from './engine.mjs';
import {report} from './report.mjs';
const {values}=parseArgs({options:{directory:{type:'string',default:'checkpoint'},minutes:{type:'string',default:'145'},init:{type:'boolean',default:false},once:{type:'boolean',default:false}}}),directory=resolve(values.directory),policy=JSON.parse(readFileSync(new URL('../policy.json',import.meta.url)));
if(!process.env.GITHUB_ACTIONS&&!values.once)throw Error('Continuous collection is allowed only on GitHub Actions; local --once is a finite smoke test');
const engine=createEngine({directory,policy,initialize:values.init}),end=Date.now()+Number(values.minutes)*60000;let stopped=false;
process.on('SIGTERM',()=>{stopped=true});process.on('SIGINT',()=>{stopped=true});
console.log('[Window]',JSON.stringify(engine.manifest));
try{do{const start=Date.now(),r=await engine.tick();const out=report(engine,policy,join(directory,'reports'));console.log('[Tick]',JSON.stringify({...r,status:out.status,baskets:out.groups.reduce((n,g)=>n+g.baskets,0)}));if(r.finished||values.once||stopped)break;await sleep(Math.min(Math.max(500,policy.pollIntervalMs-(Date.now()-start)),Math.max(0,end-Date.now())));}while(!stopped&&Date.now()<end);}finally{report(engine,policy,join(directory,'reports'));engine.close();}

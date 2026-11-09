import {readFileSync,existsSync} from 'node:fs';
import {parseArgs} from 'node:util';
import {performance} from 'node:perf_hooks';
import {setTimeout as sleep} from 'node:timers/promises';
import {createObserver} from './engine.mjs';
import {reportAAA} from './report.mjs';
const{values}=parseArgs({options:{directory:{type:'string',default:'aaa-checkpoint'},minutes:{type:'string',default:'145'},init:{type:'boolean',default:false},once:{type:'boolean',default:false}}}),policy=JSON.parse(readFileSync(new URL('./policy.json',import.meta.url))),seed=JSON.parse(readFileSync(new URL('./seed.json',import.meta.url)));
if(!values.once&&process.env.GITHUB_REPOSITORY!==policy.repository)throw Error('AAA continuous collection requires the dedicated public GitHub repository');
const minutes=Number(values.minutes);if(!Number.isFinite(minutes)||minutes<=0||minutes>270)throw Error('AAA session must be 0–270 minutes');
if(!values.init&&!existsSync(values.directory+'/observer.sqlite'))throw Error('AAA checkpoint absent; no reset');
const clock=()=>performance.timeOrigin+performance.now(),engine=createObserver({directory:values.directory,policy,seed,initialize:values.init,clock,sourceRun:process.env.GITHUB_RUN_ID??'local-once',codeCommit:process.env.GITHUB_SHA??'local-once'});
let end=clock()+minutes*60000;
if(end>=policy.indicativePublicationAt-900000&&end<=policy.indicativePublicationAt+1800000&&clock()<policy.indicativePublicationAt-1800000)end=policy.indicativePublicationAt-1800000;
let stopped=false;process.on('SIGTERM',()=>{stopped=true;});process.on('SIGINT',()=>{stopped=true;});
console.log('[AAA window]',JSON.stringify(engine.manifest));
try{do{const started=clock(),result=await engine.tick();reportAAA(engine,values.directory+'/reports');console.log('[AAA tick]',JSON.stringify(result));if(result.finished||values.once||stopped)break;await sleep(Math.max(0,Math.min(60000-(clock()-started),end-clock())));}while(!stopped&&clock()<end);}
catch(e){engine.issue('fatal',e);reportAAA(engine,values.directory+'/reports');throw e;}
finally{reportAAA(engine,values.directory+'/reports');engine.close();}

// Independent public-data observer. No signer or order submission.
import {join} from 'node:path';
import {openStore,hash} from '../src/store.mjs';
import {parseAAA,forecastBucket} from '../src/specialists-rules.mjs';
import {freshBasket,payout,RPCS} from '../src/adapters.mjs';
import {exchangeClock} from '../src/climate-books.mjs';
import {simulatePaper} from '../src/paper.mjs';

export function getManifest(store,policy,seed,{initialize=false,now=Date.now(),sourceRun,codeCommit}={}){
 const old=store.memory('manifest');
 if(old){if(old.policyHash!==hash(policy)||old.seedHash!==hash(seed)||old.sourceRun!==sourceRun||old.codeCommit!==codeCommit)throw Error('AAA checkpoint provenance mismatch; refusing reset');return old;}
 if(!initialize||!sourceRun||!codeCommit||now>=policy.initializeBefore||now>=policy.fixedEnd)throw Error('AAA checkpoint absent or initialization deadline passed');
 if(seed.event?.slug!==`us-gas-price-on-november-10-2026`||!Array.isArray(seed.event.markets)||seed.event.markets.length>12)throw Error('Unreviewed AAA event');
 forecastBucket(seed.event,40000); // Require a complete, disjoint four-decimal partition.
 const manifest={campaign:policy.id,policyHash:hash(policy),seedHash:hash(seed),sourceRun,codeCommit,start:policy.fixedStart,end:policy.fixedEnd,createdAt:now};
 return store.memory('manifest',manifest);
}

export function createNetwork(store,policy,{fetcher=fetch,clock=Date.now,wait=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 return async(input,options={})=>{
  const u=new URL(input),method=options.method??'GET';
  const allowedGet=method==='GET'&&u.protocol==='https:'&&((u.hostname==='gasprices.aaa.com'&&u.pathname==='/')||(u.hostname==='clob.polymarket.com'&&['/book','/time'].includes(u.pathname))||(u.hostname==='gamma-api.polymarket.com'&&u.pathname.startsWith('/markets/slug/'))||(u.hostname==='data-api.polymarket.com'&&u.pathname==='/v2/activity'));
  const allowedRpc=method==='POST'&&RPCS.includes(u.origin)&&['eth_blockNumber','eth_getBlockByNumber','eth_call'].includes(JSON.parse(options.body??'{}').method);
  if(!allowedGet&&!allowedRpc)throw Error('AAA observer only permits allowlisted public reads');
  if(u.hostname==='gasprices.aaa.com'){
   const previous=store.memory('aaaNetworkAttempt'),gap=previous===null?0:Math.max(0,10000-(clock()-previous));
   if(gap)await wait(gap);
   store.memory('aaaNetworkAttempt',clock());
  }
  const requests=(store.memory('requests')??0)+1;
  if(requests>policy.maxRequests||store.size()>policy.maxBytes)throw Error('AAA resource ceiling reached');
  store.memory('requests',requests);
  const startedAt=clock(),timeout=AbortSignal.timeout(policy.networkTimeoutMs),signal=options.signal?AbortSignal.any([timeout,options.signal]):timeout;
  const r=await fetcher(u,{...options,redirect:'error',signal,headers:{'user-agent':'Mozilla/5.0 AAA-Paper-Observer/1.0 (public-data research)','accept':'text/html,application/json;q=0.9,*/*;q=0.8',...options.headers}});
  const chunks=[];let bytes=0;const reader=r.body?.getReader();
  if(reader)for(;;){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>1500000){await reader.cancel();throw Error('AAA response exceeds body ceiling');}chunks.push(part.value);}
  const receivedAt=clock(),response=new Response(Buffer.concat(chunks),{status:r.status,statusText:r.statusText,headers:r.headers});
  Object.defineProperty(response,'receivedAt',{value:receivedAt});
  store.add('request:'+requests,'request',{url:u.href,method,startedAt,receivedAt,status:r.status,bytes,cacheAge:r.headers.get('age'),serverDate:r.headers.get('date'),lastModified:r.headers.get('last-modified'),etag:r.headers.get('etag'),cacheControl:r.headers.get('cache-control')});
  return response;
 };
}

export function parseSource(html,receivedAt){
 const value=parseAAA(html,receivedAt),text=html.replace(/<[^>]*>/g,' ').replace(/&#8217;|&rsquo;/g,"'").replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ').trim();
 const header=text.match(/Today(?:'|’)s AAA National Average\s+\$(\d+\.\d{4})/i);
 if(!header||Math.round(Number(header[1])*10000)!==value.current)throw Error('AAA headline and Regular Current Avg disagree');
 return value;
}

export function quoteKnownValue({market,snapshot,signal,due,now,policy,sourceBefore}){
 const abstain=reason=>({action:'abstain',reason});
 if(!sourceBefore||sourceBefore.date!==signal.date||sourceBefore.current!==signal.current)return abstain('Latest known AAA source differs from first choice; no entry');
 if(sourceBefore.yesterdayMatchesKnownPriorDay!==true)return abstain('Yesterday Avg does not match the prior-day value actually known at seed receipt');
 if(!Number.isFinite(sourceBefore.receivedAt)||sourceBefore.receivedAt>snapshot?.requestedAt||now-sourceBefore.receivedAt>policy.sourceIntervalMs*2.5)return abstain('Source not freshly known before quote request');
 if(now>=policy.observationAt||!Number.isFinite(due)||now>due+policy.entryToleranceMs)return abstain('Requested causal delay or pre-10am observation window missed');
 if(!snapshot||!snapshot.streamInitialized||snapshot.streamInvalid||snapshot.condition!==market.conditionId||snapshot.token!==JSON.parse(market.clobTokenIds)[0]||snapshot.outcome!=='Yes'||!Number.isFinite(snapshot.requestedAt)||snapshot.requestedAt<due||!Number.isFinite(snapshot.receivedAt)||snapshot.receivedAt>now||snapshot.receivedAt<due||now-snapshot.receivedAt>5000)return abstain('Fresh post-signal full book unavailable or mismatched');
 const bids=snapshot.bids??[],asks=snapshot.asks??[];
 if(!bids.length||!asks.length||[...bids,...asks].some(l=>!Number.isFinite(Number(l.price))||Number(l.price)<=0||Number(l.price)>=1||!Number.isFinite(Number(l.size))||Number(l.size)<=0))return abstain('Invalid or one-sided depth');
 const bestBid=Math.max(...bids.map(l=>Number(l.price))),bestAsk=Math.min(...asks.map(l=>Number(l.price)));
 if(bestBid>bestAsk)return abstain('Crossed book');
 let entry=simulatePaper({market:market.slug,outcome:'Yes',recordedAt:due,deadline:policy.observationAt,probability:null},{...snapshot,minNotional:Number.EPSILON},{now,budget:policy.budget,maxPrice:.999999,extraCost:policy.extraCost,unscoredShadow:true});
 if(entry.action==='paper_buy'&&entry.quantity-entry.totalCost<=0)entry=abstain('No positive conditional payout margin after costs');
 return{...entry,bestBid,bestAsk,spread:bestAsk-bestBid,conditionalMargin:entry.action==='paper_buy'?entry.quantity-entry.totalCost:null,actualDelayMs:snapshot.receivedAt-signal.receivedAt,decisionDelayMs:now-signal.receivedAt,liquidityReserved:false,calibratedProbability:false};
}

const compactBook=s=>({...s,asks:s.asks?.slice().sort((a,b)=>Number(a.price)-Number(b.price)).slice(0,20),bids:s.bids?.slice().sort((a,b)=>Number(b.price)-Number(a.price)).slice(0,20),depthRetention:'Twenty best levels per side for periodic diagnostics; not a full historic order book'});
export class AAAObserver{
 constructor({store,policy,seed,network,clock=Date.now,books=freshBasket,resolve=payout}){Object.assign(this,{store,policy,seed,network,clock,books,resolve});}
 issue(scope,error){this.store.memory('errorCount',(this.store.memory('errorCount')??0)+1);const at=this.clock();this.store.add('error:'+scope+':'+Math.floor(at/3600000),'error',{scope,message:String(error),at});}
 async auditClock(){const c=await exchangeClock(this.network,this.clock),at=this.clock();this.store.add('clock:'+at,'clock',{at,samples:c.samples,offsetMs:c.offsetMs,uncertaintyMs:c.uncertaintyMs,meaning:'UTC receipt clock audited; offset not applied to one data stream only'});if(Math.abs(c.offsetMs)+c.uncertaintyMs>2000)throw Error('AAA clock disagreement exceeds two seconds');this.store.memory('lastClock',at);}
 async source(){
  const requestedAt=this.clock(),r=await this.network('https://gasprices.aaa.com/'),html=await r.text(),receivedAt=r.receivedAt??this.clock();
  if(!r.ok)throw Error('AAA HTTP '+r.status);
  if(!Number.isFinite(receivedAt)||receivedAt>this.clock()+1||receivedAt<requestedAt)throw Error('Invalid full-body receipt timestamp');
  const value=parseSource(html,receivedAt),previous=this.store.memory('latestSource'),count=(this.store.memory('sourceReads')??0)+1;
  const previousDate=new Date(Date.parse(this.policy.targetDate+'T12:00:00Z')-86400000).toISOString().slice(0,10),reference=this.seed.baselineSource;
  const read={...value,requestedAt,receivedAt,bodyHash:hash(html),cacheAge:r.headers.get('age'),serverDate:r.headers.get('date'),lastModified:r.headers.get('last-modified'),etag:r.headers.get('etag'),cacheControl:r.headers.get('cache-control'),yesterdayMatchesKnownPriorDay:reference?.date===previousDate&&value.yesterday===reference.current,priorDayReference:{date:reference?.date,value:reference?.current,receivedAt:reference?.receivedAt,meaning:'Prior-day value actually received during seed creation, not an independently certified 10am historical observation'}};
  this.store.add('source:'+count,'source',read);this.store.memory('sourceReads',count);this.store.memory('latestSource',read);
  if(!previous||previous.date!==read.date||previous.current!==read.current||previous.yesterday!==read.yesterday)this.store.add('source-change:'+count,'source-change',{before:previous,after:read});
  if(read.date===this.policy.targetDate&&!this.store.get('signal')){
   const old=this.store.memory('lastOldSource'),continuous=!!old&&receivedAt-old.receivedAt<=this.policy.sourceIntervalMs*2.5;
   const signal={...read,lastOldReceipt:old?.receivedAt??null,leftCensored:!old,observationIntervalContinuous:continuous,observedIntervalMs:old?receivedAt-old.receivedAt:null,publicationTimeMeaning:'Observed old-to-target receipt bracket only; cache and polling prevent global publication timing',market:forecastBucket(this.seed.event,read.current)};
   this.store.add('signal','signal',signal);
  }
  if(read.date<this.policy.targetDate)this.store.memory('lastOldSource',read);
  return read;
 }
 async periodicBooks(){
  const at=this.clock();this.store.memory('lastBooks',at);
  try{const result=await this.books(this.seed.event.markets.map(m=>({market:m,outcome:'Yes'})),{fetcher:this.network,clock:this.clock});
   this.store.add('books:'+at,'books',{requestedAt:at,receivedAt:this.clock(),snapshots:result.snapshots.map(compactBook),frameCount:result.frames?.length??0,framesHash:hash(result.frames??[]),meaning:'Periodic served states; not a continuous price path or reserved liquidity'});
  }catch(e){this.issue('periodic-books',e);}
 }
 async wallet(profile){
  const wallet=typeof profile==='string'?profile:profile.wallet,key='wallet:'+wallet,prior=this.store.memory(key),from=Math.max(this.policy.fixedStart,(prior?.lastSuccess??this.policy.fixedStart)-120000),end=this.clock();let cursor=null,pages=0,more=false,rows=[];const seen=new Set();
  try{do{const q=new URLSearchParams({user:wallet,type:'TRADE',start:String(Math.floor(from/1000)),end:String(Math.floor(end/1000)),sort_direction:'DESC',limit:'1000'});if(cursor)q.set('cursor',cursor);const r=await this.network('https://data-api.polymarket.com/v2/activity?'+q),b=await r.json();if(!r.ok||!Array.isArray(b.data)||b.data.some(a=>a.proxy_wallet?.toLowerCase()!==wallet.toLowerCase()))throw Error('Wrong AAA activity envelope');rows.push(...b.data);pages++;more=b.pagination?.has_more===true;cursor=b.pagination?.next_cursor;if(more&&(!cursor||seen.has(cursor)))throw Error('Invalid AAA activity cursor');seen.add(cursor);}while(more&&pages<3);
   const receivedAt=this.clock(),target=rows.filter(a=>a.event_slug===this.seed.event.slug);
   for(const a of target){const id=hash([wallet,a.transaction_hash,a.token_id,a.side,a.timestamp,a.size,a.price]);this.store.add('wallet-action:'+id,'wallet-action',{wallet,action:a,receivedAt,meaning:'Execution timestamp is not order-placement time; no causal source advantage inferred'});}
   const coverage={wallet,from,end,receivedAt,pages,complete:!more,targetRows:target.length,allRows:rows.length,lastSuccess:!more?receivedAt:prior?.lastSuccess??null};this.store.add('wallet-read:'+wallet+':'+receivedAt,'wallet-read',coverage);this.store.memory(key,coverage);
   if(more)this.issue('wallet-pagination:'+wallet,'Three-page ceiling: absence of target actions cannot be inferred');
  }catch(e){this.issue('wallet:'+wallet,e);}
 }
 async decision(signal,delay){
  const id='decision:'+delay;if(this.store.get(id))return;const due=signal.receivedAt+delay;if(this.clock()<due)return;
  if(this.clock()>due+this.policy.entryToleranceMs||this.clock()>=this.policy.observationAt){this.store.add(id,'decision',{delay,due,at:this.clock(),market:signal.market,entry:{action:'abstain',reason:'Delay or pre-observation window missed; no historical quote replay'}});return;}
  try{const sourceBefore=this.store.memory('latestSource'),book=await this.books([{market:signal.market,outcome:'Yes'}],{fetcher:this.network,clock:this.clock}),at=this.clock(),snapshot=book.snapshots[0];
   const entry=quoteKnownValue({market:signal.market,snapshot,signal,due,now:at,policy:this.policy,sourceBefore});
   this.store.add(id,'decision',{delay,due,at,market:signal.market,sourceBefore,snapshot,frameCount:book.frames?.length??0,framesHash:hash(book.frames??[]),entry,sourceControl:'Only the latest source actually known before the quote is used. Later source reads are subsequent evidence and never rewrite this decision.',meaning:'Known-number conditional paper experiment; not an advance forecast or guaranteed result'});
  }catch(e){this.store.add(id,'decision',{delay,due,at:this.clock(),market:signal.market,entry:{action:'abstain',reason:String(e)}});}
 }
 async settle(){
  if(this.clock()<this.policy.observationAt||this.clock()-(this.store.memory('lastPayout')??0)<600000)return;
  this.store.memory('lastPayout',this.clock());const positions=this.store.all('decision').filter(d=>d.entry.action==='paper_buy');
  for(const condition of [...new Set(positions.map(d=>d.market.conditionId))]){if(this.store.get('payout:'+condition))continue;try{const p=await this.resolve(this.network,condition,this.clock);if(p)this.store.add('payout:'+condition,'payout',{condition,receivedAt:this.clock(),...p});}catch(e){this.issue('payout:'+condition,e);}}
 }
 async tick({calibrate=true}={}){
  const now=this.clock();if(now>=this.policy.fixedEnd){this.store.memory('finished',{at:now,reason:'Fixed observation window completed; unresolved results remain unknown'});return{finished:true};}
  if((this.store.memory('requests')??0)>=this.policy.maxRequests||this.store.size()>this.policy.maxBytes){this.store.memory('finished',{at:now,reason:'Resource ceiling reached; coverage incomplete'});return{finished:true};}
  if(calibrate&&now-(this.store.memory('lastClock')??0)>3600000)await this.auditClock();
  const prior=this.store.memory('lastTick');if(prior&&now-prior>this.policy.sourceIntervalMs*2.5)this.store.add('gap:'+prior,'gap',{from:prior,to:now,meaning:'Observer interruption; past source visibility and executable prices unknown'});
  if(now-(this.store.memory('lastSourceAttempt')??0)>=this.policy.sourceIntervalMs){this.store.memory('lastSourceAttempt',now);try{await this.source();}catch(e){this.issue('source',e);}}
  const signal=this.store.get('signal');
  if(signal){for(const delay of this.policy.delaysMs)await this.decision(signal,delay);}
  else if(this.clock()-(this.store.memory('lastBooks')??0)>=this.policy.bookIntervalMs)await this.periodicBooks();
  for(const profile of this.policy.wallets){const wallet=typeof profile==='string'?profile:profile.wallet,key='walletAttempt:'+wallet;if(this.clock()-(this.store.memory(key)??0)>=(this.policy.walletIntervalMs??120000)){this.store.memory(key,this.clock());await this.wallet(profile);}}
  await this.settle();this.store.memory('lastTick',this.clock());this.store.memory('ticks',(this.store.memory('ticks')??0)+1);this.store.checkpoint();
  return{finished:false,at:this.clock(),signal:!!signal,decisions:this.store.all('decision').length,requests:this.store.memory('requests')};
 }
}

export function createObserver({directory='aaa-checkpoint',policy,seed,initialize=false,clock=Date.now,sourceRun=process.env.GITHUB_RUN_ID,codeCommit=process.env.GITHUB_SHA,fetcher=fetch,...adapters}){
 const store=openStore(join(directory,'observer.sqlite'),clock);
 try{const manifest=getManifest(store,policy,seed,{initialize,now:clock(),sourceRun,codeCommit}),network=createNetwork(store,policy,{fetcher,clock}),engine=new AAAObserver({store,policy,seed,network,clock,...adapters});return Object.assign(engine,{manifest,close:()=>store.close()});}catch(e){store.close();throw e;}
}

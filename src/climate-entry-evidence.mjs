// Historical entry evidence for legacy and v2 exchanges; public receipts only.
export const LEGACY_FILL='0xd0a08e8c493f9c94f29311604c9de1b4e8c8d4c06bd0c789af57f2d65bfec0f6';
export const LEGACY_MATCH='0x63bf4d16b7fa898ef4c4b2b6d90fd201e9c56313b65638af6088d149d2ce956c';
export const V2_FILL='0xd543adfd945773f1a62f74f0ee55a5e3b9b1a28262980ba90b1a89f2ea84d8ee';
export const V2_MATCH='0x174b3811690657c217184f89418266767c87e4805d09680c39fc9c031c0cab7c';
const addr=t=>'0x'+t.slice(-40).toLowerCase(),amount=n=>Number(n)/1e6;
const exchanges=new Set(['0x4bfb41d5b3570defd03c39a9a4d8de6bd8b8982e','0xc5d563a36ae78145c45a50134d48a1215220f80a','0xe111180000d2663c0091e4f400237545b87b996b','0xe2222d279d744050d28e00520010520000310f59']);
export function receiptEntry(receipt,{wallet,token}){
  if(receipt.status!=='0x1')throw Error('Entry receipt reverted');
  const matched=new Set(receipt.logs.filter(l=>[LEGACY_MATCH,V2_MATCH].includes(l.topics[0])&&addr(l.topics[2])===wallet&&exchanges.has(l.address.toLowerCase())).map(l=>l.address.toLowerCase()+'|'+l.topics[1]));
  const fills=[];
  for(const l of receipt.logs){
    if(![LEGACY_FILL,V2_FILL].includes(l.topics[0])||!exchanges.has(l.address.toLowerCase())||l.removed||l.topics.length!==4||addr(l.topics[2])!==wallet)continue;
    const words=l.data.slice(2).match(/.{64}/g)?.map(w=>BigInt('0x'+w));if(!words)continue;
    const legacy=l.topics[0]===LEGACY_FILL;if(words.length!==(legacy?5:7))throw Error('Unexpected OrderFilled ABI');
    let buy,id,shares,notional,fee;
    if(legacy){if(words[0]!==0n&&words[1]!==0n)throw Error('Unsupported legacy asset pair');buy=words[0]===0n;id=(buy?words[1]:words[0]).toString();shares=amount(buy?words[3]:words[2]);notional=amount(buy?words[2]:words[3]);fee=amount(words[4]);}
    else{if(words[0]!==0n&&words[0]!==1n)throw Error('Unknown v2 side');buy=words[0]===0n;id=words[1].toString();shares=amount(buy?words[3]:words[2]);notional=amount(buy?words[2]:words[3]);fee=amount(words[4]);}
    if(id!==token)continue;
    const role=matched.has(l.address.toLowerCase()+'|'+l.topics[1])?'taker':exchanges.has(addr(l.topics[3]))?'unknown':'maker';
    fills.push({orderHash:l.topics[1],exchange:l.address.toLowerCase(),role,side:buy?'BUY':'SELL',shares,notional,fee,price:notional/shares,index:Number(l.logIndex)});
  }
  const transfers=new Map();for(const l of receipt.logs){if(l.topics[0]!=='0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'||l.topics.length!==3)continue;const sign=Number(addr(l.topics[2])===wallet)-Number(addr(l.topics[1])===wallet);if(sign)transfers.set(l.address.toLowerCase(),(transfers.get(l.address.toLowerCase())??0)+sign*amount(BigInt(l.data)));}
  return{tx:receipt.transactionHash,block:parseInt(receipt.blockNumber,16),blockHash:receipt.blockHash,fills,tokenCashTransfers:Object.fromEntries(transfers),
    roleLimit:'Matching role at this execution. A maker fill is not the time the order was placed; no unfilled historical ask depth is reconstructed.'};
}

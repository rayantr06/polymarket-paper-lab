// This observer publishes only its own generated facts and paper results.
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
if(process.env.GITHUB_REPOSITORY!=='rayantr06/polymarket-paper-lab')throw Error('Wrong public destination');
const git=(args,input)=>{const r=spawnSync('git',args,{input,encoding:'utf8'});if(r.status!==0)throw Error('Report git operation '+args[0]+': '+r.stderr);return r.stdout.trim();};
git(['config','user.name','github-actions[bot]']);git(['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
const branch='aaa-source-results',exists=git(['ls-remote','--heads','origin',branch]);let parent=null;if(exists){git(['fetch','--no-tags','origin','refs/heads/'+branch]);parent=git(['rev-parse','FETCH_HEAD']);}
const files=['bilan.md','bilan.json','preuves.json'],entries=files.map(name=>`100644 blob ${git(['hash-object','-w','--stdin'],readFileSync('aaa-checkpoint/reports/'+name))}\t${name}`);
const tree=git(['mktree'],entries.join('\n')+'\n'),commit=git(['commit-tree',tree,...(parent?['-p',parent]:[])],`AAA source observer report for ${process.env.GITHUB_RUN_ID}\n`);git(['push','origin',commit+':refs/heads/'+branch]);console.log('Independent AAA report published',commit);

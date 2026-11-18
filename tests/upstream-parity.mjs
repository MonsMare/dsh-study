/** Compare our Include patch algorithm against executable extraction from pinned DSH source.
 * Required: DSH_REFERENCE_DIR points at a local git clone that contains the pinned commit.
 * Does not require installing the upstream monorepo's entire dependency closure.
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import ts from 'typescript'
import { applyEntryPatches } from '../vendor/include/src/index.ts'
const reference=process.env.DSH_REFERENCE_DIR
if(!reference)throw new Error('Set DSH_REFERENCE_DIR to the local pinned deepseek-harness clone')
const pinned='fcc0ad462172522aaf5c93a7b2e01f6b9f0b0159'
const source=execFileSync('git',['-C',reference,'show',`${pinned}:vendor/include/src/patch.ts`],{encoding:'utf8'})
const begin=source.indexOf('export function applyPatches(')
const end=source.indexOf('\n}\n',begin)
assert.ok(begin>=0&&end>begin,'could not isolate exact official function')
const fragment=source.slice(begin,end+2)
const js=ts.transpileModule(fragment,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
const official=(await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))).applyPatches
const cases=[
 {base:[],patches:[{insert:[{id:'a',name:'a',config:{x:1}}]},{id:'a',config:{x:2}}]},
 {base:[{id:'g',name:'g',group:true,config:[]}],patches:[{id:'g',insert:[{id:'nested',name:'n'}]},{id:'nested',disabled:true}]},
 {base:[{id:'a',name:'a'}],patches:[{id:'none',disabled:true},{disabled:true},{id:'a',name:'wrong',disabled:true}]},
 {base:[{id:'a',name:'a',config:{one:1,two:2}}],patches:[{id:'a',config:{one:3}}]},
 {base:[{id:'g',name:'g',group:true,config:[]}],patches:[{id:'g',config:[{id:'child',name:'a'}]},{id:'child',disabled:true}]},
 {base:[],patches:[]},
]
for(const [i,{base,patches}] of cases.entries()){
 const a=[],b=[]
 const resultA=official(structuredClone(base),structuredClone(patches),(...parts)=>a.push(parts))
 const resultB=applyEntryPatches(structuredClone(base),structuredClone(patches),(...parts)=>b.push(parts))
 assert.deepEqual(resultB,resultA,`Entries diverged in case ${i}`)
 assert.deepEqual(b,a,`Warnings diverged in case ${i}`)
}
console.log(`PASS: ${cases.length} upstream Include applyPatches parity cases at ${pinned}`)

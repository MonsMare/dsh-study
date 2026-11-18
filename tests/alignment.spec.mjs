import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import * as yaml from 'js-yaml'
import { applyEntryPatches, entryListSchema } from '../vendor/include/src/index.ts'
import { loadOverlayPatches, renderConfigDump } from '../packages/boot/app-boot/src/index.ts'
import { loadProfileDirectory, resolveProfileDir, initProfile } from '../packages/boot/app-boot/src/profile.ts'

// Algorithm: base rows and inserted rows are cloned, Group children are indexed.
const base = [{id:'group',name:'cordis:group',group:true,config:[{id:'child',name:'@demo/child',config:{a:1,b:2}}]}]
const warnings=[]
const result=applyEntryPatches(base,[
 {id:'group',insert:[{id:'new',name:'@demo/new'}]},
 {id:'child',config:{b:5}},
 {id:'new',disabled:true},
 {id:'missing',disabled:true},
 {disabled:true},
 {id:'new',name:'wrong',disabled:false},
],(message,...args)=>warnings.push([message,...args]))
assert.deepEqual(result[0].config[0].config,{b:5})
assert.equal(result[0].config[1].disabled,true)
assert.equal(base[0].config[0].config.a,1)
assert.deepEqual(warnings.map(row=>row[0]),[
 'patch: entry %C not found',
 'patch: id is required for non-insert patches',
 'patch: name mismatch for %C (expected %C, got %C), skipping',
])

// The same include Schema roundtrips tagged JS expressions without executing them.
const original='- insert:\n    - id: demo\n      name: "@demo/plugin"\n      config:\n        key: !!js process.env.DEMO_KEY\n'
const parsed=yaml.load(original,{schema:entryListSchema})
const written=yaml.dump(parsed,{schema:entryListSchema,noRefs:true})
assert.match(written,/!!js/)
assert.equal(yaml.load(written,{schema:entryListSchema})[0].insert[0].config.key.__jsExpr,'process.env.DEMO_KEY')

const home=mkdtempSync(join(tmpdir(),'dsh-alignment-'))
const profileDir=join(home,'profiles','demo')
const bundleDir=join(profileDir,'node_modules','demo-bundle')
const userPatch=join(profileDir,'cordis.patch.yml')
const bundlePatch=join(bundleDir,'patch.yml')
try{
 mkdirSync(bundleDir,{recursive:true})
 writeFileSync(join(profileDir,'package.json'),JSON.stringify({dsh:{profile:{bundles:['demo-bundle']}}}))
 writeFileSync(join(bundleDir,'package.json'),JSON.stringify({dsh:{bundle:{patch:'patch.yml'}}}))
 writeFileSync(bundlePatch,'- insert:\n    - id: demo\n      name: ./my-plugin.js\n      config:\n        model: base\n')
 writeFileSync(userPatch,'- id: demo\n  config:\n    model: user\n')
 const parsedBundle=loadOverlayPatches('dsh',bundlePatch)
 assert.equal(parsedBundle[0].insert[0].name,pathToFileURL(resolve(bundleDir,'my-plugin.js')).href)
 const profile=loadProfileDirectory('dsh',profileDir,join(home,'install','package.json'))
 assert.deepEqual(profile.layers.map(l=>l.packageName),['demo-bundle'])
 assert.equal(profile.patches[0].id,'demo')
 const rootFile=join(profileDir,'cordis.yml')
 writeFileSync(rootFile,'[]\n')
 const dump=renderConfigDump('dsh',rootFile,[
   {label:'demo-bundle',patches:profile.layers[0].patches},
   {label:'user',patches:profile.patches},
 ])
 assert.match(dump,/# == demo-bundle, patched by user/)
 assert.equal(yaml.load(dump,{schema:entryListSchema})[0].config.model,'user')

 // User layer error must propagate, but bundle-only path skips user parsing completely.
 writeFileSync(userPatch,'bad: not-a-list\n')
 assert.throws(()=>loadProfileDirectory('dsh',profileDir,join(home,'install','package.json')),/must be a top-level YAML array/)
 assert.equal(loadProfileDirectory('dsh',profileDir,join(home,'install','package.json'),{userLayer:false}).patches.length,0)

 // Real CLI subprocess: uses an explicit throwaway DSH_HOME, never ~/.dsh.
 writeFileSync(userPatch,'- id: demo\n  disabled: true\n')
 const bin=join(process.cwd(),'apps','cli','src','bin.ts')
 const env={...process.env,DSH_HOME:home}
 const p=spawnSync(process.execPath,[bin,'--profile','demo','--dump-config'],{encoding:'utf8',env})
 assert.equal(p.status,0,p.stderr)
 assert.equal(yaml.load(p.stdout,{schema:entryListSchema})[0].disabled,true)

 // Default-only dump works with invalid user Patch and never evaluates it.
 writeFileSync(userPatch,'bad: not-a-list\n')
 const d=spawnSync(process.execPath,[bin,'--profile','demo','--dump-default-config'],{encoding:'utf8',env})
 assert.equal(d.status,0,d.stderr)
 assert.equal(yaml.load(d.stdout,{schema:entryListSchema})[0].disabled,undefined)

 // The unimplemented runtime explicitly errors rather than claiming it started.
 const boot=spawnSync(process.execPath,[bin,'--profile','demo'],{encoding:'utf8',env})
 assert.notEqual(boot.status,0)
 assert.match(boot.stderr,/not implemented/)

 console.log('PASS: schema, patch, profile, dump, default-only and fail-closed CLI')
}finally {rmSync(home,{recursive:true,force:true})}

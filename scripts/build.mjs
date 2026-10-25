import {cp, mkdir} from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const output=new URL('dist/',root);
await mkdir(output,{recursive:true});
for(const path of ['index.html','css','js']){
  await cp(new URL(path,root),new URL(path,output),{recursive:true});
}
console.log('Updated dist with the current app and styles.');

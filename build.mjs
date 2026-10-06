import {mkdir,cp,rm,writeFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist/server',{recursive:true});await mkdir('dist/client',{recursive:true});await mkdir('dist/.openai',{recursive:true});
await cp('public','dist/client',{recursive:true});await rm('dist/client/index.html');
await cp('src','dist/server',{recursive:true});
await cp('.openai/hosting.json','dist/.openai/hosting.json');
await writeFile('dist/server/index.js',"export { default } from './worker.mjs';\n");

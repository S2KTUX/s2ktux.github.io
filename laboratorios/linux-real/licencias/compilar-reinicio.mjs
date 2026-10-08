import {build} from '../../../s2ktux-site/node_modules/esbuild/lib/main.js';
import {fileURLToPath} from 'node:url';
const name=process.argv[2]||'reinicio';if(!['reinicio','rhcsa'].includes(name))throw Error('Motor no reconocido');
await build({entryPoints:[fileURLToPath(new URL('./v86-1e4f43c95/src/browser/starter.js',import.meta.url))],
 outfile:fileURLToPath(new URL('../../assets/v86-test/libv86-'+name+'.mjs',import.meta.url)),bundle:true,format:'esm',platform:'browser',target:'es2020',minify:true,define:{DEBUG:'false'},external:['node:*','fs','path','perf_hooks','crypto','./capstone-x86.min.js','./libwabt.cjs']});

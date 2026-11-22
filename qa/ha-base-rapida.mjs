// Solo para el servidor local de QA, nunca se incluye en el sitio público.
export async function instrumentarBaseHA(context, {exportBase = false} = {}) {
  await context.route('**/debian/multinodo.mjs*', async route => {
    const response = await route.fetch();
    const source = await response.text();
    const read = 'scenario?.ha||(!persistSession&&!examRuntime)||saved||scenario?.manual?null:await cleanBases.read()';
    const ready = "initialized=true;\n   kubeDebianClusterReady=true;status.textContent='Copia HA lista:";
    if (!source.includes(read) || !source.includes(ready)) {
      throw Error('Cambió la ruta de preparación de HA');
    }
    const body = source
      .replace(read, '(!persistSession&&!examRuntime)||saved||scenario?.manual?null:await cleanBases.read()')
      .replace(ready, `if (!saved && scenario?.ha && ![...nodes.values()].some(node=>node.window.kubeDebianSnapshot.terminalOpened)) {
   const started=performance.now();
   status.textContent='Capturando la base limpia de HA para la prueba…';
   try {
    ${exportBase ? `for (const id of miembrosHA) await phase(id,'Liberar la caché del invitado antes de capturar','sync; echo 3 > /proc/sys/vm/drop_caches',120000);` : ''}
    const result=await capturarCluster({ordered:ordenarNodosDebian(nodes,{progressive}),network,
     pack:(id,state,_text,options)=>cleanBases.packNode(id,state,'',options),
     write:captures=>${exportBase ? `globalThis.qaExportHACapture(captures,cleanRevision,cleanBases)` : 'cleanBases.write(captures)'}});
    globalThis.qaHACapture={ok:true,ms:performance.now()-started,sha256:result.sha256,
     packedBytes:result.nodes.reduce((sum,node)=>sum+node.packedBytes,0)};
   } catch(error) {
    globalThis.qaHACapture={ok:false,error:error.message,ms:performance.now()-started};
    if(error.resumeFailed)throw error;
   }
  }
  ${ready}`);
    await route.fulfill({response,body});
  });
}

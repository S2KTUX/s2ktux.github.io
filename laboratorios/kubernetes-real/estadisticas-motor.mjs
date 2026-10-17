// Contar llamadas del motor sin cambiar instrucciones, límites ni sus retornos.
export function instrumentEngine(vm){
 const cpu=vm.v86.cpu,stats={compiled:0,clearAll:0,clearOne:0,tableEntries:cpu.wm.wasm_table.length};
 for(const [method,key] of [['codegen_finalize','compiled'],['jit_clear_all_funcs','clearAll'],['jit_clear_func','clearOne']]){
  const original=cpu[method];
  if(typeof original!=='function')throw Error('El motor no expone el contador esperado');
  cpu[method]=function(...args){stats[key]++;return original.apply(this,args);};
 }
 return stats;
}

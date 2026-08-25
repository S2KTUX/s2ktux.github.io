import { analyzeShellInput, parseRedirections } from './terminal-shell-parser.js';
import { validateCommandInvocation } from './terminal-command-schema.js';
import { WORKER_OPERATIONS, createWorkerFailure, createWorkerResponse, isWorkerEnvelope } from './terminal-worker-protocol.js';

self.addEventListener('message',event=>{
  const request=event.data;if(!isWorkerEnvelope(request))return;
  try{
    let result;
    if(request.operation===WORKER_OPERATIONS.READY)result={ready:true};
    else if(request.operation===WORKER_OPERATIONS.SHELL_ANALYZE)result=analyzeShellInput(request.payload.source);
    else if(request.operation===WORKER_OPERATIONS.SHELL_REDIRECTIONS)result=parseRedirections(request.payload.source);
    else if(request.operation===WORKER_OPERATIONS.COMMAND_VALIDATE)result=validateCommandInvocation(request.payload.mode,request.payload.name,request.payload.args||[]);
    else throw new Error('Operación del Worker no soportada: '+request.operation);
    self.postMessage(createWorkerResponse(request.id,result));
  }catch(error){self.postMessage(createWorkerFailure(request.id,error));}
});

export const TERMINAL_WORKER_PROTOCOL = 1;

export const WORKER_OPERATIONS = Object.freeze({
  READY: 'runtime.ready',
  SHELL_ANALYZE: 'shell.analyze',
  SHELL_REDIRECTIONS: 'shell.redirections',
  COMMAND_VALIDATE: 'command.validate'
});

export const createWorkerRequest = (id, operation, payload = {}) => ({ protocol:TERMINAL_WORKER_PROTOCOL, id, operation, payload });
export const createWorkerResponse = (id, result) => ({ protocol:TERMINAL_WORKER_PROTOCOL, id, ok:true, result });
export const createWorkerFailure = (id, error) => ({ protocol:TERMINAL_WORKER_PROTOCOL, id, ok:false, error:error instanceof Error?error.message:String(error) });
export const isWorkerEnvelope = value => Boolean(value&&value.protocol===TERMINAL_WORKER_PROTOCOL&&Number.isInteger(value.id));

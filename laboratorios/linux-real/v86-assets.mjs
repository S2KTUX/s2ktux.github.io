// El origen de los bytes puede cambiar. Los manifiestos de confianza y la
// identidad de sesión siguen en la web que carga el laboratorio.
export function payloadBase(config,localBase){
 if(!config)return localBase;
 const url=new URL(config,localBase);
 const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
 if((url.protocol!=='https:'&&!(local&&url.protocol==='http:'))||url.username||url.password||url.search||url.hash||!url.pathname.endsWith('/'))throw Error('La dirección de los recursos de Linux no es válida.');
 return url;
}

export async function retryAsset(load,description){
 for(let attempt=0;attempt<2;attempt++){
  try{return await load(attempt);}
  catch(error){
   if(!error.retryable&&!(error instanceof TypeError)&&error.name!=='TimeoutError')throw error;
   if(attempt===1){
    const failure=Error('No se pudo descargar '+description+' tras dos intentos. Vuelve a cargar la página para intentarlo de nuevo.',{cause:error});
    failure.recoverableDownload=true;
    throw failure;
   }
  }
 }
}

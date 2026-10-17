// Comparar cantidades, no su escritura: 16Mi y 16777216 representan lo mismo.
export const cantidadJQ='def cantidad: ((tostring|capture("^(?<n>[-+]?(?:[0-9]+(?:[.][0-9]*)?|[.][0-9]+)(?:[eE][-+]?[0-9]+)?)(?<u>Ki|Mi|Gi|Ti|Pi|Ei|[numkKMGTPE]?)$"))//{n:"-1",u:""}) as $q | ($q.n|sub("^[+]";"")|sub("^[.]";"0.")|sub("^-[.]";"-0.")|tonumber)*({"":1,n:1e-9,u:1e-6,m:0.001,k:1000,K:1000,M:1e6,G:1e9,T:1e12,P:1e15,E:1e18,Ki:1024,Mi:1048576,Gi:1073741824,Ti:1099511627776,Pi:1125899906842624,Ei:1152921504606846976}[$q.u]); ';
// Margen solo para el redondeo de coma flotante de jq, menor que un byte o 1m.
export const equivalenciaJQ=cantidadJQ+'def equivale($n): ((cantidad-$n)|fabs)<=((($n|fabs)+1)*1e-12); ';
// En un httpGet, el puerto puede indicarse por número o por su nombre.
export const sondaEnPuerto=(probe,port)=>'('+probe+'.httpGet.port as $p | $p=='+port+' or any(.ports[]?; .name==$p and .containerPort=='+port+'))';

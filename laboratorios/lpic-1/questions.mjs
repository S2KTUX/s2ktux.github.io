// Bancos de Deza92 en Daypo. El responsable de S2KTUX confirma permiso de reutilización.
// Correcciones y procedencia: /contenido/lpic-1-correcciones.md. No son preguntas oficiales de LPI.
import {daypoQuestions,bankSources} from './daypo-bank.mjs?v=20261020-daypo1';
export {bankSources};
export const topics={101:'Arquitectura del sistema',102:'Instalación y paquetes',103:'Comandos GNU y Unix',104:'Dispositivos, sistemas de archivos y FHS',105:'Shells y scripts',106:'Interfaces gráficas y accesibilidad',107:'Tareas administrativas',108:'Servicios esenciales',109:'Fundamentos de redes',110:'Seguridad'};
// Los pesos son los de los objetivos v5; no una fórmula de puntuación oficial.
export const weights={'101.1':2,'101.2':3,'101.3':3,'102.1':2,'102.2':2,'102.3':1,'102.4':3,'102.5':3,'102.6':1,'103.1':4,'103.2':2,'103.3':4,'103.4':4,'103.5':4,'103.6':2,'103.7':3,'103.8':3,'104.1':2,'104.2':2,'104.3':3,'104.5':3,'104.6':2,'104.7':2,'105.1':4,'105.2':4,'106.1':2,'106.2':1,'106.3':1,'107.1':5,'107.2':4,'107.3':3,'108.1':3,'108.2':4,'108.3':3,'108.4':2,'109.1':4,'109.2':4,'109.3':4,'109.4':2,'110.1':3,'110.2':3,'110.3':4};
export const questions=Object.freeze(daypoQuestions);

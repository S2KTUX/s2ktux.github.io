import { test, expect } from '@playwright/test';
const cases=[
['/rhcsa/1/1.html',/\/cursos\/rhcsa-9\/tema-1-herramientas-esenciales\/$/],
['/rhcsa/EXTRA/extra.html',/\/cursos\/rhcsa-9\/tema-11-clase-extra\/$/],
['/lpic/103/3.html',/\/cursos\/lpic-1\/tema-103-comandos-gnu-y-unix\/$/],
['/docker/2/2.html',/\/cursos\/docker\/clase-2-docker-para-el-dia-a-dia\/$/],
['/curso.html?c=docker',/\/cursos\/docker\/$/],
['/leccion.html?c=docker&m=2',/\/cursos\/docker\/clase-3-docker-profesional\/$/]
];
for(const [legacy,destination] of cases)test(`Fase 4 · ${legacy} llega a su URL canónica`,async({page})=>{await page.goto(legacy);await expect(page).toHaveURL(destination);await expect(page.locator('main')).toBeVisible();});

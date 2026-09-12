# NooV Score v2

Implementación: 12 de septiembre de 2026. Diseño: únicamente Valoración de la propuesta 3. Las demás secciones de la ficha y el material Golden no cambian.

## Áreas y cálculo

| Área | Escala de respuestas | Peso operativo |
|---|---|---|
| Jugabilidad y sistemas | 0–5 | 20% |
| Diversión | 0–5 | 20% |
| Historia / inmersión | 0–5 | 15% |
| Progresión y ritmo | 0–5 | 15% |
| Gráficos / dirección artística | 0–5 | 10% |
| Rendimiento / estabilidad | 0–3 | 10% |
| Música | 0–3 | 5% |
| Comunidad pública | 0–5 | 5% |

Reparto propuesto para esta primera versión: prioriza jugar y disfrutar, separa calidad de sistemas y disfrute personal, y evita que la longitud de una escala determine su influencia. Está centralizado en `src/lib/review-criteria.ts`; es una decisión de producto, no una calibración empírica que garantice cierta distribución de notas. No se añaden más criterios.

Cada área tiene pregunta, explicación y una descripción por respuesta. Se pueden consultar en `/criticas/#escala` y en el formulario. Música mide recuerdo/peso personal, no toda la calidad del sonido. Rendimiento se refiere a las partidas y equipo del usuario. La progresión no exige subir de rango siempre. No se resta un punto por cada subsistema: se valora su relevancia y efecto real.

`NooV Score = Σ(valor / máximo × peso) / Σ(pesos aplicables) × 10`

- Cero es una respuesta válida. Una respuesta desconocida no equivale a cero y bloquea la publicación de una nueva nota completa.
- Historia, Música, Progresión y Comunidad permiten «No aplica». Se excluyen y sus pesos se redistribuyen proporcionalmente. No se puede omitir Jugabilidad, Arte, Rendimiento o Diversión.
- Comunidad no se solicita en juegos sin contexto público/competitivo. Se usa la aplicabilidad existente de modos/etiquetas. El cooperativo privado no cuenta por sí solo.
- Originalidad es una insignia booleana, no un criterio numérico. Un género conocido no impide aportar ideas originales.
- Diversión sustituye a la mención honorífica. No hay bonus adicional en la **nota**; el bonus económico de amortización conserva su fórmula existente.
- El resultado muestra un decimal. Un 10 exige todas las áreas aplicables al máximo; el resto se limita a 9,9 aunque un redondeo normal daría 10.
- 5 aceptable; 6 correcto; 7 bueno; 8 muy bueno; 9 excelente pero mejorable; 10 prácticamente perfecto en lo que propone, sin carencias relevantes. Las definiciones completas 0–10 comparten una única fuente con la UI.

## Formulario y presentación

Cuatro pasos: Jugar (Jugabilidad/Progresión), Mundo (Arte/Historia), Experiencia (Música/Rendimiento), Balance (Comunidad cuando aplica/Diversión/Originalidad). Respuestas mediante radios nativos, sin texto libre obligatorio ni opcional. Sin avance automático ni nota numérica en vivo para no condicionar la siguiente respuesta.

Se puede guardar con áreas pendientes y continuar después. Cambios sin publicar se conservan en un borrador local por juego. La recuperación es explícita; se avisa si el borrador pertenece a una versión anterior de la ficha. Si el almacenamiento del navegador está bloqueado, el formulario y el guardado remoto siguen funcionando, aunque el borrador no sobrevivirá al cierre de la página.

El guardado conserva autenticación y API existentes. Un cambio concurrente en la valoración devuelve 409 y mantiene las respuestas; la revisión base evita pisarlo. Un formulario antiguo no puede degradar silenciosamente un registro v2 a v1.

El radar usa Chart.js, normaliza a 0–10 y no representa pesos. No dibuja los pendientes como ceros ni cierra un polígono completo si faltan respuestas. Lista numérica contigua y foco/teclado accesibles; sin animación necesaria. La nota principal, referencias externas, vacío, nota anterior, pendientes y «No aplica» tienen etiquetas distintas.

## Migración y persistencia

`critica.version = 2` conserva los nombres de los criterios compatibles y añade `rendimiento` y `progresion` como `null`. `entretenimiento` pasa a mostrarse como Diversión manteniendo sus valores 0–5. La escala de Música conserva sus números 0–3 como respuestas importadas que conviene revisar; no se reconstruyen recuerdos ni respuestas que no existían.

`critica.original` procede de la antigua originalidad cuando existía; lo desconocido se conserva como `null`. `migracion` archiva la crítica anterior completa, la nota que se publicaba y el antiguo campo `nota` (podía estar desactualizado). Comentarios y menciones históricas no se eliminan de los datos.

La nota anterior permanece mientras haya áreas pendientes. Tras completar v2, `nota` se actualiza y `ultima_completa` conserva la última valoración completa para futuras revisiones parciales. No se publican medias parciales como definitivas. La fórmula del bonus económico no cambia; se verifica que migrar no altera su multiplicador.

`readGames()` y `readBundledGames()` aplican la misma migración en memoria; nunca escriben durante una lectura. El script permite persistirla por separado en cada fuente, **sin copiar el archivo local sobre Blob**:

```sh
npm run migrate:reviews -- --local --blob          # comprobar, sin escribir
npm run migrate:reviews -- --local --apply        # respaldo + migración local
npm run migrate:reviews -- --blob --apply         # respaldo + migración de Blob
```

El respaldo local de cada fuente se guarda, identificado por SHA-256, en `.codex-qa/review-v2-backups/` (ignorado por Git). El script verifica que no cambien campos ajenos ni el bonus de amortización. En Blob escribe sobre el ETag leído y falla ante cambios concurrentes, sin sobrescritura ciega. En local verifica que el contenido original no haya cambiado antes de escribir. Es idempotente; una segunda ejecución no vuelve a migrar ni duplicar archivos históricos.

Orden seguro de despliegue: validar código y datos → migrar archivo local → desplegar código compatible → migrar Blob → comprobar fuentes y producción. El respaldo es recuperable; no se debe restaurar una biblioteca completa sobre ediciones posteriores sin reconciliar antes sus cambios.

## Validación reproducible

- `npm run test:reviews`: escalas, pesos, 0/10, redondeo, ausencia, exclusión, comunidad, originalidad sin bonus, migración idempotente, archivo sin pérdida, nota cacheada desactualizada, ediciones concurrentes y amortización.
- `npm run test:finance`, `npm run test:catalog`, `npm run test:detail`, `npm run test:games-sync`: regresiones del resto de los cálculos y almacenamiento.
- Chromium/Playwright: 1440×1024, 820×1180, 390×844 y 3440×1024. Estados de migración, completa (fixture explícita), cero, vacío, no aplica, pasos, regreso, borrador, teclado y error recuperable. Los POST de las pruebas visuales se interceptan; no se escriben notas de prueba en los datos reales.
- Compilación local con el mismo código/rutas/adaptador y el hook de sincronización desactivado, para separar QA y migración real.

Las decisiones de pesos y los textos necesitan validación de uso con juegos conocidos. Este cambio corrige el significado de los niveles y elimina bonus duplicados; no garantiza por sí solo que toda nota coincida con la intuición inicial del usuario.

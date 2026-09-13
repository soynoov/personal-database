# Géneros de la biblioteca

Revisión: 13 de septiembre de 2026.

La clasificación se guarda en `games.json` y en el mismo registro de Vercel Blob. No hay una lista alternativa para la ruleta. `getGameGenres()` normaliza aliases, elimina duplicados y coloca las familias genéricas al final, sin inferir géneros del título.

## Criterio editorial

- Primero la mecánica reconocible (Shooter, Puzles, Plataformas, Simulación, Lucha, etc.); después hasta dos rasgos relevantes. Acción y Aventura siguen siendo válidos, pero no desplazan una pista más específica.
- Géneros y subgéneros de juego, no una importación de todos los tags populares de Steam: se contrastan descripción y mecánicas. No basta jugar en primera persona para ser un shooter (Portal 2 es Puzles / Plataformas).
- FPS, TPS y Disparos se unifican como Shooter; Simuladores como Simulación; Puzzle/Puzzles como Puzles.
- Indie describe producción, no mecánica. Free to Play y Early Access son etiquetas: los indicadores existentes se conservan trasladándolos a `tags`. No se deduce una compra gratis ni se modifica ningún dato personal.
- Las categorías de `steam_store_genres` se conservan crudas; la sincronización de cápsulas no sobrescribe `generos`. Para futuras altas, contrastar la descripción oficial y guardar 1–3 géneros concretos.
- Este es un criterio editorial de NooVDB apoyado en las fuentes, no una taxonomía oficial de Steam. Los casos que ya eran correctos conservan sus géneros.

## Registro de cambios

Se actualizan `generos` y, cuando procede, se conservan flags previos en `tags`. Soulworker y Governor of Poker 3 pasan a guardar explícitamente el modo Multijugador que antes se deducía de «Multijugador masivo»; no cambia su comportamiento ni la aplicabilidad de Comunidad. Horas, compras, notas, logros, copias, DLC, créditos, fechas y metadatos originales de Steam permanecen intactos. La escritura remota usa ETag y copia de respaldo.

| Juego | Géneros revisados | Base de la revisión |
|---|---|---|
| Friday the 13th: The Game | Terror · Supervivencia | [Descripción y mecánicas](https://store.steampowered.com/app/438740/) |
| MiSide | Terror · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/2527500/) |
| Stray | Puzles · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/1332010/) |
| Firewatch | Aventura narrativa | [Descripción y mecánicas](https://store.steampowered.com/app/383870/) |
| Ori and the Blind Forest | Plataformas · Metroidvania | [Descripción y mecánicas](https://store.steampowered.com/app/387290/) |
| Ori and the Will of the Wisps | Plataformas · Metroidvania | [Descripción y mecánicas](https://store.steampowered.com/app/1057090/) |
| A Plague Tale: Innocence | Sigilo · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/752590/) |
| A Plague Tale: Requiem | Sigilo · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/1182900/) |
| Resonance: A Plague Tale Legacy | Acción · Aventura | [Descripción y mecánicas](https://www.focus-entmt.com/en/games/resonance-a-plague-tale-legacy) |
| Oddsparks | Automatización · Estrategia | [Descripción y mecánicas](https://remote.handy-games.com/en/games/oddsparks/) |
| Paralives | Simulación · Construcción | [Descripción y mecánicas](https://store.steampowered.com/app/1118520/) |
| Baldur's Gate 3 | Rol · Por turnos | [Descripción y mecánicas](https://store.steampowered.com/app/1086940/) |
| Cult of the Lamb | Roguelike · Gestión | [Descripción y mecánicas](https://store.steampowered.com/app/1313140/) |
| Cuphead | Plataformas · Shooter | [Descripción y mecánicas](https://store.steampowered.com/app/268910/) |
| Dispatch | Aventura narrativa · Gestión | [Descripción y mecánicas](https://store.steampowered.com/app/2592160/) |
| Farming Simulator 19 | Simulación · Gestión | [Descripción y mecánicas](https://store.steampowered.com/app/787860/) |
| Farming Simulator 22 | Simulación · Gestión | [Descripción y mecánicas](https://store.steampowered.com/app/1248130/) |
| Forager | Supervivencia · Sandbox | [Descripción y mecánicas](https://store.steampowered.com/app/751780/) |
| Grand Theft Auto V Enhanced | Mundo abierto · Acción · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/3240220/) |
| Marvel Rivals | Shooter · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/2767030/) |
| Muse Dash | Ritmo · Plataformas | [Descripción y mecánicas](https://store.steampowered.com/app/774171/) |
| Phasmophobia | Terror · Investigación | [Descripción y mecánicas](https://store.steampowered.com/app/739630/) |
| R.E.P.O. | Terror · Supervivencia | [Descripción y mecánicas](https://store.steampowered.com/app/3241660/) |
| Satisfactory | Automatización · Gestión | [Descripción y mecánicas](https://store.steampowered.com/app/526870/) |
| Schedule I | Gestión · Simulación | [Descripción y mecánicas](https://store.steampowered.com/app/3164500/) |
| Star Birds | Automatización · Gestión | [Descripción y mecánicas](https://store.steampowered.com/app/2719750/) |
| Metro: Last Light Complete Edition | Shooter · Terror | [Descripción y mecánicas](https://store.steampowered.com/app/287390/) |
| Mini Airways | Simulación · Gestión | [Descripción y mecánicas](https://store.steampowered.com/app/2289650/) |
| Mini Motorways | Gestión · Estrategia | [Descripción y mecánicas](https://store.steampowered.com/app/1127500/) |
| Monster Hunter: World | Rol · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/582010/) |
| MultiVersus | Lucha · Plataformas | [Descripción y mecánicas](https://store.steampowered.com/app/1818750/) |
| Outlast | Terror · Supervivencia | [Descripción y mecánicas](https://store.steampowered.com/app/238320/) |
| PAYDAY 2 | Shooter · Acción · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/218620/) |
| Plague Inc: Evolved | Estrategia · Simulación | [Descripción y mecánicas](https://store.steampowered.com/app/246620/) |
| Portal 2 | Puzles · Plataformas | [Descripción y mecánicas](https://store.steampowered.com/app/620/) |
| Potion Craft: Alchemist Simulator | Simulación · Gestión | [Descripción y mecánicas](https://store.steampowered.com/app/1210320/) |
| Raft | Supervivencia · Sandbox | [Descripción y mecánicas](https://store.steampowered.com/app/648800/) |
| Reigns: Her Majesty | Cartas · Gestión | [Descripción y mecánicas](https://store.steampowered.com/app/717640/) |
| Rocket League | Deportes · Carreras | [Descripción y mecánicas](https://store.steampowered.com/app/252950/) |
| Sid Meier's Civilization VI | Estrategia · Por turnos | [Descripción y mecánicas](https://store.steampowered.com/app/289070/) |
| Slime Rancher 2 | Simulación · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/1657630/) |
| Soulworker | Rol · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/1377580/) |
| Stacklands | Cartas · Gestión | [Descripción y mecánicas](https://store.steampowered.com/app/1948280/) |
| Stardew Valley | Simulación · Rol | [Descripción y mecánicas](https://store.steampowered.com/app/413150/) |
| Subnautica | Supervivencia · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/264710/) |
| Surviving Mars | Construcción · Gestión · Simulación | [Descripción y mecánicas](https://store.steampowered.com/app/464920/) |
| Terraria | Supervivencia · Sandbox | [Descripción y mecánicas](https://store.steampowered.com/app/105600/) |
| The Binding of Isaac: Rebirth | Roguelike · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/250900/) |
| The Elder Scrolls V: Skyrim | Rol · Mundo abierto | [Descripción y mecánicas](https://store.steampowered.com/app/489830/) |
| The Escapists | Estrategia · Simulación | [Descripción y mecánicas](https://store.steampowered.com/app/298630/) |
| The Walking Dead: The Telltale Definitive Series | Aventura narrativa | [Descripción y mecánicas](https://store.steampowered.com/app/1449690/) |
| The Witcher 3: Wild Hunt | Rol · Mundo abierto | [Descripción y mecánicas](https://store.steampowered.com/app/292030/) |
| The Witness | Puzles | [Descripción y mecánicas](https://store.steampowered.com/app/210970/) |
| Tom Clancy's Rainbow Six Siege | Shooter · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/359550/) |
| Townscaper | Construcción · Sandbox | [Descripción y mecánicas](https://store.steampowered.com/app/1291340/) |
| Undertale | Rol | Normalización del dato existente |
| Unpacking | Puzles | [Descripción y mecánicas](https://store.steampowered.com/app/1135690/) |
| Urban Rivals | Cartas · Estrategia | [Descripción y mecánicas](https://store.steampowered.com/app/715310/) |
| XCOM 2 | Estrategia · Por turnos | [Descripción y mecánicas](https://store.steampowered.com/app/268500/) |
| 60 Seconds! Reatomized | Supervivencia · Gestión | [Descripción y mecánicas](https://store.steampowered.com/app/1012880/) |
| Amnesia: The Dark Descent | Terror · Supervivencia | [Descripción y mecánicas](https://store.steampowered.com/app/57300/) |
| Among Us | Deducción social | [Descripción y mecánicas](https://store.steampowered.com/app/945360/) |
| Apex Legends | Shooter · Battle royale | [Descripción y mecánicas](https://store.steampowered.com/app/1172470/) |
| Atomic Heart | Shooter · Acción · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/668580/) |
| Bandle Tale: A League of Legends Story | Rol · Simulación | [Descripción y mecánicas](https://store.steampowered.com/app/1759380/) |
| Beyond: Two Souls | Aventura narrativa | [Descripción y mecánicas](https://store.steampowered.com/app/960990/) |
| Borderlands 2 | Shooter · Rol | [Descripción y mecánicas](https://store.steampowered.com/app/49520/) |
| Catherine Classic | Puzles · Plataformas | [Descripción y mecánicas](https://store.steampowered.com/app/893180/) |
| Celeste | Plataformas · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/504230/) |
| Counter-Strike 2 | Shooter · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/730/) |
| Cyberpunk 2077 | Rol · Mundo abierto | [Descripción y mecánicas](https://store.steampowered.com/app/1091500/) |
| Dead by Daylight | Terror · Supervivencia | [Descripción y mecánicas](https://store.steampowered.com/app/381210/) |
| Destiny 2 | Shooter · Rol | [Descripción y mecánicas](https://store.steampowered.com/app/1085660/) |
| Detroit: Become Human | Aventura narrativa | [Descripción y mecánicas](https://store.steampowered.com/app/1222140/) |
| Don't Starve Together | Supervivencia · Sandbox | [Descripción y mecánicas](https://store.steampowered.com/app/322330/) |
| Dying Light | Supervivencia · Terror · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/239140/) |
| Eternal Return | Battle royale · MOBA · Supervivencia | [Descripción y mecánicas](https://store.steampowered.com/app/1049590/) |
| Euro Truck Simulator 2 | Simulación | [Descripción y mecánicas](https://store.steampowered.com/app/227300/) |
| Fallout 4 | Rol · Mundo abierto | [Descripción y mecánicas](https://store.steampowered.com/app/377160/) |
| Fallout Shelter | Gestión · Simulación | [Descripción y mecánicas](https://store.steampowered.com/app/588430/) |
| Garry's Mod | Sandbox | [Descripción y mecánicas](https://store.steampowered.com/app/4000/) |
| Ghost of Tsushima Director's Cut | Mundo abierto · Acción · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/2215430/) |
| Gotham Knights | Rol · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/1496790/) |
| Governor of Poker 3 | Cartas | [Descripción y mecánicas](https://store.steampowered.com/app/436150/) |
| Grand Theft Auto IV: The Complete Edition | Mundo abierto · Acción · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/12210/) |
| Grand Theft Auto V Legacy | Mundo abierto · Acción · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/271590/) |
| GRIS | Plataformas · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/683320/) |
| Hades | Roguelike · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/1145360/) |
| Heartopia | Simulación · Construcción | [Descripción y mecánicas](https://store.steampowered.com/app/4025700/) |
| Hogwarts Legacy | Rol · Mundo abierto | [Descripción y mecánicas](https://store.steampowered.com/app/990080/) |
| Hollow Knight | Plataformas · Metroidvania | [Descripción y mecánicas](https://store.steampowered.com/app/367520/) |
| It Takes Two | Plataformas · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/1426210/) |
| Just Cause 3 | Shooter · Mundo abierto · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/225540/) |
| Left 4 Dead 2 | Shooter · Terror | [Descripción y mecánicas](https://store.steampowered.com/app/550/) |
| Little Nightmares | Terror · Plataformas · Puzles | [Descripción y mecánicas](https://store.steampowered.com/app/424840/) |
| MARVEL SNAP | Cartas · Estrategia | [Descripción y mecánicas](https://store.steampowered.com/app/1997040/) |
| A Game About Digging A Hole | Simulación · Exploración | [Descripción y mecánicas](https://store.steampowered.com/app/3244220/) |
| Metaphor: ReFantazio | Rol · Por turnos | [Descripción y mecánicas](https://store.steampowered.com/app/2679460/) |
| Metro 2033 | Shooter · Terror | [Descripción y mecánicas](https://store.steampowered.com/app/286690/) |
| Valorant | Shooter · Acción | [Descripción y mecánicas](https://playvalorant.com/en-us/) |
| League of Legends | MOBA · Estrategia | [Descripción y mecánicas](https://www.leagueoflegends.com/en-us/how-to-play/) |
| Teamfight Tactics | Auto battler · Estrategia | [Descripción y mecánicas](https://teamfighttactics.leagueoflegends.com/en-us/) |
| League of Legends: Wild Rift | MOBA · Estrategia | [Descripción y mecánicas](https://wildrift.leagueoflegends.com/en-us/) |
| Legends of Runeterra | Cartas · Estrategia | [Descripción y mecánicas](https://play.google.com/store/apps/details?id=com.riotgames.legendsofruneterra) |
| 2XKO | Lucha | [Descripción y mecánicas](https://2xko.riotgames.com/) |
| Sea of Remnants | Rol · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/3633680/) |
| Goblin Cleanup | Simulación | [Descripción y mecánicas](https://store.steampowered.com/app/2748340/) |
| Genshin Impact | Rol · Mundo abierto | [Descripción y mecánicas](https://www.xbox.com/en-US/games/genshin-impact/) |
| Honkai Impact 3rd | Rol · Acción | [Descripción y mecánicas](https://store.epicgames.com/p/honkai-impact-3rd) |
| Honkai: Star Rail | Rol · Por turnos | [Descripción y mecánicas](https://store.epicgames.com/en-US/p/honkai-star-rail) |
| Tears of Themis | Aventura narrativa · Investigación | [Descripción y mecánicas](https://play.google.com/store/apps/details?id=com.miHoYo.tot.glb) |
| Zenless Zone Zero | Rol · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/4162040/) |
| Two Point Museum | Simulación · Gestión | [Descripción y mecánicas](https://store.steampowered.com/app/2185060/) |
| The Lift Playtest | Simulación | [Descripción y mecánicas](https://store.steampowered.com/app/3916290/) |
| Banana | Incremental | [Descripción y mecánicas](https://store.steampowered.com/app/2923300/) |
| Brawlhalla | Lucha · Plataformas | [Descripción y mecánicas](https://store.steampowered.com/app/291550/) |
| Paladins | Shooter · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/444090/) |
| River City Girls | Beat 'em up · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/1049320/) |
| River City Girls 2 | Beat 'em up · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/1920480/) |
| Star Wars Outlaws | Mundo abierto · Acción · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/2842040/) |
| Ultimate Chicken Horse | Plataformas | [Descripción y mecánicas](https://store.steampowered.com/app/386940/) |
| Titan Souls | Acción · Aventura | Normalización del dato existente |
| Graveyard Keeper | Simulación · Rol | [Descripción y mecánicas](https://store.steampowered.com/app/599140/) |
| A Story About My Uncle | Plataformas · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/278360/) |
| HITMAN | Sigilo · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/236870/) |
| Spec Ops: The Line | Shooter · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/50300/) |
| SteamWorld Dig | Plataformas · Metroidvania | [Descripción y mecánicas](https://store.steampowered.com/app/252410/) |
| Company of Heroes 2 | Estrategia · Tiempo real | [Descripción y mecánicas](https://store.steampowered.com/app/231430/) |
| The You Quiz | Preguntas y respuestas | [Descripción y mecánicas](https://store.steampowered.com/app/3669740/) |
| Hextech Mayhem: A League of Legends Story | Ritmo · Plataformas | [Descripción y mecánicas](https://store.steampowered.com/app/1651960/) |
| Wallpaper Engine | Software | [Descripción y mecánicas](https://store.steampowered.com/app/431960/) |
| Seek Girl | Casual | [Descripción y mecánicas](https://store.steampowered.com/app/998930/) |
| Seek Girl II | Puzles | [Descripción y mecánicas](https://store.steampowered.com/app/1149660/) |
| Seek Girl III | Puzles | [Descripción y mecánicas](https://store.steampowered.com/app/1191210/) |
| Grand Theft Auto: San Andreas | Mundo abierto · Acción · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/12120/) |
| Burgie's Cozy Kitchen | Simulación · Incremental | [Descripción y mecánicas](https://store.steampowered.com/app/3314340/) |
| Berry Bury Berry | Incremental | [Descripción y mecánicas](https://store.steampowered.com/app/3370870/) |
| The Farmer Was Replaced | Programación · Automatización · Puzles | [Descripción y mecánicas](https://store.steampowered.com/app/2060160/) |
| Sifu | Beat 'em up · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/2138710/) |
| Wolfenstein: The New Order | Shooter · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/201810/) |
| Viewfinder | Puzles · Plataformas | [Descripción y mecánicas](https://store.steampowered.com/app/1382070/) |
| Tiny Tina's Wonderlands | Shooter · Rol | [Descripción y mecánicas](https://store.steampowered.com/app/1286680/) |
| Marvel's Midnight Suns | Estrategia · Cartas · Rol | [Descripción y mecánicas](https://store.steampowered.com/app/368260/) |
| Marvel's Guardians of the Galaxy | Shooter · Acción · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/1088850/) |
| Among the Sleep - Enhanced Edition | Terror · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/250620/) |
| Little Inferno | Puzles | [Descripción y mecánicas](https://store.steampowered.com/app/221260/) |
| Fall Guys | Plataformas · Battle royale | [Descripción y mecánicas](https://store.steampowered.com/app/1097150/) |
| Car Mechanic Simulator 2018 | Simulación · Gestión | [Descripción y mecánicas](https://store.steampowered.com/app/645630/) |
| Prison Architect | Construcción · Gestión · Simulación | [Descripción y mecánicas](https://store.steampowered.com/app/233450/) |
| Jurassic World Evolution | Construcción · Gestión · Simulación | [Descripción y mecánicas](https://store.steampowered.com/app/648350/) |
| Cities: Skylines | Construcción · Gestión · Simulación | [Descripción y mecánicas](https://store.steampowered.com/app/255710/) |
| Slime Rancher | Simulación · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/433340/) |
| Palworld | Supervivencia · Sandbox | [Descripción y mecánicas](https://store.steampowered.com/app/1623730/) |
| Far Cry 3 | Shooter · Mundo abierto · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/220240/) |
| Blasphemous 2 | Plataformas · Metroidvania | [Descripción y mecánicas](https://store.steampowered.com/app/2114740/) |
| Sid Meier's Civilization VII | Estrategia · Por turnos | [Descripción y mecánicas](https://store.steampowered.com/app/1295660/) |
| DOOM | Shooter · Acción | [Descripción y mecánicas](https://en.wikipedia.org/wiki/Doom_(1993_video_game)) |
| Minecraft | Supervivencia · Sandbox | [Descripción y mecánicas](https://www.minecraft.net/en-us/about-minecraft) |
| Clash of Clans | Estrategia · Tiempo real | [Descripción y mecánicas](https://supercell.com/en/games/clashofclans/) |
| Clash Royale | Cartas · Estrategia | [Descripción y mecánicas](https://supercell.com/en/games/clashroyale/) |
| Call of Duty: Black Ops | Shooter · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/42700/) |
| Pokémon Espada | Rol · Por turnos | [Descripción y mecánicas](https://www.nintendo.com/es-es/Juegos/Juegos-de-Nintendo-Switch/Pokemon-Espada-1522111.html) |
| Pokémon Escarlata | Rol · Por turnos | [Descripción y mecánicas](https://www.nintendo.com/es-es/Juegos/Juegos-de-Nintendo-Switch/Pokemon-Escarlata-2179556.html) |
| Injustice 2 | Lucha | [Descripción y mecánicas](https://store.steampowered.com/app/627270/) |
| Mortal Kombat X | Lucha | [Descripción y mecánicas](https://store.steampowered.com/app/307780/) |
| Street Fighter 6 | Lucha | [Descripción y mecánicas](https://store.steampowered.com/app/1364780/) |
| Need for Speed Unbound | Carreras | [Descripción y mecánicas](https://store.steampowered.com/app/1846380/) |
| Red Dead Redemption 2 | Mundo abierto · Acción · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/1174180/) |
| Control | Shooter · Acción · Aventura | [Descripción y mecánicas](https://store.steampowered.com/app/870780/) |
| Los Sims 4 | Simulación · Construcción | [Descripción y mecánicas](https://store.steampowered.com/app/1222670/) |
| Half-Life 2 | Shooter · Acción | [Descripción y mecánicas](https://store.steampowered.com/app/220/) |
| Fortnite | Shooter · Battle royale | [Descripción y mecánicas](https://www.fortnite.com/news/announcing-fortnite-battle-royale?lang=en-US) |
| The Last of Us | Supervivencia · Acción · Aventura | Normalización del dato existente |
| The Last of Us Part II | Supervivencia · Acción · Aventura | Normalización del dato existente |
| SMITE 2 | MOBA · Estrategia | [Descripción y mecánicas](https://store.steampowered.com/app/2437170/) |

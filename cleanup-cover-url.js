#!/usr/bin/env node
/**
 * cleanup-cover-url.js
 * Elimina todos los campos "cover_url" de games.json (nivel juego y nivel DLC).
 * Ejecutar una sola vez desde la raíz del proyecto:
 *   node cleanup-cover-url.js
 */

const fs = require("fs");
const path = require("path");

const gamesPath = path.resolve(__dirname, "games.json");
const raw = fs.readFileSync(gamesPath, "utf8");
const games = JSON.parse(raw.replace(/^﻿/, "")); // strip BOM

let removed = 0;

function strip(obj) {
  if (!obj || typeof obj !== "object") return;
  if ("cover_url" in obj) {
    delete obj.cover_url;
    removed++;
  }
  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) value.forEach(strip);
    else if (value && typeof value === "object") strip(value);
  }
}

games.forEach(strip);

fs.writeFileSync(gamesPath, JSON.stringify(games, null, 2), "utf8");
console.log(`✓ ${removed} campos cover_url eliminados de games.json`);

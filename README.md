# 🧠 MINDHUB

MINDHUB è una dashboard multimediale e hub mentale scura, pulita e minimale, progettata per centralizzare film, musica, appunti e attività in un unico secondo cervello interconnesso.

## 🚀 Caratteristiche Principali
* **Doppia Visualizzazione (Home View Switcher):** Possibilità di switchare istantaneamente tramite un toggle discreto nella sidebar tra la visualizzazione "a Cartelle" (Cinema, Appunti, Musica, To Do List) e la visualizzazione "Dashboard" analitica (stile Netflix/Spotify).
* **Integrazione API Esterne:** Sincronizzazione dinamica dei contenuti tramite le API di TMDB (Film) e iTunes (Musica).
* **Fuzzy Search Integrata:** Barra di ricerca sticky globale accessibile tramite shortcut `Ctrl + K` per filtrare istantaneamente ogni contenuto.
* **Sistema di Rating:** Badge visivi e anelli di valutazione circolari dinamici basati sui voti del database.

## 📁 Struttura del Progetto
* `/backend` — Logica server, configurazioni, controller, rotte e servizi Node.js.
* `/public` — Frontend in Vanilla JS e CSS puro organizzato in moduli e feature.
  * `/core` — Componenti globali condivisi (Sidebar, layout di base, gestione DOM).
  * `/features` — Moduli dedicati alle singole sezioni (movies, music, notes, todos, dashboard).

## 🛠️ Tecnologie Utilizzate
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **Frontend:** Vanilla JS (ES6+), HTML5, CSS Grid / Flexbox (No Framework)
* **Infrastruttura:** Containerizzazione tramite Podman

## 🏃‍♂️ Come Avviare il Progetto
1. Installa le dipendenze: `npm install`
2. Configura il file `.env` con le tue credenziali di database e chiavi API.
3. Avvia l'ambiente tramite la CLI di Antigravity o Node.js.

---
*MINDHUB — Il tuo archivio mentale, ordinato.*
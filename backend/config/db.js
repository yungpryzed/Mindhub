// FILE: backend/config/db.js
// Punto di contatto tra Node e il db
const { Pool } = require("pg");  // Pool crea più sportelli aperti contemporaneamente
// Node.js assegna una connessione libera a un utente, fa la query e poi rimette la connessione nel serbatoio, rendendo l'app velocissima.

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set"); // Controlla se esiste la stringa per connettersi al db
}

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl:
		process.env.NODE_ENV === "production"
			? { rejectUnauthorized: false }     // Utilizza l'SSL in produzione, ma non in locale
			: undefined,
});

module.exports = pool; 
// Esportiamo così basterà fare const pool = require("./db") per ogni volta che devo fare domande al db
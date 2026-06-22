require("dotenv").config(); // Carica il file .env per mettere le variabili segrete a dispoziione di tutti

const express = require("express"); // Trasforma ogni body in una richiesta js e lo mette nel req.body
const cors = require("cors");
const authRouter = require("./backend/routes/authRouter"); // Importiamo l'autenticazione (login e register)
const contentRoutes = require("./backend/routes/contentRouter"); // Importiamo i contenuti (pensieri e liste)
const tmdbRouter = require("./backend/routes/tmdbRouter"); // Importiamo ricerca film TMDB

const app = express(); // app è il nostro server Express, tutto verrà fatto trmaite lui

app.use(cors()); // Permette eseguire richieste backend anche da porte come 5173 invece che la 3000
// Parse JSON and keep a copy of the raw body for debugging malformed payloads
app.use(express.json({
	verify: (req, _res, buf) => {
		try {
			req.rawBody = buf && buf.length ? buf.toString() : "";
		} catch (e) {
			req.rawBody = undefined;
		}
	},
}));

// Serve una pagina statica di test
app.use(express.static("public"));

app.use("/auth", authRouter);
app.use("/contents", contentRoutes);
app.use("/tmdb", tmdbRouter);

app.get("/health", (_req, res) => { // È come un medico che sente il polso: se il server risponde "ok", lo lasciano online. Se non risponde, lo riavviano automaticamente perché capiscono che è crashato
	res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`MindHub API listening on port ${PORT}`);
});

// Error handler for invalid JSON bodies (body-parser SyntaxError)
app.use((err, req, res, next) => {
	if (err && err.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400 && 'body' in err)) {
		console.error('Invalid JSON payload received for', req.method, req.url);
		console.error('Content-Type:', req.headers['content-type']);
		console.error('Raw body:', req.rawBody);
		return res.status(400).json({ message: 'Invalid JSON payload.' });
	}
	next(err);
});

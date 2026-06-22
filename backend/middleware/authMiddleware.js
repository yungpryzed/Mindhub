// si mette davanti alle stanze private del nostro server (le rotte protette come la futura creazione
// di note o liste) e controlla che chi sta bussando abbia un braccialetto VIP (un token JWT) valido e non scaduto

const jwt = require("jsonwebtoken"); // Libreria per creare e verificare i token JWT (Permettono solo a determinati utenti di accedere a determinate rotte)

//  req: richiesta dell'utente
//  res: risposta del server
//  next: funzione che dice "ok, puoi entrare adesso"   
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization; // Legge dentro l'header della richiesta HTTP e prende authorization (token)

  // controlla se il token esiste e se inizia con "Bearer " (è lo standard per i token JWT, significa "Portatore di questo token")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token required." });
  }

  // [Bearer] [eyJhbGciOi] splittiamo in array e prendiamo il 2 (il token)
  const token = authHeader.split(" ")[1];

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set"); // Classico controllo per vedere se .env è configurato
    }
    // verify controlla se il token è valido e non scaduto, se è tutto ok, restituisce il payload (i dati dentro il token, come id e email dell'utente)
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // payload è un oggetto con id e email, lo mettiamo dentro req.user così le rotte protette possono sapere chi è l'utente che sta facendo la richiesta

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." }); // Se scade o viene manomesso, non lo fa entrare
  }
};

module.exports = authMiddleware;


// Il vassoio (req) entra nel server. Il buttafuori (authMiddleware.js) lo intercetta, prende il token dall'header, lo decodifica,
// prende l'ID dell'utente (il payload) e lo posa sopra il vassoio scrivendo req.user = payload. Poi chiama next(), 
// che fa scorrere il vassoio sul nastro trasportatore fino alla rotta finale. Quando la rotta finale riceve il vassoio,
// non deve fare nessun controllo di sicurezza! Sa già che se il vassoio è arrivato fin lì, il buttafuori lo ha approvato.
// La rotta finale deve solo allungare la mano, guardare sul vassoio e leggere req.user.userId
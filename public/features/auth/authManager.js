import { apiFetch } from "../../core/api.js";

const TOKEN_KEY = "mindhub_token";

export const authManager = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
  
  hasToken: () => Boolean(localStorage.getItem(TOKEN_KEY)),

  login: async (email, password) => {
    // Si allinea al mount router di Express (app.use("/auth", authRouter))
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      authManager.setToken(data.token);
    }
    return data;
  },

  // Metodo per montare in modo sicuro la logica sulla UI (risolve il Silent Failure)
  attachLoginForm: (formId, emailId, passwordId, errorId, onSuccessCallback) => {
    document.addEventListener("submit", async (e) => {
      if (e.target.id !== formId) {
        return;
      }

      e.preventDefault();
      console.log("LOGIN BLOCCATO E INTERCETTATO");

      const emailElement = document.getElementById(emailId);
      const passwordElement = document.getElementById(passwordId);
      const errorElement = document.getElementById(errorId);

      if (!emailElement || !passwordElement) {
        console.error("Email or password input fields not found.");
        if (errorElement) errorElement.textContent = "Errore di configurazione del form.";
        return;
      }

      const email = emailElement.value;
      const password = passwordElement.value;
      if (errorElement) errorElement.textContent = "";

      try {
        const data = await authManager.login(email, password);
        if (data.token) {
          if (onSuccessCallback) onSuccessCallback();
        } else {
          if (errorElement) errorElement.textContent = data.message || "Login fallito.";
        }
      } catch (error) {
        console.error("Errore di autenticazione frontend:", error);
        if (errorElement) errorElement.textContent = error.message || "Login fallito: Errore di connessione.";
      }
    });
  }
};
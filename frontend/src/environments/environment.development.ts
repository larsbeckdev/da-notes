// Konfiguration für die lokale Entwicklung (`ng serve`).
//
// Die API-Host wird aus der Adresse abgeleitet, unter der die App im Browser
// geöffnet ist. Damit funktioniert sowohl http://localhost:4200 als auch der
// Aufruf über die Netzwerk-IP, ohne dass hier etwas angepasst werden muss.
// Nur der Port ist fest und muss zu BACKEND_PORT aus der .env passen.
const backendPort = 8300;

export const environment = {
  production: false,
  apiUrl: `http://${window.location.hostname}:${backendPort}/notes/`,
};

// Konfiguration für die lokale Entwicklung (`ng serve`).
//
// Hinter einem Reverse-Proxy (nginx) liegt die API unter demselben Origin wie
// die App, deshalb genügt ein relativer Pfad. Beim direkten Zugriff auf den
// Dev-Server ohne Proxy fehlt diese Weiterleitung, dort wird der Backend-Port
// aus der aufgerufenen Adresse abgeleitet.
//
// Erkennungsmerkmal: der Dev-Server läuft auf FRONTEND_PORT, ein Proxy
// dagegen auf 80/443 ohne sichtbaren Port.
const devServerPort = '4200';
const backendPort = 8300;

const isDirectDevServer = window.location.port === devServerPort;

export const environment = {
  production: false,
  apiUrl: isDirectDevServer
    ? `http://${window.location.hostname}:${backendPort}/notes/`
    : '/notes/',
};

// Configuration for local development (`ng serve`).
//
// Behind a reverse proxy (nginx) the API lives on the same origin as the app,
// so a relative path is enough. When hitting the dev server directly without a
// proxy that forwarding is missing, so the backend port is derived from the
// address the app was opened with.
//
// Telltale sign: the dev server runs on FRONTEND_PORT, whereas a proxy runs on
// 80/443 without a visible port.
const devServerPort = '4200';
const backendPort = 8300;

const isDirectDevServer = window.location.port === devServerPort;

export const environment = {
  production: false,
  apiUrl: isDirectDevServer
    ? `http://${window.location.hostname}:${backendPort}/notes/`
    : '/notes/',
};

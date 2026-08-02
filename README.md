# DANotes

Eine Notizen-App mit Angular-Frontend und Django-REST-Backend. Notizen anlegen,
bearbeiten, als wichtig markieren und in den Papierkorb verschieben.

| | |
| --- | --- |
| **Frontend** | Angular 17 (Standalone Components) |
| **Backend** | Django 6 + Django REST Framework 3.17 |
| **Datenbank** | SQLite |
| **Betrieb** | Docker Compose oder lokal |

---

## Schnellstart mit Docker

Voraussetzung: Docker mit Compose v2 oder neuer.

```bash
cp .env.example .env      # einmalig, danach SECRET_KEY eintragen
docker compose up -d --build
```

Danach erreichbar:

- Frontend — <http://localhost:4200>
- API — <http://localhost:8000/notes/>
- Django-Admin — <http://localhost:8000/admin/>

Beim ersten Start dauert es einen Moment, bis Angular durchkompiliert hat. Da
`-d` im Hintergrund läuft, siehst du den Fortschritt über die Logs:

```bash
docker compose logs -f            # beide Container, Abbruch mit Strg+C
docker compose logs -f frontend   # nur das Frontend
docker compose ps                 # Status und Ports
```

Beenden mit `docker compose down`. Der Zusatz `-v` löscht auch die Datenbank.

---

## Schnellstart ohne Docker

Zwei Terminals.

**Backend:**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # einmalig, danach SECRET_KEY eintragen
python manage.py migrate
python manage.py runserver
```

**Frontend:**

```bash
cd frontend
npm install
npm start
```

> Der Backend-Port muss zur `apiUrl` in
> `frontend/src/environments/environment.development.ts` passen. Standard ist
> beidseitig **8000**.

---

## API

Basis-URL: `http://127.0.0.1:8000/`

| Methode | Endpoint | Beschreibung |
| --- | --- | --- |
| `GET` | `/notes/` | Alle Notizen als flaches Array |
| `POST` | `/notes/` | Neue Notiz anlegen |
| `GET` | `/notes/{id}/` | Einzelne Notiz |
| `PUT` | `/notes/{id}/` | Notiz vollständig ersetzen |
| `PATCH` | `/notes/{id}/` | Notiz teilweise ändern |
| `DELETE` | `/notes/{id}/` | Notiz löschen |

Alle Endpoints brauchen den **abschließenden Slash**.

### Datenmodell

```json
{
  "id": 1,
  "title": "Einkaufsliste",
  "content": "Milch, Brot, Kaffee",
  "marked": false,
  "trash": false
}
```

| Feld | Typ | Hinweis |
| --- | --- | --- |
| `id` | Integer | Read-only, wird vom Server vergeben |
| `title` | String | max. 200 Zeichen |
| `content` | String | darf leer sein |
| `marked` | Boolean | als wichtig markiert |
| `trash` | Boolean | im Papierkorb |

Das Frontend filtert die Liste anhand von `marked` und `trash` selbst — es gibt
keine separaten Endpoints dafür.

### Beispiel

```bash
curl -X POST http://127.0.0.1:8000/notes/ \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Hallo","marked":false,"trash":false}'
```

---

## Projektstruktur

```text
da-notes/
├── compose.yml              # Docker-Stack: Frontend + Backend
├── .env.example             # Vorlage für .env (Ports, Django)
├── backend/
│   ├── core/                # Django-Projekt (settings, urls)
│   ├── notes_app/           # Model, Serializer, ViewSet, URLs
│   ├── .env.example         # Vorlage für Betrieb ohne Docker
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── environments/    # apiUrl je Build-Konfiguration
    │   └── app/
    │       ├── services/    # NoteListService (HTTP-Aufrufe)
    │       ├── interfaces/  # Note-Interface
    │       └── note-list/   # Komponenten
    └── Dockerfile
```

---

## Konfiguration

Keine Zugangsdaten im Quellcode. Alles läuft über `.env`-Dateien, die per
`.gitignore` ausgeschlossen sind. Vorlagen liegen als `.env.example` bei.

| Datei | Gilt für | Im Repo |
| --- | --- | --- |
| `.env` | Docker-Stack (Ports, Django) | nein |
| `.env.example` | Vorlage dazu | ja |
| `backend/.env` | Backend ohne Docker | nein |
| `backend/.env.example` | Vorlage dazu | ja |

Django lädt `backend/.env`, danach `backend/.env.local` (überschreibt). Für den
Docker-Betrieb reicht die `.env` im Projektroot.

| Variable | Default | Zweck |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | — | Signiert Sessions und CSRF-Tokens |
| `DJANGO_DEBUG` | `1` | Debug-Modus (`0` schaltet ab) |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Erlaubte Hosts, kommagetrennt |
| `DJANGO_DB_PATH` | `backend/db.sqlite3` | Pfad zur SQLite-Datei |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:4200,http://127.0.0.1:4200` | Erlaubte Frontend-Origins |
| `BACKEND_PORT` | `8000` | Host-Port des Backends (nur Docker) |
| `FRONTEND_PORT` | `4200` | Host-Port des Frontends (nur Docker) |

`DJANGO_SECRET_KEY` hat bewusst keinen Default. Bei `DEBUG=1` greift ein
Wegwerf-Key, bei `DEBUG=0` bricht der Start ab — so kann kein fehlender Key
unbemerkt in Produktion landen. Neuen Key erzeugen:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Port ändern

`BACKEND_PORT` in der `.env` setzen und dieselbe Zahl in
`frontend/src/environments/environment.development.ts` als `apiUrl` eintragen.
Beide Stellen müssen übereinstimmen, weil die Requests im Browser laufen und
nicht im Container-Netzwerk.

---

## Hinweise zum Docker-Setup

- **Hot Reload** funktioniert in beiden Containern. Quellcode ist per Volume
  gemountet; das Frontend nutzt Polling, damit File-Watching unter Windows
  zuverlässig greift.
- **Die Datenbank liegt in einem Named Volume** (`/app/data/db.sqlite3`), nicht
  im gemounteten Quellordner. Deine lokale `backend/db.sqlite3` bleibt davon
  unberührt — beide Setups haben getrennte Daten.
- **Der Browser spricht direkt mit dem Host-Port**, nicht mit dem
  Container-Hostnamen. Die HTTP-Requests laufen im Browser des Nutzers, nicht im
  Container, deshalb wird über die auf den Host gemappten Ports kommuniziert.

---

## Admin-Zugang

```bash
# Docker
docker compose exec backend python manage.py createsuperuser

# lokal
cd backend && python manage.py createsuperuser
```

Danach unter <http://localhost:8000/admin/> anmelden.

---

## Sicherheitshinweis

Dieses Projekt ist ein **Lernprojekt und für die lokale Entwicklung gedacht**.
Geheimnisse liegen ausschließlich in `.env`-Dateien, die nicht im Repository
sind. Für einen echten Deploy fehlt trotzdem mindestens:

- `DEBUG` ist standardmäßig aktiv und muss in Produktion auf `0`
- Die API hat keine Authentifizierung — jeder kann alle Notizen lesen und ändern
- SQLite eignet sich nicht für parallelen Produktionsbetrieb
- Der in der Git-Historie enthaltene Alt-Key aus `settings.py` sollte als
  kompromittiert gelten und niemals produktiv verwendet werden

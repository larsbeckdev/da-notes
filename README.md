# DANotes

Eine Notizen-App mit Angular-Frontend und Django-REST-Backend. Notizen anlegen,
bearbeiten, als wichtig markieren und in den Papierkorb verschieben.

| | |
|---|---|
| **Frontend** | Angular 17 (Standalone Components) |
| **Backend** | Django 6 + Django REST Framework 3.17 |
| **Datenbank** | SQLite |
| **Betrieb** | Docker Compose oder lokal |

---

## Schnellstart mit Docker

Voraussetzung: Docker mit Compose v2 oder neuer.

```bash
docker compose up --build
```

Danach erreichbar:

- Frontend — <http://localhost:4200>
- API — <http://localhost:8000/notes/>
- Django-Admin — <http://localhost:8000/admin/>

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
python manage.py migrate
python manage.py runserver
```

**Frontend:**

```bash
cd frontend
npm install
npm start
```

> Das Backend muss auf Port **8000** laufen. Die API-URL steht fest in
> `frontend/src/app/services/note-list.service.ts` und es gibt keine
> `environment`-Dateien in diesem Projekt.

---

## API

Basis-URL: `http://127.0.0.1:8000/`

| Methode | Endpoint | Beschreibung |
|---|---|---|
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
|---|---|---|
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

```
da-notes/
├── compose.yml              # Docker-Stack: Frontend + Backend
├── backend/
│   ├── core/                # Django-Projekt (settings, urls)
│   ├── notes_app/           # Model, Serializer, ViewSet, URLs
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
    ├── src/app/
    │   ├── services/        # NoteListService (HTTP-Aufrufe)
    │   ├── interfaces/      # Note-Interface
    │   └── note-list/       # Komponenten
    └── Dockerfile
```

---

## Konfiguration

Das Backend liest folgende Umgebungsvariablen. Ohne gesetzte Werte greifen die
Defaults, die dem lokalen Entwicklungs-Setup entsprechen.

| Variable | Default | Zweck |
|---|---|---|
| `DJANGO_DEBUG` | `1` | Debug-Modus (`0` schaltet ab) |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Erlaubte Hosts, kommagetrennt |
| `DJANGO_DB_PATH` | `backend/db.sqlite3` | Pfad zur SQLite-Datei |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:4200,http://127.0.0.1:4200` | Erlaubte Frontend-Origins |

Siehe `backend/.env.example`. Die Werte für Docker stehen in `compose.yml`.

---

## Hinweise zum Docker-Setup

- **Hot Reload** funktioniert in beiden Containern. Quellcode ist per Volume
  gemountet; das Frontend nutzt Polling, damit File-Watching unter Windows
  zuverlässig greift.
- **Die Datenbank liegt in einem Named Volume** (`/app/data/db.sqlite3`), nicht
  im gemounteten Quellordner. Deine lokale `backend/db.sqlite3` bleibt davon
  unberührt — beide Setups haben getrennte Daten.
- **Der Browser spricht direkt mit `127.0.0.1:8000`**, nicht mit dem
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
Für einen echten Deploy fehlen mindestens:

- `SECRET_KEY` steht im Klartext in `core/settings.py` und gehört in eine
  Umgebungsvariable
- `DEBUG` ist standardmäßig aktiv und muss in Produktion aus
- Die API hat keine Authentifizierung — jeder kann alle Notizen lesen und ändern
- SQLite eignet sich nicht für parallelen Produktionsbetrieb

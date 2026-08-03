# DANotes

A notes app with an Angular frontend and a Django REST backend. Create and edit
notes, mark them as important and move them to the trash.

| | |
| --- | --- |
| **Frontend** | Angular 17 (standalone components) |
| **Backend** | Django 6 + Django REST Framework 3.17 |
| **Database** | SQLite |
| **Deployment** | Docker Compose or local |

---

## Quick start with Docker

Requirement: Docker with Compose v2 or newer.

```bash
cp .env.example .env                          # once, fill in SECRET_KEY
docker compose --profile dev up -d --build
```

For running behind a domain there is a second profile that serves a compiled
build from nginx:

```bash
docker compose --profile prod up -d --build
```

Reachable afterwards:

- Frontend — <http://localhost:4200>
- API — <http://localhost:8000/notes/> (in the `prod` profile under `:4200/notes/`)
- Django admin — <http://localhost:8000/admin/>

On the first start it takes a moment until Angular has compiled. Since `-d` runs
in the background, you follow the progress through the logs:

```bash
docker compose logs -f            # both containers, stop with Ctrl+C
docker compose logs -f backend    # backend only
docker compose ps                 # status and ports
```

Stop with `docker compose down`. Adding `-v` also deletes the database.

---

## Quick start without Docker

Two terminals.

**Backend:**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # once, then fill in SECRET_KEY
python manage.py migrate
python manage.py runserver
```

**Frontend:**

```bash
cd frontend
npm install
npm start
```

> The backend port must match the `apiUrl` in
> `frontend/src/environments/environment.development.ts`. The default on both
> sides is **8000**.

---

## API

Base URL: `http://127.0.0.1:8000/`

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/notes/` | All notes as a flat array |
| `POST` | `/notes/` | Create a new note |
| `GET` | `/notes/{id}/` | A single note |
| `PUT` | `/notes/{id}/` | Replace a note entirely |
| `PATCH` | `/notes/{id}/` | Change a note partially |
| `DELETE` | `/notes/{id}/` | Delete a note |

All endpoints require the **trailing slash**.

### Data model

```json
{
  "id": 1,
  "title": "Shopping list",
  "content": "Milk, bread, coffee",
  "marked": false,
  "trash": false
}
```

| Field | Type | Note |
| --- | --- | --- |
| `id` | Integer | Read-only, assigned by the server |
| `title` | String | max. 200 characters |
| `content` | String | may be empty |
| `marked` | Boolean | marked as important |
| `trash` | Boolean | in the trash |

The frontend filters the list by `marked` and `trash` itself — there are no
separate endpoints for that.

### Example

```bash
curl -X POST http://127.0.0.1:8000/notes/ \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Hello","marked":false,"trash":false}'
```

---

## Project structure

```text
da-notes/
├── compose.yml              # Docker stack: frontend + backend
├── .env.example             # template for .env (ports, Django)
├── backend/
│   ├── core/                # Django project (settings, urls)
│   ├── notes_app/           # model, serializer, ViewSet, URLs
│   ├── .env.example         # template for running without Docker
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── environments/    # apiUrl per build configuration
    │   └── app/
    │       ├── services/    # NoteListService (HTTP calls)
    │       ├── interfaces/  # Note interface
    │       └── note-list/   # components
    └── Dockerfile
```

---

## Configuration

No credentials in the source code. Everything runs through `.env` files, which
are excluded via `.gitignore`. Templates ship as `.env.example`.

| File | Applies to | In the repo |
| --- | --- | --- |
| `.env` | Docker stack (ports, Django) | no |
| `.env.example` | template for it | yes |
| `backend/.env` | backend without Docker | no |
| `backend/.env.example` | template for it | yes |

Django loads `backend/.env`, then `backend/.env.local` (which overrides). For
Docker the `.env` in the project root is enough.

| Variable | Default | Purpose |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | — | Signs sessions and CSRF tokens |
| `DJANGO_DEBUG` | `1` | Debug mode (`0` turns it off) |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Allowed hosts, comma-separated |
| `DJANGO_DB_PATH` | `backend/db.sqlite3` | Path to the SQLite file |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:4200,http://127.0.0.1:4200` | Allowed frontend origins |
| `CSRF_TRUSTED_ORIGINS` | `https://da-notes.larsbeck.dev` | Public HTTPS addresses behind the proxy |
| `BACKEND_PORT` | `8000` | Host port of the backend (Docker only) |
| `FRONTEND_PORT` | `4200` | Host port of the frontend (Docker only) |

`DJANGO_SECRET_KEY` deliberately has no default. With `DEBUG=1` a throwaway key
kicks in, with `DEBUG=0` startup aborts — that way a missing key can never
silently reach production. Generate a new key:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Changing the port

Set `BACKEND_PORT` in the `.env` and enter the same number as `apiUrl` in
`frontend/src/environments/environment.development.ts`. Both places have to
match, because the requests run in the browser and not in the container network.

---

## Notes on the Docker setup

- **Hot reload** works in both containers. The source code is mounted as a
  volume; the frontend uses polling so that file watching works reliably on
  Windows.
- **The database lives in a named volume** (`/app/data/db.sqlite3`), not in the
  mounted source folder. Your local `backend/db.sqlite3` stays untouched — both
  setups have separate data.
- **The browser talks to the host port directly**, not to the container
  hostname. The HTTP requests run in the user's browser, not in the container,
  which is why communication goes through the ports mapped onto the host.

---

## Running behind a domain

The `prod` profile compiles Angular and serves the result through nginx. That
container forwards `/notes/` and `/admin/` to Django itself, so the upstream web
server only has to forward to a single port.

```bash
docker compose --profile prod up -d --build
```

For the upstream nginx (for example via ISPConfig) a single block is enough:

```nginx
location ~ / {
    proxy_pass http://10.80.0.195:4200;

    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-Ssl   on;
    access_log off;
}
```

The public address has to be listed in `CSRF_TRUSTED_ORIGINS`, otherwise Django
rejects writing requests. The `X-Forwarded-Proto` header is required so that
Django recognizes the externally terminated TLS connection.

The dev server from the `dev` profile is not suitable for a public domain: Vite
loads modules through internal `/@fs/` paths and blocks foreign hosts.

### Do not mix up the profiles

Both frontend containers occupy the same host port (`FRONTEND_PORT`), so remove
the old container before switching profiles:

```bash
docker compose ps                    # which image is running?
docker compose stop frontend && docker compose rm -f frontend
docker compose --profile prod up -d --build
```

`da-notes-frontend` is the dev image, `da-notes-frontend-prod` the production
image. After every change under `frontend/src` a rebuild is required for domain
operation.

If `dev` accidentally runs behind the domain, the symptoms are confusing: via
the IP with a visible port 4200 the app works, via the domain it does not. The
reason is `environment.development.ts` — with a visible port 4200 the request
goes straight to the backend, behind the proxy it goes to the relative path
`/notes/`, for which the dev server only serves `index.html`.

For domain problems, check locally on the Docker host first to separate the repo
side from the proxy side:

```bash
curl -I -H "Host: da-notes.larsbeck.dev" http://localhost:4200/notes/
```

Expected is `Content-Type: application/json`. If `text/html` comes back, the
wrong profile is running.

---

## Admin access

```bash
# Docker
docker compose exec backend python manage.py createsuperuser

# local
cd backend && python manage.py createsuperuser
```

Then sign in at <http://localhost:8000/admin/>.

---

## Security note

This project is a **learning project**. Secrets live exclusively in `.env`
files, which are not in the repository. For a real deployment it is still
missing at least:

- `DEBUG` is on by default and has to be `0` in production
- The API has no authentication — anyone can read and change all notes
- SQLite is not suitable for concurrent production use
- The old key from `settings.py` contained in the git history should be treated
  as compromised and must never be used in production

> **When switching to `DJANGO_DEBUG=0`**, `DJANGO_ALLOWED_HOSTS` in the `.env`
> has to contain the public domain. As long as `DEBUG=1` holds, `settings.py`
> overrides the list with `['*']` — a missing entry therefore only shows up once
> Django suddenly answers with `400 Bad Request`.

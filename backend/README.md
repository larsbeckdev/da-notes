# DANotes Backend

Django REST API for the DANotes app. The overarching documentation lives in the
[root README](../README.md).

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # once, then fill in SECRET_KEY
python manage.py migrate
python manage.py runserver
```

Then runs on <http://127.0.0.1:8000/>.

## Configuration

`settings.py` contains no credentials. On startup Django loads `.env` first via
`python-dotenv`, then `.env.local` (which overrides `.env`). Both are excluded
via `.gitignore`; `.env.example` serves as the template.

`DJANGO_SECRET_KEY` deliberately has no default: with `DEBUG=1` a throwaway key
kicks in, with `DEBUG=0` startup aborts with `ImproperlyConfigured`. That way a
missing key can never silently reach production.

The full list of variables is in the [root README](../README.md).

## Layout

```text
backend/
├── core/
│   ├── settings.py      # INSTALLED_APPS, CORS, database
│   └── urls.py          # includes notes_app.urls
├── notes_app/
│   ├── models.py        # Note
│   ├── serializers.py   # NoteSerializer
│   ├── views.py         # NoteViewSet (ModelViewSet)
│   ├── urls.py          # DefaultRouter
│   └── admin.py
└── manage.py
```

Routing is handled by DRF's `DefaultRouter`. The single registration
`router.register(r'notes', NoteViewSet)` produces all CRUD routes.

## Key design decisions

**No pagination.** The Angular service calls `data.filter(...)` directly on the
response. A pagination envelope like `{count, results}` would break the frontend
at runtime, so no `DEFAULT_PAGINATION_CLASS` is set on purpose.

**`created_at` is not in the serializer.** The model keeps the field to sort by
"newest first". It does not show up in the JSON, because the `Note` interface in
the frontend does not know it and `updateNote()` sends the whole object back via
PUT.

**`id` is a number, not a string.** The TypeScript interface declares
`id?: string`, but DRF returns an integer for `BigAutoField`. Harmless, since
the URL is built via a template string and TypeScript does not check JSON at
runtime.

## Useful commands

```bash
python manage.py createsuperuser     # admin account
python manage.py makemigrations      # after model changes
python manage.py migrate
python manage.py check               # verify configuration
python manage.py shell
```

DRF's browsable API is reachable in the browser at
<http://127.0.0.1:8000/notes/> and is handy for manual testing.

## Tests

There are currently no tests — `notes_app/tests.py` is the empty scaffold file
from `startapp`.

```bash
python manage.py test
```

# DANotes Backend

Django-REST-API für die DANotes-App. Die übergeordnete Dokumentation steht in
der [Root-README](../README.md).

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # einmalig, danach SECRET_KEY eintragen
python manage.py migrate
python manage.py runserver
```

Läuft dann auf <http://127.0.0.1:8000/>.

## Konfiguration

`settings.py` enthält keine Zugangsdaten. Beim Start lädt Django per
`python-dotenv` zuerst `.env`, danach `.env.local` (überschreibt `.env`). Beide
sind per `.gitignore` ausgeschlossen; `.env.example` dient als Vorlage.

`DJANGO_SECRET_KEY` hat bewusst keinen Default: bei `DEBUG=1` greift ein
Wegwerf-Key, bei `DEBUG=0` bricht der Start mit `ImproperlyConfigured` ab.
Damit kann kein fehlender Key unbemerkt in Produktion gelangen.

Die vollständige Variablenübersicht steht in der [Root-README](../README.md).

## Aufbau

```text
backend/
├── core/
│   ├── settings.py      # INSTALLED_APPS, CORS, Datenbank
│   └── urls.py          # bindet notes_app.urls ein
├── notes_app/
│   ├── models.py        # Note
│   ├── serializers.py   # NoteSerializer
│   ├── views.py         # NoteViewSet (ModelViewSet)
│   ├── urls.py          # DefaultRouter
│   └── admin.py
└── manage.py
```

Das Routing übernimmt der `DefaultRouter` von DRF. Aus der einen Registrierung
`router.register(r'notes', NoteViewSet)` entstehen alle CRUD-Routen.

## Wichtige Design-Entscheidungen

**Keine Pagination.** Der Angular-Service ruft `data.filter(...)` direkt auf der
Antwort auf. Eine Pagination-Envelope wie `{count, results}` würde das Frontend
zur Laufzeit brechen, deshalb ist bewusst keine `DEFAULT_PAGINATION_CLASS`
gesetzt.

**`created_at` ist nicht im Serializer.** Das Model führt das Feld, um nach
"neueste zuerst" zu sortieren. Im JSON taucht es nicht auf, weil das
`Note`-Interface im Frontend es nicht kennt und `updateNote()` das Objekt per
PUT vollständig zurückschickt.

**`id` ist eine Zahl, kein String.** Das TypeScript-Interface deklariert
`id?: string`, DRF liefert bei `BigAutoField` aber einen Integer. Unkritisch, da
die URL per Template-String gebaut wird und TypeScript JSON zur Laufzeit nicht
prüft.

## Nützliche Befehle

```bash
python manage.py createsuperuser     # Admin-Account
python manage.py makemigrations      # nach Model-Änderungen
python manage.py migrate
python manage.py check               # Konfiguration prüfen
python manage.py shell
```

Die Browsable API von DRF ist unter <http://127.0.0.1:8000/notes/> im Browser
erreichbar und eignet sich zum manuellen Testen.

## Tests

Aktuell sind keine Tests vorhanden — `notes_app/tests.py` ist die leere
Scaffold-Datei aus `startapp`.

```bash
python manage.py test
```

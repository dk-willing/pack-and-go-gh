# Services

Business logic lives here, not in controllers or routes. A service:
- Is called by one or more controllers.
- Talks to models/database, external APIs, or other services.
- Contains no `req`/`res` — services must stay framework-agnostic so they
  can be reused (e.g. by a future background job or CLI script).

No services are implemented yet in this foundation stage.

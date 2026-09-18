# Admin access

Public registration always creates a `CUSTOMER`. Admin accounts are created by the development team through the API workspace script; there is no public admin-registration endpoint.

Set these variables in `apps/api/.env` for the provisioning command, then remove them after use:

```env
ADMIN_NAME=Pack & Go Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use-a-long-random-password
```

Run:

```powershell
npm run create:admin --workspace=apps/api
```

The account receives the `ADMIN` role and can sign in at `/login`, then open `/admin` to review and process delivery requests. Never commit these values.

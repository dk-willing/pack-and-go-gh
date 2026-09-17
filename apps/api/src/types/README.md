# Types

Backend-only TypeScript types/interfaces that don't need to be shared with
the frontend (e.g. Express type augmentations for `req.user` once auth is
implemented). Types shared with `apps/web` belong in `packages/types` instead.

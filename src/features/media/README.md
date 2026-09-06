# Media features

One folder per media type, each following the standard feature shape:

```
media/
  video/    YouTube IDs and uploaded video assets
  audio/    audio uploads
  images/   image uploads
  pdf/      document uploads
```

All four exist today as stub pages — a routed page each, no upload logic yet.
The full feature shape below is what each grows into.

Each folder contains:

```
api/<name>.api.ts   backend calls, using ENDPOINTS from @/lib/api/endpoints
pages/              routed pages
components/         UI used only by this feature
types.ts            feature types
```

All four types share the upload machinery in `@/lib/upload`; they differ only
in accepted MIME types, size limits, and metadata fields. YouTube is the
exception — it stores a validated video ID with no file, so it uses the
metadata and listing UI but not the uploader.

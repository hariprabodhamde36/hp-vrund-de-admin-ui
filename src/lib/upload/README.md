# Upload machinery (not implemented yet)

Files upload as `multipart/form-data` to the Node backend, which streams them
to S3. The browser never talks to S3 directly.

Planned contents:

| File            | Responsibility                                                                                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uploader.ts`   | `XMLHttpRequest`-based POST of a `FormData` body. XHR rather than `fetch`, because it is the only way to observe upload progress. Cancellation maps to `xhr.abort()`. |
| `useUpload.ts`  | Hook exposing `{ start, cancel, progress, status, error }`.                                                                                                           |
| `validation.ts` | MIME type and size checks that run before the request starts.                                                                                                         |
| `types.ts`      | `UploadStatus`, `UploadConfig`, `UploadResult`.                                                                                                                       |

Client-side validation is not cosmetic: because uploads pass through the Node
process, it is what prevents an oversized file from ever reaching it.

Backend prerequisites this assumes:

- a raised body-size limit
- streaming multipart parsing (for example busboy or multer piping straight to
  S3) rather than buffering whole files in memory

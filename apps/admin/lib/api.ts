// fetchFromBackend removed — it sent zero auth headers (no JWT/cookie) and was unused.
// Keeping it around was a landmine: next dev would grab it and reintroduce 401-prone,
// unauthenticated backend calls. Use the authenticated fetch helper actually wired
// into the app instead (check how other admin API calls attach the session token).
export {};

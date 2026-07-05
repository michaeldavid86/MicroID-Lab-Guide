// MicroID Lab Guide — IndexedDB store for lab photos
// Photos are large base64 data URLs that would quickly exceed the ~5 MB
// localStorage quota (which silently drops writes on iOS Safari). IndexedDB
// has a far larger quota and is the correct place for binary/blob-like data.

const DB_NAME = "microid-photos";
const STORE = "photos";
const VERSION = 1;

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

// Run a single-request transaction and resolve with its result on commit.
function run(mode, makeRequest) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const store = t.objectStore(STORE);
        const req = makeRequest(store);
        let result;
        if (req) {
          req.onsuccess = () => { result = req.result; };
          req.onerror = () => reject(req.error);
        }
        t.oncomplete = () => resolve(result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error || new Error("IndexedDB transaction aborted (storage may be full)."));
      })
  );
}

export function putPhoto(key, record) {
  return run("readwrite", (store) => store.put(record, key));
}

export function deletePhoto(key) {
  return run("readwrite", (store) => store.delete(key));
}

export function clearPhotos() {
  return run("readwrite", (store) => store.clear());
}

// Returns all photos as an object keyed by photoKey: { [key]: record }
export function getAllPhotos() {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(STORE, "readonly");
        const store = t.objectStore(STORE);
        const out = {};
        const cursorReq = store.openCursor();
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (cursor) {
            out[cursor.key] = cursor.value;
            cursor.continue();
          } else {
            resolve(out);
          }
        };
        cursorReq.onerror = () => reject(cursorReq.error);
        // Guard against a transaction that aborts/errors mid-read so the
        // promise never hangs (which would stall hydratePhotos forever).
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error || new Error("IndexedDB read transaction aborted."));
      })
  );
}

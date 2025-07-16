import NodeCache from "node-cache";

export const myCache = new NodeCache({
  stdTTL: 60,
  checkperiod: 60,
  useClones: false
});

myCache.set("users", []);
myCache.set("todos", []);

console.log("[CACHE] Cache başlatıldı - TTL: 60 saniye");

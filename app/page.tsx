"use client";

import { useState, useEffect, useCallback } from "react";
import {
  login,
  getViews,
  getLatestItems,
  searchItems,
  getImageUrl,
} from "@/lib/jellyfin";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [views, setViews] = useState<any[]>([]);
  const [latest, setLatest] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Debounced search
  const performSearch = useCallback(
    async (query: string, uid: string, accessToken: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const data = await searchItems(uid, accessToken, query);
        setSearchResults(data.Items || []);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!token || !userId) return;

    const timer = setTimeout(() => {
      performSearch(searchQuery, userId, token);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, token, userId, performSearch]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const auth = await login(username, password);
      const accessToken = auth.AccessToken;
      const uid = auth.User.Id;

      setToken(accessToken);
      setUserId(uid);

      localStorage.setItem("jf_token", accessToken);
      localStorage.setItem("jf_userId", uid);

      const [viewsData, latestData] = await Promise.all([
        getViews(uid, accessToken),
        getLatestItems(uid, accessToken),
      ]);

      setViews(viewsData.Items || []);
      setLatest(latestData || []);
    } catch (err) {
      setError("Login gagal. Periksa username/password atau URL Jellyfin.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md space-y-4 p-8 bg-neutral-900 rounded-2xl"
        >
          <h1 className="text-2xl font-semibold text-center">
            Entertainment Center
          </h1>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-800 rounded-lg outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-800 rounded-lg outline-none"
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>
      </div>
    );
  }

  const showSearchResults = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">My Entertainment Center</h1>
        <button
          onClick={() => {
            localStorage.clear();
            setToken(null);
            setSearchQuery("");
            setSearchResults([]);
          }}
          className="px-4 py-2 bg-neutral-800 rounded-lg"
        >
          Logout
        </button>
      </header>

      {/* Search Bar */}
      <div className="mb-8 max-w-2xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari film, serial, musik, episode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3.5 bg-neutral-900 border border-neutral-800 rounded-xl outline-none focus:border-blue-500 transition"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
              Mencari...
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {showSearchResults && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">
            Hasil Pencarian ({searchResults.length})
          </h2>
          {searchResults.length === 0 && !isSearching ? (
            <p className="text-neutral-400">Tidak ada hasil ditemukan.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {searchResults.map((item) => (
                <div key={item.Id} className="group">
                  <div className="aspect-[2/3] bg-neutral-800 rounded-lg overflow-hidden">
                    {item.ImageTags?.Primary ? (
                      <img
                        src={getImageUrl(item.Id, token, item.ImageTags.Primary)}
                        alt={item.Name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium truncate">{item.Name}</p>
                  <p className="text-xs text-neutral-400 truncate">
                    {item.Type} {item.ProductionYear ? `(${item.ProductionYear})` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Libraries - hide when searching */}
      {!showSearchResults && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Libraries</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {views.map((view) => (
              <div
                key={view.Id}
                className="bg-neutral-900 p-6 rounded-xl text-center"
              >
                <div className="text-lg font-medium">{view.Name}</div>
                <div className="text-sm text-neutral-400">{view.CollectionType}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Added - hide when searching */}
      {!showSearchResults && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Recently Added</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {latest.map((item) => (
              <div key={item.Id} className="group">
                <div className="aspect-[2/3] bg-neutral-800 rounded-lg overflow-hidden">
                  {item.ImageTags?.Primary && (
                    <img
                      src={getImageUrl(item.Id, token, item.ImageTags.Primary)}
                      alt={item.Name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <p className="mt-2 text-sm font-medium truncate">{item.Name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

const algos = [
  { value: "bm25", label: "BM25 - baseline" },
  { value: "semantic", label: "Semantic" },
  { value: "hybrid_score", label: "Hybrid (scores)" },
  { value: "hybrid_rrf", label: "Hybrid (RRF)" },
  { value: "hybrid_rrf_reranked", label: "Hybrid (RRF + Reranked)" },
];

const pipelineMap: Record<string, string> = {
  bm25: "bm25",
  semantic: "semantic",
  "hybrid-scores": "hybrid_scores",
  "hybrid-rrf": "hybrid_rrf",
  "hybrid-rrf-reranked": "hybrid_rrf_rerank",
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [algo, setAlgo] = useState(algos[0].value);
  const [topK, setTopK] = useState(10);
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError("Please enter a search query.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setHistory((prev) => {
      const updated = [trimmedQuery, ...prev.filter((item) => item !== trimmedQuery)];
      return updated.slice(0, 5);
    });

    try {
      const response = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: trimmedQuery,
          pipeline: pipelineMap[algo] ?? algo,
          top_k: topK,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setResults(Array.isArray(data) ? data : data.results ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load results.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-950 to-black px-6 py-10 text-white">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-4xl border border-white/10 bg-slate-950/90 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <section className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-sky-400/80">Influencer search engine</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">COLLABRIO RAG</h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-300">FIND BEST INFLUENCERS</p>
        </section>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <label className="flex w-full flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-sm shadow-black/10 transition hover:border-sky-400/40">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Search query</span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. sustainable fashion creators, travel lifestyle influencers, B2B SaaS ambassadors"
              className="min-h-16 w-full bg-transparent text-lg text-white outline-none placeholder:text-slate-500"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
              <label className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 p-3 shadow-sm shadow-black/10">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Algorithm</span>
                <select
                  value={algo}
                  onChange={(event) => setAlgo(event.target.value)}
                  className="h-12 rounded-2xl border border-white/10 bg-slate-900/90 px-3 text-sm text-white outline-none transition focus:border-sky-400"
                >
                  {algos.map((item) => (
                    <option key={item.value} value={item.value} className="bg-slate-900 text-white">
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 p-3 shadow-sm shadow-black/10">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Number of Creators</span>
                <select
                  value={topK}
                  onChange={(event) => setTopK(Number(event.target.value))}
                  className="h-12 rounded-2xl border border-white/10 bg-slate-900/90 px-3 text-sm text-white outline-none transition focus:border-sky-400"
                >
                  {[5, 10, 20].map((value) => (
                    <option key={value} value={value} className="bg-slate-900 text-white">
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-sky-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Search
            </button>
          </div>
        </form>

        {history.length > 0 && (
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 text-slate-300">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Recent Searches</h2>
            <div className="mt-4 grid gap-2 text-sm text-slate-200">
              {history.map((item, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-2">
                  {item}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 text-slate-300">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Live results</h2>
              <p className="mt-1 text-sm leading-5 text-slate-400">
                Results from your influencer index rendered as compact creator cards.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">
              {pipelineMap[algo] ?? algo} · Top {topK}
            </div>
          </div>

          {loading ? (
            <div className="mt-5 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5 text-center text-slate-300">
              Searching influencers...
            </div>
          ) : error ? (
            <div className="mt-5 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-5 text-slate-100">
              <p className="font-medium text-rose-100">Error</p>
              <p className="mt-2 text-sm leading-6">{error}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-slate-900/80 p-5 text-slate-400">
              No results yet. Submit a query to retrieve influencer data from your search engine.
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {results.map((item, index) => {
                const username = String(item.username);
                const country = item.country ? String(item.country) : "—";
                const category = item.category ? String(item.category) : "—";
                const followers = item.followers ? String(item.followers) : "—";
                const engagementRate = item.engagement_rate ? String(item.engagement_rate) : "—";
                const potentialReach = item.potential_reach ? String(item.potential_reach) : "—";
                const score = item.score !== undefined ? String(item.score) : "—";
                const platform = item.platform ? String(item.platform) : 'Instagram';

                const otherFields = Object.entries(item).filter(
                  ([key]) => ![
                    "username",
                    "country",
                    "category",
                    "followers",
                    "engagement_rate",
                    "potential_reach",
                    "score",
                    "id",
                    "platform",
                  ].includes(key)
                );

                return (
                  <article key={index} className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-sm shadow-black/20">
                    <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/80 p-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-sky-400/80">Influencer</p>
                        <h3 className="mt-2 text-lg font-semibold text-white">{username}</h3>
                      </div>
                      <div className="rounded-2xl bg-slate-800 px-3 py-1 text-center text-xs uppercase tracking-[0.18em] text-slate-300">
                        Score {score}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 text-center text-overflow-hidden">
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Country</p>
                        <p className="mt-2 text-sm font-semibold text-white truncate">{country}</p>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Platform</p>
                        <p className="mt-2 text-sm font-semibold text-white truncate">{platform}</p>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Followers</p>
                        <p className="mt-2 text-sm font-semibold text-white truncate">{followers}</p>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Engagement rate</p>
                        <p className="mt-2 text-sm font-semibold text-white truncate">{engagementRate}</p>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Potential reach</p>
                        <p className="mt-2 text-sm font-semibold text-white truncate">{potentialReach}</p>
                      </div>

                    </div>

                    {category && (
                      <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Category</p>
                        <p className="mt-2 text-sm text-slate-200 truncate">{category}</p>
                      </div>
                    )}


                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

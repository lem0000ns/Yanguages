"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Database, Search } from "lucide-react";
import { apiFetch } from "../../session";
import { useSession } from "../../useSession";
import DifficultyLabel from "../../ui/DifficultyLabel";

type CatalogWord = {
  id: number | null;
  english: string;
  diff: string | null;
  freq: number | null;
  pronunciation: string | null;
  spanish: string | null;
  korean: string | null;
  chinese: string | null;
  pinyin: string | null;
  def: string | null;
};

type ListResponse = {
  items: CatalogWord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const emptyForm = (): CatalogWord => ({
  id: 0,
  english: "",
  diff: "easy",
  freq: null,
  pronunciation: "",
  spanish: "",
  korean: "",
  chinese: "",
  pinyin: "",
  def: "",
});

function wordToForm(w: CatalogWord): CatalogWord {
  return {
    ...w,
    pronunciation: w.pronunciation ?? "",
    spanish: w.spanish ?? "",
    korean: w.korean ?? "",
    chinese: w.chinese ?? "",
    pinyin: w.pinyin ?? "",
    def: w.def ?? "",
    diff: w.diff ?? "easy",
  };
}

export default function AdminWordsPage() {
  const { username, canEditWords, wordCatalogAdminEnabled, refreshSession } =
    useSession();
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [diffFilter, setDiffFilter] = useState("");
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<CatalogWord | null>(null);
  const [editingKeyEnglish, setEditingKeyEnglish] = useState("");
  const [form, setForm] = useState<CatalogWord>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const loadWords = useCallback(async () => {
    if (!canEditWords) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (query) params.set("q", query);
      if (diffFilter) params.set("diff", diffFilter);
      const res = await apiFetch(`/admin/words?${params.toString()}`);
      const body = await res.json();
      if (!res.ok) {
        const detail =
          typeof body.detail === "string" ? body.detail : "";
        setError(
          [body.message ?? "Could not load words", detail]
            .filter(Boolean)
            .join(" — ")
        );
        setData(null);
        return;
      }
      setData(body as ListResponse);
    } catch {
      setError("Could not load words");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [canEditWords, page, limit, query, diffFilter]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const openEdit = (word: CatalogWord) => {
    setEditing(word);
    setEditingKeyEnglish(word.english);
    setForm(wordToForm(word));
    setSaveMessage("");
  };

  const closeEdit = () => {
    setEditing(null);
    setEditingKeyEnglish("");
    setForm(emptyForm());
    setSaveMessage("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const payload = {
        english: form.english,
        diff: form.diff,
        freq: form.freq,
        pronunciation: form.pronunciation,
        spanish: form.spanish,
        korean: form.korean,
        chinese: form.chinese,
        pinyin: form.pinyin,
        def: form.def,
      };
      const res =
        editing.id != null && editing.id > 0
          ? await apiFetch(`/admin/words/${editing.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await apiFetch("/admin/words", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...payload,
                originalEnglish: editingKeyEnglish,
              }),
            });
      const body = await res.json();
      if (!res.ok) {
        setSaveMessage(body.message ?? "Save failed");
        return;
      }
      setSaveMessage("Saved");
      const updated = body.item as CatalogWord;
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((w) =>
                w.id != null && updated.id != null
                  ? w.id === updated.id
                    ? updated
                    : w
                  : w.english === editingKeyEnglish
                    ? updated
                    : w
              ),
            }
          : prev
      );
      setEditing(updated);
      setEditingKeyEnglish(updated.english);
      setForm(wordToForm(updated));
    } catch {
      setSaveMessage("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(searchInput.trim());
  };

  if (!username) {
    return (
      <div className="page-container">
        <div className="card-surface mx-auto max-w-md px-8 py-12 text-center text-violet-300/80">
          <p>Sign in to manage the word catalog.</p>
          <Link href="/login" className="btn-primary mt-6 inline-flex">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!canEditWords) {
    return (
      <div className="page-container">
        <div className="card-surface mx-auto max-w-lg px-8 py-12 text-center text-violet-300/80">
          <p className="font-medium text-violet-100">Access restricted</p>
          <p className="mt-3 text-sm leading-relaxed">
            Signed in as{" "}
            <code className="rounded bg-violet-950/80 px-1.5 py-0.5 text-violet-100">
              {username}
            </code>
            . That exact string must appear in{" "}
            <code className="rounded bg-violet-950/80 px-1.5 py-0.5 text-violet-200">
              WORD_EDITOR_USERNAMES
            </code>{" "}
            on the Railway backend service (not the frontend), then redeploy and
            sign in again.
          </p>
          {!wordCatalogAdminEnabled && (
            <p className="mt-4 text-sm leading-relaxed text-amber-200/90">
              The API does not look updated yet (missing word-bank admin). Redeploy
              the backend from the latest <code className="text-amber-100">main</code>{" "}
              commit on GitHub, then try again.
            </p>
          )}
          <button
            type="button"
            className="btn-secondary mt-6"
            onClick={() => refreshSession()}
          >
            Re-check access
          </button>
        </div>
      </div>
    );
  }

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="page-container max-w-7xl">
      <header className="mb-8 animate-slide-up">
        <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-violet-400/80">
          <Database className="h-3.5 w-3.5" />
          Catalog
        </p>
        <h1 className="page-title">Word bank</h1>
        <p className="page-subtitle">
          Review and fix translations and definitions used on Today and in the
          game.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <form
          onSubmit={runSearch}
          className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400/60" />
            <input
              className="input-field pl-10"
              placeholder="Search English or definition…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-secondary shrink-0">
            Search
          </button>
        </form>
        <div className="flex items-center gap-2">
          <label htmlFor="diff-filter" className="text-sm text-violet-300/80">
            Difficulty
          </label>
          <select
            id="diff-filter"
            className="input-field w-auto min-w-[8rem]"
            value={diffFilter}
            onChange={(e) => {
              setDiffFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="easy">Easy</option>
            <option value="med">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-violet-950/30 text-violet-300/90">
                <th className="px-4 py-3 font-medium">English</th>
                <th className="px-4 py-3 font-medium">Diff</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Spanish
                </th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">
                  Korean
                </th>
                <th className="hidden px-4 py-3 font-medium xl:table-cell">
                  Chinese
                </th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border-subtle/60">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-4 animate-pulse rounded bg-violet-950/50" />
                    </td>
                  </tr>
                ))}
              {!loading &&
                data?.items.map((word) => (
                  <tr
                    key={word.id ?? word.english}
                    className="border-b border-border-subtle/60 transition-colors hover:bg-violet-950/20"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-violet-50">
                        {word.english}
                      </span>
                      {word.def && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-violet-300/60">
                          {word.def}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {word.diff ? (
                        <DifficultyLabel diff={word.diff ?? undefined} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="hidden max-w-[10rem] truncate px-4 py-3 text-violet-200/80 md:table-cell">
                      {word.spanish ?? "—"}
                    </td>
                    <td className="hidden max-w-[8rem] truncate px-4 py-3 text-violet-200/80 lg:table-cell">
                      {word.korean ?? "—"}
                    </td>
                    <td className="hidden max-w-[8rem] truncate px-4 py-3 text-violet-200/80 xl:table-cell">
                      {word.chinese ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="btn-ghost py-1.5 text-xs"
                        onClick={() => openEdit(word)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              {!loading && data?.items.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-violet-300/70"
                  >
                    No words match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border-subtle px-4 py-4 sm:flex-row">
          <p className="text-sm text-violet-300/70">
            {total === 0
              ? "No words"
              : `Showing ${from}–${to} of ${total.toLocaleString()}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary py-2"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <span className="min-w-[6rem] text-center text-sm text-violet-200/80">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              className="btn-secondary py-2"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <div className="modal">
          <div className="overlay" onClick={closeEdit} role="presentation" />
          <div className="modal-content flex max-h-[min(90vh,720px)] flex-col overflow-y-auto">
            <h2 className="font-display text-xl font-semibold">
              Edit{" "}
              <span className="text-violet-400">
                {editing.id != null ? `#${editing.id}` : editingKeyEnglish}
              </span>
            </h2>
            <form className="mt-4 space-y-4" onSubmit={handleSave}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label-text" htmlFor="edit-english">
                    English
                  </label>
                  <input
                    id="edit-english"
                    className="input-field"
                    value={form.english}
                    onChange={(e) =>
                      setForm({ ...form, english: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="label-text" htmlFor="edit-diff">
                    Difficulty
                  </label>
                  <select
                    id="edit-diff"
                    className="input-field"
                    value={form.diff ?? "easy"}
                    onChange={(e) =>
                      setForm({ ...form, diff: e.target.value })
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="med">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="label-text" htmlFor="edit-freq">
                    Frequency
                  </label>
                  <input
                    id="edit-freq"
                    type="number"
                    step="any"
                    className="input-field"
                    value={form.freq ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        freq:
                          e.target.value === ""
                            ? null
                            : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-text" htmlFor="edit-def">
                    Definition (English)
                  </label>
                  <textarea
                    id="edit-def"
                    className="input-field min-h-[4.5rem] resize-y"
                    value={form.def ?? ""}
                    onChange={(e) => setForm({ ...form, def: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-text" htmlFor="edit-pron">
                    Pronunciation (IPA)
                  </label>
                  <input
                    id="edit-pron"
                    className="input-field"
                    value={form.pronunciation ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, pronunciation: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label-text" htmlFor="edit-es">
                    Spanish
                  </label>
                  <input
                    id="edit-es"
                    className="input-field"
                    value={form.spanish ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, spanish: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label-text" htmlFor="edit-ko">
                    Korean
                  </label>
                  <input
                    id="edit-ko"
                    className="input-field"
                    value={form.korean ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, korean: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label-text" htmlFor="edit-zh">
                    Chinese
                  </label>
                  <input
                    id="edit-zh"
                    className="input-field"
                    value={form.chinese ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, chinese: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label-text" htmlFor="edit-pinyin">
                    Pinyin
                  </label>
                  <input
                    id="edit-pinyin"
                    className="input-field"
                    value={form.pinyin ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, pinyin: e.target.value })
                    }
                  />
                </div>
              </div>
              {saveMessage && (
                <p
                  className={`text-sm ${
                    saveMessage === "Saved"
                      ? "text-emerald-300"
                      : "text-red-300"
                  }`}
                >
                  {saveMessage}
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeEdit}
                >
                  Close
                </button>
              </div>
            </form>
            <button
              className="close-modal"
              type="button"
              onClick={closeEdit}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

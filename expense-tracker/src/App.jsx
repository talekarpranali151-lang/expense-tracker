import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import ExpenseForm from "./components/ExpenseForm.jsx";
import ExpenseItem from "./components/ExpenseItem.jsx";
import { CATEGORIES, formatINR } from "./constants.js";

// Mock API: a static JSON file served from /public, with a small delay
// so the loading state is visible.
const fetchExpenses = async () => {
  const res = await fetch(`${import.meta.env.BASE_URL}expenses.json`);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  await new Promise((r) => setTimeout(r, 600));
  return res.json();
};

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const nextId = useRef(1000); // ids for newly added items
  const searchRef = useRef(null);

  // useEffect: fetch from the mock API on mount
  useEffect(() => {
    let cancelled = false;
    fetchExpenses()
      .then((data) => !cancelled && setExpenses(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // useCallback: stable handlers so memoized children skip re-renders
  const addExpense = useCallback((data) => {
    setExpenses((prev) => [{ id: nextId.current++, ...data }, ...prev]);
  }, []);

  const deleteExpense = useCallback((id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearFilters = useCallback(() => {
    setFilter("All");
    setSearch("");
    searchRef.current?.focus();
  }, []);

  // useMemo: derived data only recomputed when its inputs change
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenses
      .filter((e) => filter === "All" || e.category === filter)
      .filter((e) => !q || e.title.toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, filter, search]);

  const total = useMemo(
    () => visible.reduce((sum, e) => sum + e.amount, 0),
    [visible]
  );

  const byCategory = useMemo(() => {
    const totals = {};
    expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    const max = Math.max(1, ...Object.values(totals));
    return CATEGORIES.filter((c) => totals[c]).map((c) => ({
      category: c,
      amount: totals[c],
      pct: (totals[c] / max) * 100,
    }));
  }, [expenses]);

  return (
    <div className="container">
      <header>
        <h1>💸 Expense Tracker</h1>
        <p className="muted">Track where your money goes.</p>
      </header>

      <div className="layout">
        <aside>
          <ExpenseForm onAdd={addExpense} />

          <section className="card">
            <h2>By category</h2>
            {byCategory.length === 0 && <p className="muted">No data yet.</p>}
            {byCategory.map((c) => (
              <div key={c.category} className="bar-row">
                <div className="bar-label">
                  <span>{c.category}</span>
                  <span>{formatINR(c.amount)}</span>
                </div>
                <div className="bar">
                  <div className={`bar-fill tag-${c.category}`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </section>
        </aside>

        <main>
          <section className="card summary">
            <div>
              <span className="muted">Total{filter !== "All" || search ? " (filtered)" : ""}</span>
              <div className="total">{formatINR(total)}</div>
            </div>
            <div className="muted">{visible.length} expense{visible.length !== 1 && "s"}</div>
          </section>

          <section className="card">
            <div className="toolbar">
              <input
                ref={searchRef}
                type="search"
                placeholder="Search expenses…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search expenses"
              />
              <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by category">
                <option>All</option>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <button className="btn" onClick={clearFilters}>Clear</button>
            </div>

            {loading && <p className="muted center">Loading expenses…</p>}
            {error && <p className="error">Could not load data: {error}</p>}
            {!loading && !error && visible.length === 0 && (
              <p className="muted center">No expenses found.</p>
            )}

            <ul className="list">
              {visible.map((e) => (
                <ExpenseItem key={e.id} expense={e} onDelete={deleteExpense} />
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}

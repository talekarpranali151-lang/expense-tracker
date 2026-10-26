import { useState, useRef, useCallback } from "react";
import { CATEGORIES } from "../constants.js";

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({ title: "", amount: "", category: CATEGORIES[0], date: today() });

export default function ExpenseForm({ onAdd }) {
  // useState: controlled form inputs
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  // useRef: focus management
  const titleRef = useRef(null);
  const amountRef = useRef(null);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!form.title.trim()) {
        setError("Please enter a title.");
        titleRef.current?.focus();
        return;
      }
      const amount = Number(form.amount);
      if (!amount || amount <= 0) {
        setError("Amount must be greater than 0.");
        amountRef.current?.focus();
        return;
      }
      setError("");
      onAdd({ ...form, title: form.title.trim(), amount });
      setForm(emptyForm());
      titleRef.current?.focus(); // ready for the next entry
    },
    [form, onAdd]
  );

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>Add expense</h2>

      <label>
        Title
        <input
          ref={titleRef}
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Lunch"
          autoFocus
        />
      </label>

      <label>
        Amount (₹)
        <input
          ref={amountRef}
          name="amount"
          type="number"
          min="0"
          step="1"
          value={form.amount}
          onChange={handleChange}
          placeholder="0"
        />
      </label>

      <label>
        Category
        <select name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>

      <label>
        Date
        <input name="date" type="date" value={form.date} onChange={handleChange} />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <button type="submit" className="btn primary">Add expense</button>
    </form>
  );
}

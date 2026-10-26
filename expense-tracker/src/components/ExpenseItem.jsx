import { memo } from "react";
import { formatINR } from "../constants.js";

// memo + stable onDelete (useCallback in App) => unchanged rows don't re-render
const ExpenseItem = memo(function ExpenseItem({ expense, onDelete }) {
  return (
    <li className="item">
      <div className="item-main">
        <strong>{expense.title}</strong>
        <span className="muted">
          <span className={`tag tag-${expense.category}`}>{expense.category}</span>{" "}
          · {expense.date}
        </span>
      </div>
      <div className="item-side">
        <span className="amount">{formatINR(expense.amount)}</span>
        <button
          className="btn icon"
          onClick={() => onDelete(expense.id)}
          aria-label={`Delete ${expense.title}`}
        >
          ✕
        </button>
      </div>
    </li>
  );
});

export default ExpenseItem;

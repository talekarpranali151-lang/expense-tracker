export const CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Entertainment",
  "Education",
  "Other",
];

export const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

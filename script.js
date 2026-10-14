"use strict";

const STORAGE_KEYS = { expenses: "spendwise.expenses.v1", budget: "spendwise.budget.v1" };
const DEFAULT_BUDGET = 2000;
const CATEGORY_META = {
  Food: { icon: "🍋", color: "#a8d65e" },
  Transport: { icon: "🚲", color: "#a8c7f0" },
  Shopping: { icon: "🛍️", color: "#e7b8e5" },
  Bills: { icon: "🏡", color: "#f2c49b" },
  Health: { icon: "🌿", color: "#b6dfce" },
  Entertainment: { icon: "🎟️", color: "#c8b9f2" },
  Other: { icon: "✳️", color: "#d5d9d0" }
};

const dateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return localDateString(date);
};
function localDateString(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
const demoExpenses = [
  { id: "demo-1", title: "Weekly groceries", amount: 64.35, category: "Food", date: dateOffset(0), note: "Fresh produce and pantry staples" },
  { id: "demo-2", title: "Monthly internet", amount: 45.00, category: "Bills", date: dateOffset(1), note: "Home Wi-Fi" },
  { id: "demo-3", title: "Coffee with Maya", amount: 12.50, category: "Food", date: dateOffset(2), note: "Catch-up at the café" },
  { id: "demo-4", title: "Bus pass", amount: 28.00, category: "Transport", date: dateOffset(3), note: "Getting around town" },
  { id: "demo-5", title: "New notebook", amount: 16.99, category: "Shopping", date: dateOffset(4), note: "For personal projects" },
  { id: "demo-6", title: "Yoga class", amount: 18.00, category: "Health", date: dateOffset(6), note: "Sunday reset" }
];

function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.warn("SpendWise could not read saved data:", error);
    return fallback;
  }
}
let expenses = readStored(STORAGE_KEYS.expenses, null);
if (!Array.isArray(expenses)) expenses = demoExpenses.map((item) => ({ ...item }));
let monthlyBudget = Number(readStored(STORAGE_KEYS.budget, DEFAULT_BUDGET));
if (!Number.isFinite(monthlyBudget) || monthlyBudget <= 0) monthlyBudget = DEFAULT_BUDGET;

const $ = (selector) => document.querySelector(selector);
const expenseForm = $("#expense-form");
const expenseList = $("#expense-list");
const formFeedback = $("#form-feedback");
const budgetDialog = $("#budget-dialog");
const toast = $("#toast");
let toastTimer;

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses));
    localStorage.setItem(STORAGE_KEYS.budget, JSON.stringify(monthlyBudget));
  } catch (error) {
    showToast("Could not save to this browser. Check storage settings.");
    console.warn("SpendWise could not save data:", error);
  }
}
function money(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}
function prettyDate(dateString) {
  const date = new Date(dateString + "T12:00:00");
  return Number.isNaN(date.getTime()) ? dateString : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
function currentMonthKey() {
  const now = new Date();
  return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
}
function isThisMonth(expense) {
  return typeof expense.date === "string" && expense.date.slice(0, 7) === currentMonthKey();
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function showBudgetMessage(spent, remaining, percent) {
  const box = $("#budget-message");
  if (spent > monthlyBudget) {
    box.innerHTML = '<span class="message-symbol">!</span><div><strong>You’re over your budget</strong><p>You’ve spent ' + escapeHTML(money(spent - monthlyBudget)) + ' more than planned. Review the categories below for places to adjust.</p></div>';
  } else if (percent >= 80) {
    box.innerHTML = '<span class="message-symbol">↗</span><div><strong>You’re getting close to your limit</strong><p>' + escapeHTML(money(remaining)) + ' left. Consider pausing non-essential purchases until next month.</p></div>';
  } else if (percent >= 50) {
    box.innerHTML = '<span class="message-symbol">✦</span><div><strong>You’re making steady progress</strong><p>You’ve used ' + Math.round(percent) + '% of your budget. Keep checking in as you go.</p></div>';
  } else {
    box.innerHTML = '<span class="message-symbol">✦</span><div><strong>You’re building momentum</strong><p>You’ve spent ' + escapeHTML(money(spent)) + ' so far. There’s room to keep your plans on track.</p></div>';
  }
}
function renderSummary(monthExpenses) {
  // A loop processes all expense records for the current month.
  let spent = 0;
  for (const expense of monthExpenses) spent += Number(expense.amount) || 0;
  const remaining = monthlyBudget - spent;
  const percent = monthlyBudget > 0 ? (spent / monthlyBudget) * 100 : 0;
  const safePercent = Math.min(percent, 100);

  $("#total-spent").textContent = money(spent);
  $("#expense-count").textContent = monthExpenses.length + (monthExpenses.length === 1 ? " expense" : " expenses");
  $("#budget-total").textContent = money(monthlyBudget);
  $("#remaining-total").textContent = money(remaining);
  $("#remaining-total").style.color = remaining < 0 ? "#b64e3b" : "";
  $("#remaining-note").textContent = remaining < 0 ? "Time to review your spending." : remaining < monthlyBudget * 0.2 ? "Your budget is getting tight." : "You're off to a great start.";
  $("#budget-percent").textContent = Math.round(percent) + "%";
  $("#spent-caption").textContent = money(spent) + " spent";
  $("#limit-caption").textContent = money(monthlyBudget) + " budget";
  $("#budget-progress").style.width = safePercent + "%";
  $("#budget-progress-large").style.width = safePercent + "%";
  const status = $("#budget-status");
  status.className = "panel-badge";
  if (percent > 100) {
    status.textContent = "Over budget";
    status.classList.add("over");
    $("#budget-progress").style.background = "#e58a77";
    $("#budget-progress-large").style.background = "#e58a77";
  } else if (percent >= 80) {
    status.textContent = "Almost there";
    status.classList.add("warning");
    $("#budget-progress").style.background = "#e9b65e";
    $("#budget-progress-large").style.background = "#e9b65e";
  } else {
    status.textContent = "On track";
    $("#budget-progress").style.background = "";
    $("#budget-progress-large").style.background = "";
  }
  showBudgetMessage(spent, remaining, percent);
  renderCategories(monthExpenses, spent);
}
function renderCategories(monthExpenses, totalSpent) {
  const totals = {};
  // The category totals array is built by looping over the expense records.
  for (const expense of monthExpenses) {
    totals[expense.category] = (totals[expense.category] || 0) + (Number(expense.amount) || 0);
  }
  const categories = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  $("#category-count").textContent = categories.length + (categories.length === 1 ? " category" : " categories");
  const container = $("#category-breakdown");
  if (categories.length === 0) {
    container.innerHTML = '<p class="empty-inline">Your category breakdown will appear here.</p>';
    return;
  }
  container.innerHTML = categories.map(([category, amount]) => {
    const meta = CATEGORY_META[category] || CATEGORY_META.Other;
    const width = totalSpent > 0 ? Math.max(2, (amount / totalSpent) * 100) : 0;
    return '<div class="category-row"><span class="category-emoji">' + meta.icon + '</span><div class="category-info"><strong>' + escapeHTML(category) + '</strong><div class="category-track"><span style="width:' + width + '%;background:' + meta.color + '"></span></div></div><span class="category-value">' + money(amount) + '</span></div>';
  }).join("");
}
function getVisibleExpenses() {
  const query = $("#search-expenses").value.trim().toLowerCase();
  const category = $("#filter-category").value;
  return expenses.filter((expense) => {
    const matchesCategory = category === "All" || expense.category === category;
    const matchesQuery = !query || [expense.title, expense.category, expense.note, expense.date].some((value) => String(value || "").toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  }).sort((a, b) => b.date.localeCompare(a.date) || String(b.id).localeCompare(String(a.id)));
}
function renderTransactions() {
  const visible = getVisibleExpenses();
  $("#transaction-total").textContent = expenses.length;
  $("#showing-count").textContent = "Showing " + visible.length + " of " + expenses.length + " transactions";
  $("#empty-state").hidden = visible.length !== 0;
  expenseList.innerHTML = visible.map((expense) => {
    const meta = CATEGORY_META[expense.category] || CATEGORY_META.Other;
    return '<tr><td><div class="expense-name"><span class="expense-icon">' + meta.icon + '</span><div><div class="expense-title">' + escapeHTML(expense.title) + '</div>' + (expense.note ? '<div class="expense-note">' + escapeHTML(expense.note) + '</div>' : '') + '</div></div></td><td><span class="category-pill">' + meta.icon + ' ' + escapeHTML(expense.category) + '</span></td><td class="date-cell">' + escapeHTML(prettyDate(expense.date)) + '</td><td class="amount-cell">' + money(Number(expense.amount) || 0) + '</td><td><button class="delete-button" type="button" data-delete-id="' + escapeHTML(expense.id) + '" aria-label="Delete ' + escapeHTML(expense.title) + '" title="Delete expense">×</button></td></tr>';
  }).join("");
}
function render() {
  const thisMonth = expenses.filter(isThisMonth);
  renderSummary(thisMonth);
  renderTransactions();
}
function setTodayDefaults() {
  $("#expense-date").value = localDateString(new Date());
  $("#today-label").textContent = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();
  $("#month-label").textContent = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date());
}
function addExpense(event) {
  event.preventDefault();
  const data = new FormData(expenseForm);
  const title = String(data.get("title") || "").trim();
  const amount = Number(data.get("amount"));
  const category = String(data.get("category") || "Other");
  const date = String(data.get("date") || "");
  const note = String(data.get("note") || "").trim();
  if (!title || title.length > 80) {
    formFeedback.textContent = "Please enter an expense name (up to 80 characters).";
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000) {
    formFeedback.textContent = "Enter an amount greater than $0 and no more than $10,000,000.";
    return;
  }
  if (!CATEGORY_META[category]) {
    formFeedback.textContent = "Please choose a valid category.";
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date + "T12:00:00").getTime())) {
    formFeedback.textContent = "Please choose a valid date.";
    return;
  }
  expenses.push({ id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2), title, amount: Math.round(amount * 100) / 100, category, date, note });
  saveState();
  render();
  expenseForm.reset();
  $("#expense-date").value = localDateString(new Date());
  formFeedback.textContent = "Expense saved successfully.";
  showToast("Expense added to your tracker.");
}
expenseForm.addEventListener("submit", addExpense);
$("#jump-add").addEventListener("click", () => {
  $("#add-expense").scrollIntoView({ behavior: "smooth", block: "start" });
  $("#expense-title").focus({ preventScroll: true });
});
$("#edit-budget").addEventListener("click", () => {
  $("#budget-input").value = monthlyBudget;
  if (typeof budgetDialog.showModal === "function") budgetDialog.showModal();
  else showToast("Your browser does not support the budget dialog.");
});
function closeBudgetDialog() { budgetDialog.close(); }
$("#close-budget").addEventListener("click", closeBudgetDialog);
$("#cancel-budget").addEventListener("click", closeBudgetDialog);
$("#budget-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const nextBudget = Number($("#budget-input").value);
  if (!Number.isFinite(nextBudget) || nextBudget <= 0 || nextBudget > 100000000) return;
  monthlyBudget = Math.round(nextBudget * 100) / 100;
  saveState();
  render();
  closeBudgetDialog();
  showToast("Monthly budget updated.");
});
$("#search-expenses").addEventListener("input", renderTransactions);
$("#filter-category").addEventListener("change", renderTransactions);
expenseList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-id]");
  if (!button) return;
  const expense = expenses.find((item) => String(item.id) === button.dataset.deleteId);
  if (!expense) return;
  expenses = expenses.filter((item) => String(item.id) !== button.dataset.deleteId);
  saveState();
  render();
  showToast("Expense removed.");
});
$("#clear-filters").addEventListener("click", () => {
  $("#search-expenses").value = "";
  $("#filter-category").value = "All";
  renderTransactions();
});
$("#reset-demo").addEventListener("click", () => {
  const confirmed = window.confirm("Reset all expenses and budget to the original demo data?");
  if (!confirmed) return;
  expenses = demoExpenses.map((item) => ({ ...item }));
  monthlyBudget = DEFAULT_BUDGET;
  saveState();
  render();
  showToast("Demo data restored.");
});

setTodayDefaults();
render();
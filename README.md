# SpendWise — Make It Interactive

SpendWise is a responsive budgeting dashboard built with **HTML, CSS, and vanilla JavaScript**. It turns a static spending concept into an interactive tracker: add expenses, update a monthly budget, review category totals, search transactions, and remove entries.

## Live project

- **Repository:** https://github.com/45Keach/Make-SpendWise-Interactive-
- **Run locally:** download or clone the repository and open `index.html` in a modern browser. No build tools or dependencies are required.

## What improved this week

- Added an expense form with title, amount, category, date, and optional note.
- Added a monthly budget editor and a remaining-budget calculation.
- Created summary cards for monthly spending, budget, and money left.
- Added spending-by-category totals with proportion bars.
- Added a searchable, category-filterable transaction table and delete controls.
- Added contextual budget feedback for on-track, nearly-at-limit, and over-budget situations.
- Added browser storage so entries and the budget remain after a page refresh.
- Added sample transactions, reset-to-demo behavior, responsive styling, and basic input validation.

## How the JavaScript concepts are used

### 1. Decision making with conditionals

The app uses `if / else if / else` statements to validate expense input and select useful budget messages. For example, spending over the monthly budget triggers an over-budget warning; using at least 80% of the budget triggers a caution message. Conditional checks also decide whether a transaction matches the active search and category filters.

### 2. Arrays store multiple records

Expenses are kept in the `expenses` array. Each item is an object with an `id`, `title`, `amount`, `category`, `date`, and optional `note`. New expenses are added with `push()`, deleted with `filter()`, and read from localStorage when the page starts. Demo records are also defined as an array of objects.

### 3. Loops process records

A `for...of` loop calculates the total spent this month and another loop groups spending by category. Array methods such as `filter()`, `map()`, and `sort()` select, transform, and order transactions for display.

### 4. DOM manipulation updates the dashboard

The app updates summary values using `textContent` and progress indicators using element styles. It builds the transaction rows and category breakdown dynamically, then inserts them into the page. User-provided text is HTML-escaped before it is inserted into generated markup.

### 5. Events handle user interactions

- The expense form's `submit` listener validates input, stores the new record, and rerenders the dashboard.
- The budget editor's `click` and form `submit` listeners open, save, and close the budget dialog.
- Search and category controls listen for `input` and `change` events.
- A delegated `click` listener on the transaction table handles delete buttons, including rows rendered later.
- Additional click listeners support the add-expense shortcut, clearing filters, and restoring demo data.

## Data and privacy

SpendWise stores the expense array and monthly budget in this browser's `localStorage`. There is no server, account system, or cloud sync. Data is local to the browser profile and can be removed by clearing browser site data or using the reset control. Currency is currently displayed in USD.

## Challenges and how they were resolved

- **Keeping every dashboard section in sync:** a shared `render()` flow recalculates the summary, categories, and transaction list after each data change.
- **Handling dates consistently:** date inputs use a local-date helper to avoid common UTC date shifts.
- **Making form input safer and more reliable:** amounts, categories, names, and dates are validated, and user-entered strings are escaped before being added to generated HTML.
- **Keeping data after refresh:** a small storage helper reads and writes JSON while handling unavailable or invalid browser storage.
- **Making the interface work on small screens:** responsive CSS adapts the navigation, cards, form, and horizontally scrollable transaction table.

## Manual test checklist

- [ ] Add an expense with valid values and confirm the totals, category breakdown, and transaction list update.
- [ ] Try a blank title, zero amount, and invalid amount to confirm validation.
- [ ] Change the monthly budget and confirm the remaining amount and status message update.
- [ ] Search by title or note and filter by category.
- [ ] Delete a transaction and confirm the totals recalculate.
- [ ] Refresh the page and confirm data persists.
- [ ] Reset the demo data and confirm the sample expenses and default budget return.
- [ ] Test the layout at desktop and mobile widths.

## Project files

- `index.html` — dashboard structure, forms, and accessible labels.
- `style.css` — visual design and responsive layout.
- `script.js` — arrays, conditionals, loops, DOM updates, event listeners, calculations, and local persistence.
- `README.md` — project overview and explanation of the week's JavaScript concepts.

## Next steps

Potential future improvements include selectable currencies, monthly history, export to CSV, charts, and a backend for authenticated multi-device access.

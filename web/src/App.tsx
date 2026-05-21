import { FormEvent, useEffect, useState } from "react";

import {
    AppState,
    CategoryId,
    categories,
    detectCategory,
    formatEuro,
    getCategory,
    getCategoryTotals,
    getFixedTotal,
    getRemainingBudget,
    getRemainingSpendLimit,
    getSavingsEstimate,
    getTotalSpent,
    getTrend,
    getVariableSpent,
    getWarnings,
    initialState,
    isMistralEnabled,
    parseAmount,
    suggestCategoryWithAi,
} from "./domain";

type Tab = "dashboard" | "add" | "history" | "analytics" | "edit";

const storageKey = "expenso-web:v1";

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
  });
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  if (!state.hasCompletedSetup) {
    return (
      <Setup
        onComplete={(next) =>
          setState({ ...state, ...next, hasCompletedSetup: true })
        }
      />
    );
  }

  const clearExpenses = () => {
    if (confirm("Clear all expenses but keep your budget setup?")) {
      setState({ ...state, expenses: [] });
    }
  };

  const startOver = () => {
    if (confirm("Start over and clear all budget setup and expenses?")) {
      setState(initialState);
      setTab("dashboard");
    }
  };

  const editingExpense = editingId
    ? state.expenses.find((e) => e.id === editingId)
    : null;

  return (
    <main className="shell">
      <section className="phone">
        {tab === "dashboard" ? (
          <Dashboard
            state={state}
            onEdit={() => setState({ ...state, hasCompletedSetup: false })}
          />
        ) : null}
        {tab === "add" ? (
          <ExpenseForm
            state={state}
            onSave={(expense) => {
              setState({
                ...state,
                expenses: [
                  { ...expense, id: crypto.randomUUID() },
                  ...state.expenses,
                ],
              });
              setTab("history");
            }}
          />
        ) : null}
        {tab === "edit" && editingExpense ? (
          <ExpenseForm
            state={state}
            initialExpense={editingExpense}
            onSave={(expense) => {
              setState({
                ...state,
                expenses: state.expenses.map((e) =>
                  e.id === editingId ? { ...expense, id: editingId } : e,
                ),
              });
              setEditingId(null);
              setTab("history");
            }}
          />
        ) : null}
        {tab === "history" ? (
          <History
            state={state}
            onClearExpenses={clearExpenses}
            onDelete={(id) =>
              setState({
                ...state,
                expenses: state.expenses.filter((expense) => expense.id !== id),
              })
            }
            onEdit={(id) => {
              setEditingId(id);
              setTab("edit");
            }}
            onStartOver={startOver}
          />
        ) : null}
        {tab === "analytics" ? <Analytics state={state} /> : null}
        <nav className="tabbar" aria-label="Primary navigation">
          <TabButton
            active={tab === "dashboard"}
            label="Dashboard"
            icon="◇"
            onClick={() => {
              setTab("dashboard");
              setEditingId(null);
            }}
          />
          <TabButton
            active={tab === "add"}
            label="Add"
            icon="+"
            onClick={() => {
              setTab("add");
              setEditingId(null);
            }}
          />
          <TabButton
            active={tab === "history"}
            label="History"
            icon="≡"
            onClick={() => {
              setTab("history");
              setEditingId(null);
            }}
          />
          <TabButton
            active={tab === "analytics"}
            label="Insights"
            icon="▣"
            onClick={() => {
              setTab("analytics");
              setEditingId(null);
            }}
          />
        </nav>
      </section>
    </main>
  );
}

function Setup({
  onComplete,
}: {
  onComplete: (state: Omit<AppState, "expenses" | "hasCompletedSetup">) => void;
}) {
  const [step, setStep] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [rent, setRent] = useState("");
  const [insurance, setInsurance] = useState("");
  const [monthlySpendLimit, setMonthlySpendLimit] = useState("");
  const nextState = {
    fixedCosts: {
      insurance: parseAmount(insurance),
      rent: parseAmount(rent),
    },
    monthlyBudget: parseAmount(monthlyBudget),
    monthlySpendLimit: parseAmount(monthlySpendLimit),
  };
  const savings = Math.max(
    0,
    nextState.monthlyBudget -
      nextState.fixedCosts.rent -
      nextState.fixedCosts.insurance -
      nextState.monthlySpendLimit,
  );

  return (
    <main className="shell">
      <section className="phone">
        <div className="screen">
          <p className="eyebrow">Expenso setup</p>
          <h1>
            {step === 0 ? "Build your monthly money plan." : null}
            {step === 1 ? "Add fixed costs once." : null}
            {step === 2 ? "Choose your spending cap." : null}
          </h1>
          <p className="muted">
            {step === 0
              ? "Your budget stays in this browser. No account, no backend."
              : null}
            {step === 1
              ? "For now, Expenso tracks rent and insurance as fixed monthly costs."
              : null}
            {step === 2
              ? "The rest becomes estimated savings if you do not overspend."
              : null}
          </p>

          <div className="card stack">
            {step === 0 ? (
              <MoneyInput
                label="Total monthly budget"
                value={monthlyBudget}
                onChange={setMonthlyBudget}
              />
            ) : null}
            {step === 1 ? (
              <>
                <MoneyInput label="Rent" value={rent} onChange={setRent} />
                <MoneyInput
                  label="Insurance"
                  value={insurance}
                  onChange={setInsurance}
                />
              </>
            ) : null}
            {step === 2 ? (
              <>
                <MoneyInput
                  label="How much do you want to spend this month?"
                  value={monthlySpendLimit}
                  onChange={setMonthlySpendLimit}
                />
                <p className="muted">
                  Estimated savings: {formatEuro(savings)}
                </p>
              </>
            ) : null}
          </div>

          <div className="actions">
            {step > 0 ? (
              <button className="button soft" onClick={() => setStep(step - 1)}>
                Back
              </button>
            ) : null}
            <button
              className="button"
              disabled={step === 0 && nextState.monthlyBudget <= 0}
              onClick={() =>
                step < 2 ? setStep(step + 1) : onComplete(nextState)
              }
            >
              {step < 2 ? "Continue" : "Start tracking"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Dashboard({ state, onEdit }: { state: AppState; onEdit: () => void }) {
  const categoriesWithSpend = getCategoryTotals(state);
  const flexibleSpent = getVariableSpent(state);
  const warnings = getWarnings(state);
  const progress =
    state.monthlySpendLimit > 0 ? flexibleSpent / state.monthlySpendLimit : 0;

  return (
    <div className="screen">
      <header className="row spread">
        <div>
          <p className="eyebrow">This month</p>
          <h1>Expenso</h1>
        </div>
        <button className="button soft compact" onClick={onEdit}>
          Edit
        </button>
      </header>

      <section className="hero">
        <p className="eyebrow pale">Left to spend</p>
        <div className="metric">
          {formatEuro(getRemainingSpendLimit(state))}
        </div>
        <Progress value={progress} />
        <div className="row">
          <Stat
            label="Spend cap"
            value={formatEuro(state.monthlySpendLimit)}
            inverse
          />
          <Stat label="Spent" value={formatEuro(flexibleSpent)} inverse />
        </div>
      </section>

      {warnings.length ? (
        <section className="card danger">
          <h2>{isMistralEnabled ? "AI budget warnings" : "Budget warnings"}</h2>
          {warnings.map((warning) => (
            <p key={warning}>- {warning}</p>
          ))}
        </section>
      ) : null}

      <div className="grid">
        <StatCard
          label="Fixed costs"
          value={formatEuro(getFixedTotal(state))}
        />
        <StatCard
          label="Savings estimate"
          value={formatEuro(getSavingsEstimate(state))}
        />
      </div>

      <section className="card stack">
        <MiniRow
          label="Total monthly budget"
          value={formatEuro(state.monthlyBudget)}
        />
        <MiniRow
          label="Total used including fixed costs"
          value={formatEuro(getTotalSpent(state))}
        />
        <MiniRow
          label="Budget after all spending"
          value={formatEuro(getRemainingBudget(state))}
        />
      </section>

      <section className="card stack">
        <div>
          <h2>Where it goes</h2>
          <p className="muted">Category-wise spending</p>
        </div>
        {categoriesWithSpend.length ? (
          <Breakdown categoriesWithSpend={categoriesWithSpend} />
        ) : (
          <p className="muted">
            Add an expense to unlock your category breakdown.
          </p>
        )}
      </section>
    </div>
  );
}

function ExpenseForm({
  onSave,
  state,
  initialExpense,
}: {
  state: AppState;
  onSave: (expense: Omit<AppState["expenses"][number], "id">) => void;
  initialExpense?: AppState["expenses"][number];
}) {
  const [title, setTitle] = useState(initialExpense?.title ?? "");
  const [amount, setAmount] = useState(initialExpense?.amount.toString() ?? "");
  const [note, setNote] = useState(initialExpense?.note ?? "");
  const [date, setDate] = useState(
    initialExpense?.date
      ? new Date(initialExpense.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );
  const [category, setCategory] = useState<CategoryId>(
    initialExpense?.category ?? "other",
  );
  const [manualCategory, setManualCategory] = useState(!!initialExpense);
  const [saving, setSaving] = useState(false);
  const expenseAmount = parseAmount(amount);
  const detected = getCategory(detectCategory(title));
  const currentRemainingLimit =
    getRemainingSpendLimit(state) + (initialExpense?.amount ?? 0);
  const spendOverflow = Math.max(0, expenseAmount - currentRemainingLimit);
  const currentRemainingBudget =
    getRemainingBudget(state) + (initialExpense?.amount ?? 0);
  const budgetAfterExpense = currentRemainingBudget - expenseAmount;

  useEffect(() => {
    if (!manualCategory) {
      setCategory(detectCategory(title));
    }
  }, [manualCategory, title]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || expenseAmount <= 0 || saving) {
      return;
    }
    setSaving(true);
    const finalCategory = manualCategory
      ? category
      : await suggestCategoryWithAi({ amount: expenseAmount, note, title });
    onSave({
      amount: expenseAmount,
      category: finalCategory,
      date: new Date(date).toISOString(),
      note,
      title: title.trim(),
    });
    setSaving(false);
  };

  return (
    <form className="screen" onSubmit={submit}>
      <p className="eyebrow">
        {initialExpense ? "Edit expense" : "New expense"}
      </p>
      <h1>
        {initialExpense ? "Update your records." : "Add it before you forget."}
      </h1>
      <p className="muted">
        Category suggestion: {title ? detected.label : "type a title first"}
        {isMistralEnabled ? " - AI will verify on save" : ""}
      </p>

      <section className="card stack">
        <TextInput
          label="Expense title"
          placeholder="Lidl, Netflix, Coffee..."
          value={title}
          onChange={setTitle}
        />
        <MoneyInput label="Amount" value={amount} onChange={setAmount} />
        {expenseAmount > 0 ? (
          <div className={`impact ${spendOverflow > 0 ? "warn" : ""}`}>
            <strong>
              {spendOverflow > 0 ? "Spending cap warning" : "Budget impact"}
            </strong>
            <p>
              {spendOverflow > 0
                ? budgetAfterExpense >= 0
                  ? `${formatEuro(spendOverflow)} is over your spend cap and will reduce estimated savings.`
                  : `${formatEuro(spendOverflow)} is over your spend cap. This puts your month at ${formatEuro(budgetAfterExpense)}.`
                : `After this expense, you will have ${formatEuro(currentRemainingLimit - expenseAmount)} left to spend.`}
            </p>
          </div>
        ) : null}
        <TextInput label="Date" value={date} onChange={setDate} />
        <TextInput
          label="Optional note"
          placeholder="Add context"
          value={note}
          onChange={setNote}
        />
      </section>

      <section className="card stack">
        <h2>Category</h2>
        <div className="pills">
          <button
            className={`pill ${!manualCategory ? "selected auto" : ""}`}
            type="button"
            onClick={() => {
              setManualCategory(false);
              setCategory(detectCategory(title));
            }}
          >
            <span /> Auto
          </button>
          {categories.map((item) => (
            <button
              className={`pill ${manualCategory && category === item.id ? "selected" : ""}`}
              key={item.id}
              style={
                manualCategory && category === item.id
                  ? { background: item.color, borderColor: item.color }
                  : undefined
              }
              type="button"
              onClick={() => {
                setCategory(item.id);
                setManualCategory(true);
              }}
            >
              <span
                style={{
                  background:
                    manualCategory && category === item.id
                      ? "#fff"
                      : item.color,
                }}
              />{" "}
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <button
        className="button"
        disabled={!title.trim() || expenseAmount <= 0 || saving}
      >
        {saving
          ? "Saving..."
          : initialExpense
            ? "Update expense"
            : "Save expense"}
      </button>
    </form>
  );
}

function History({
  onClearExpenses,
  onDelete,
  onEdit,
  onStartOver,
  state,
}: {
  onClearExpenses: () => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onStartOver: () => void;
  state: AppState;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const filtered = state.expenses
    .filter((expense) =>
      filter === "all" ? true : expense.category === filter,
    )
    .filter((expense) =>
      `${expense.title} ${expense.note ?? ""} ${expense.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const grouped = filtered.reduce<Record<string, typeof filtered>>(
    (acc, expense) => {
      const label = getCategory(expense.category).label;
      acc[label] = [...(acc[label] ?? []), expense];
      return acc;
    },
    {},
  );

  return (
    <div className="screen">
      <p className="eyebrow">History</p>
      <h1>Every euro, searchable.</h1>
      <section className="card stack">
        <input
          className="input"
          placeholder="Search expenses"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="pills">
          <button
            className={`pill all ${filter === "all" ? "selected" : ""}`}
            type="button"
            onClick={() => setFilter("all")}
          >
            <span /> All
          </button>
          {categories.map((item) => (
            <button
              className={`pill ${filter === item.id ? "selected" : ""}`}
              key={item.id}
              style={
                filter === item.id
                  ? { background: item.color, borderColor: item.color }
                  : undefined
              }
              type="button"
              onClick={() => setFilter(item.id)}
            >
              <span
                style={{ background: filter === item.id ? "#fff" : item.color }}
              />{" "}
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card stack">
        <h2>Reset options</h2>
        <p className="muted">
          Clear only expenses to keep your budget, or start over to enter a new
          monthly plan.
        </p>
        <button
          className="button soft"
          disabled={!state.expenses.length}
          onClick={onClearExpenses}
        >
          Clear expenses
        </button>
        <button className="button soft" onClick={onStartOver}>
          Start over
        </button>
      </section>

      {Object.entries(grouped).length ? (
        Object.entries(grouped).map(([label, expenses]) => (
          <section className="stack" key={label}>
            <h2>{label}</h2>
            {expenses.map((expense) => (
              <article className="expense" key={expense.id}>
                <span
                  style={{ background: getCategory(expense.category).color }}
                >
                  {getCategory(expense.category).label[0]}
                </span>
                <div
                  onClick={() => onEdit(expense.id)}
                  style={{ cursor: "pointer" }}
                >
                  <strong>{expense.title}</strong>
                  <p>
                    {new Date(expense.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
                <b>{formatEuro(expense.amount)}</b>
                <div className="row" style={{ gap: "8px" }}>
                  <button
                    aria-label={`Edit ${expense.title}`}
                    className="icon-button"
                    onClick={() => onEdit(expense.id)}
                  >
                    ✎
                  </button>
                  <button
                    aria-label={`Delete ${expense.title}`}
                    className="icon-button delete"
                    onClick={() => onDelete(expense.id)}
                  >
                    ×
                  </button>
                </div>
              </article>
            ))}
          </section>
        ))
      ) : (
        <section className="card stack">
          <h2>No expenses yet</h2>
          <p className="muted">
            Add your first expense and Expenso will start building your monthly
            picture.
          </p>
        </section>
      )}
    </div>
  );
}

function Analytics({ state }: { state: AppState }) {
  const categoryTotals = getCategoryTotals(state);
  const trend = getTrend(state.expenses);
  const max = Math.max(...trend.map((item) => item.amount), 1);

  return (
    <div className="screen">
      <p className="eyebrow">Insights</p>
      <h1>Know the pattern, change the outcome.</h1>
      <section className="card stack">
        <div className="grid">
          <Stat
            label="Biggest category"
            value={categoryTotals[0]?.label ?? "None yet"}
          />
          <Stat
            label="Left to spend"
            value={formatEuro(getRemainingSpendLimit(state))}
          />
        </div>
        <Progress
          value={
            state.monthlySpendLimit > 0
              ? getVariableSpent(state) / state.monthlySpendLimit
              : 0
          }
        />
        <p className="muted">
          Total used including fixed costs: {formatEuro(getTotalSpent(state))}
        </p>
      </section>
      <section className="card stack">
        <h2>Monthly trend</h2>
        {trend.length ? (
          <div className="bars">
            {trend.map((item) => (
              <div key={item.label}>
                <span
                  style={{
                    height: `${Math.max(18, (item.amount / max) * 150)}px`,
                  }}
                />
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">
            Monthly spending trends appear after adding expenses.
          </p>
        )}
      </section>
      <section className="card stack">
        <h2>Category breakdown</h2>
        {categoryTotals.length ? (
          <Breakdown categoriesWithSpend={categoryTotals} />
        ) : (
          <p className="muted">No category data yet.</p>
        )}
      </section>
    </div>
  );
}

function Breakdown({
  categoriesWithSpend,
}: {
  categoriesWithSpend: ReturnType<typeof getCategoryTotals>;
}) {
  const total = categoriesWithSpend.reduce(
    (sum, category) => sum + category.amount,
    0,
  );
  let offset = 0;

  return (
    <>
      <div className="donut">
        <svg viewBox="0 0 164 164">
          <circle cx="82" cy="82" r="58" />
          {categoriesWithSpend.map((category) => {
            const percent = total > 0 ? category.amount / total : 0;
            const dash = percent * 364;
            const circle = (
              <circle
                cx="82"
                cy="82"
                key={category.id}
                r="58"
                style={{
                  stroke: category.color,
                  strokeDasharray: `${dash} ${364 - dash}`,
                  strokeDashoffset: -offset,
                }}
              />
            );
            offset += dash;
            return circle;
          })}
        </svg>
        <strong>{formatEuro(total)}</strong>
      </div>
      {categoriesWithSpend.map((category) => (
        <MiniRow
          key={category.id}
          label={category.label}
          value={formatEuro(category.amount)}
          color={category.color}
        />
      ))}
    </>
  );
}

function MoneyInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="money">
        <b>EUR</b>
        <input
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0"
        />
      </div>
    </label>
  );
}

function TextInput({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        className="input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <div className="progress">
      <span style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

function Stat({
  inverse,
  label,
  value,
}: {
  inverse?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className={inverse ? "inverse" : ""}>
      <p className="muted">{label}</p>
      <h2>{value}</h2>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <section className="card">
      <Stat label={label} value={value} />
    </section>
  );
}

function MiniRow({
  color,
  label,
  value,
}: {
  color?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="mini-row">
      <span>
        {color ? <i style={{ background: color }} /> : null}
        {label}
      </span>
      <b>{value}</b>
    </div>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={active ? "active" : ""} onClick={onClick}>
      <b>{icon}</b>
      <span>{label}</span>
    </button>
  );
}

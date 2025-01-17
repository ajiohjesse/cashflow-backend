To accommodate a **recurring budget** feature, we’ll add a flag and frequency
options for recurring budgets. Here’s how the new functionality and database
design would be structured.

---

### Modified Budgeting Feature:

#### 1. **Create a Budget**:

-   **Fields**:

    -   Budget Amount
    -   Expense Category
    -   Start Date
    -   End Date
    -   Description (optional)
    -   **Recurring** (Yes/No) - New Flag
    -   **Recurrence Interval** (Daily, Weekly, Monthly, Yearly) - Visible only
        if the budget is set to recurring.

-   **Budget Types**:
    -   **One-time Budget**: A budget with a fixed start and end date, created
        for a specific period.
    -   **Recurring Budget**: A budget that automatically renews based on a set
        recurrence interval (e.g., daily, weekly, monthly, or yearly). The
        budget starts on the specified start date and renews itself when the
        period expires.

#### 2. **Track Recurring Budgets**:

-   The system automatically resets the recurring budget based on the specified
    interval (e.g., if it’s set to "monthly," the budget resets on the 1st of
    every month).
-   For each new period, the total budget resets, and the user can continue
    tracking their spending against the newly reset budget.
-   The system continues this process until the user disables the recurring
    flag.

---

### Functional Flow for Recurring Budgets

1. **Add New Budget**:

    - The user creates a budget as before, but now has the option to mark it as
      recurring.
    - If **Recurring** is set to “Yes,” they choose an interval (Daily, Weekly,
      Monthly, Yearly).
    - Once the budget period ends, the app automatically resets the budget and
      starts tracking expenses from the start of the new period.

2. **Automatic Budget Renewal**:
    - When a recurring budget reaches the end date, the system checks if it’s
      set to recurring. If yes, it creates a new budget record for the next
      cycle with the same amount and category, and resets the spent amount.

---

### Database Schema Changes

#### 1. **Budgets Table**:

To support the recurring budget feature, we’ll add new fields: `recurring` and
`recurrence_interval`.

```sql
CREATE TABLE budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    expense_category_id INTEGER NOT NULL,  -- Linked to expense category
    amount DECIMAL(10, 2) NOT NULL,  -- Budgeted amount
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    description TEXT,
    recurring BOOLEAN NOT NULL DEFAULT FALSE,  -- New: Recurring flag
    recurrence_interval TEXT,  -- New: 'daily', 'weekly', 'monthly', 'yearly' (nullable if not recurring)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (expense_category_id) REFERENCES categories(id)
);
```

-   **recurring**: A boolean flag that indicates if the budget is recurring.
-   **recurrence_interval**: A string value (`daily`, `weekly`, `monthly`,
    `yearly`) that specifies the frequency at which the budget recurs. This
    field is nullable if the budget is not recurring.

---

### Example User Stories for Recurring Budgets

1. **Create a Recurring Budget**:

    - As a user, I want to create a budget that automatically renews every month
      for groceries, so I don’t have to manually create a new budget each time.
    - As a user, I want to select the recurrence frequency (e.g., daily, weekly,
      monthly) when creating a budget, so I can control how often the budget
      resets.

2. **Track Recurring Budgets**:

    - As a user, I want to track how much I’ve spent in the current cycle of my
      recurring budget, so I can see how I’m managing my finances in that
      period.
    - As a user, I want my recurring budget to automatically reset at the start
      of the next period, so I can continue tracking without manual
      intervention.

3. **Disable a Recurring Budget**:
    - As a user, I want to be able to disable the recurring option for a budget,
      so I can stop it from automatically renewing when I no longer need it.

---

### Example Use Cases for Recurring Budgets

1. **User Sets a Monthly Recurring Budget for Groceries**:

    - John sets a recurring monthly budget of ₦50,000 for the "Groceries"
      expense category. The budget starts on October 1st and ends on October
      31st. The app tracks all outflows in the "Groceries" category during
      October.
    - On November 1st, the system automatically renews John’s grocery budget for
      ₦50,000, and the new budget cycle starts for November.

2. **User Sets a Daily Recurring Budget for Transportation**:
    - Jane sets a daily recurring budget of ₦2,000 for "Transportation"
      expenses, starting on October 1st. The system tracks her transportation
      outflows, and every day at midnight, the budget resets for the next day.

---

### Functional Updates Summary

-   **Recurring Budget Option**: Users can now set budgets to automatically
    recur at specified intervals.
-   **Automatic Budget Renewal**: Recurring budgets reset automatically based on
    the user-defined interval (daily, weekly, monthly, yearly).
-   **One-Time Budgets**: If a budget is not set to recurring, it functions as a
    one-time budget with a fixed start and end date.

---

This refined approach gives users more flexibility with managing their budgets,
especially for recurring expenses, ensuring the app caters to a variety of
budgeting needs!

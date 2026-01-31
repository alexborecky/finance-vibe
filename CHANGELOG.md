# Finance Vibe

Finance Vibe is a modern, intuitive personal finance tracker designed to help you master the 50/30/20 budgeting rule. It allows users to manage their income, track daily expenses with smart categorization, and visualize their savings potential through a unique "Savings Matrix" that combines fixed targets with budget leftovers.

---

# Changelog

## [0.1.0] - 2026-01-31

### Added
- **Initial Release of Savings Module**: Dedicated page for tracking and projecting monthly savings.
- **Saving Matrix Formula**: Implemented a dynamic calculation: `Target (20%) + Needs Leftover + Wants Leftover`.
- **Simple Savings Dialog**: A streamlined, single-field modal for quickly overriding monthly savings.
- **Dynamic Indicators**: Added color-coded status for budget leftovers (Green/Red) and a dotted underline for manually overridden amounts.
- **Annual Progress Card**: Real-time projection of end-of-year savings based on current performance and future targets.
- **Financial Core**: Support for 50/30/20 rule categorization (Needs, Wants, Savings).

### Changed
- **Expenses UI Refinements**:
  - Restyled "Add Expense" buttons to `outline` variant for better visibility.
  - Global cursor pointer for all buttons.
  - Updated "amount left" badge to show "over the budget" for negative balances.
- **Navigation**: Structured sidebar with Dashboard, Income, Expenses, Savings, and Goals.
- **Savings Table**: Transitioned from a simple manual input to a comprehensive matrix of needs/wants leftovers.

### Fixed
- Improved drag-and-drop visibility for expenses using `DragOverlay`.
- Corrected extra button rendering in `AddExpenseDialog` by using a hidden trigger.
- Resolved various TypeScript and build issues across core components.

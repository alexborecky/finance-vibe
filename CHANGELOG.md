# Changelog

## [0.2.3] - 2026-02-07

### Added
- **Expenses Alert**: Added a badge in the expenses header that warns if any future month (next 12 months) is projected to have a negative balance.

## [0.2.2] - 2026-02-05

### Added
- **Authentication & User Flow**: Implemented Supabase-based login, registration ("ask for invite"), and landing page routing.
- **Admin Dashboard**: New administrative interface for managing users and system data.
- **Income Table Persistence**: User preferences like column widths and visibility are now saved to the database.

### Changed
- **Extra Income UI**: Replaced accordion with a dedicated modal for editing and deleting entries.
- **Income Table**: Refined column styling (text buttons for settings) and responsive widths.
- **UI Styling**: Cleaned up padding and headers on income configuration pages.

### Fixed
- **React Hooks**: Resolved "Rendered more hooks than during the previous render" error in Expenses page.
- **Database Schema**: Fixed income category constraints and data persistence issues.


## [0.2.1] - 2026-02-01

### Added
- **Advanced Goals**: Introduced "Target Date" for financial goals, unlocking smart saving strategies that automatically create recurring transactions based on the goal timeline (Short-term vs. Long-term).
- **Dynamic Month Labels**: The income preview now dynamically displays the current month name (e.g., "Est. February Income").

### Changed
- **Income Form**: Refactored to support real-time recalculation as you type and added a permanent budget preview section.

## [0.2.0] - 2026-02-01

### Added
- **Fix Balance Feature**: New mechanism to cover "Needs" deficits using funds from "Wants" or "Savings" via offsetting transactions.
- **Invoice Delay Logic**: Added support for shifting hourly income calculations to the next month (e.g., January income based on December work).
- **Sidebar Alerts**: Added a red pulsing badge to the "Expenses" sidebar item when over budget.
- **Assets Module**: Created placeholder Assets page and navigation.
- **One-time Income**: Added ability to add one-time income entries (bonuses, gifts).
- **Goals Editing**: Added functionality to edit and update financial goals.

### Changed
- **Header Standardization**: All module headers now feature a consistent layout (Title on left, Action button on right) with descriptions removed for a cleaner look.
- **Hourly Income UI**: Updated calculation to use "Billable Days" and "Free Days". Added month-specific tooltips/labels for shifted income.
- **Dashboard**: Simplified the overview by removing the redundant "Add Transaction" card.

---

## [0.1.1] - 2026-01-31

### Changed
- **Expense Category UI**: Replaced the category dropdown with a modern Segmented Control (Tabs) for faster switching between budget buckets.
- **Workflow Optimization**: Removed the "Saving" category from the Add Expense dialog to streamline the separation between daily spending (Needs/Wants) and the new dedicated Savings module.

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

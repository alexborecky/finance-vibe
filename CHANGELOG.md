# Changelog

## [0.2.4] - 2026-02-09

### Added
- **Multi-Source Savings**: New dialog for adding savings from various sources (One-time, Needs leftover, Wants leftover).
- **Savings Editing**: Implemented modal-based editing for individual savings entries, matching the Extra Income UI.
- **UI Indicators**: Added descriptive titles to key dashboard and module cards for better context and navigation.

### Changed
- **Global Scrollability**: Enabled scrollable containers for the Expense table and Dashboard to prevent layout breaks on small screens.
- **Enhanced Compactness**: Reduced table row padding and adjusted card spacing to "hug" content better across the application.
- **Current Month Focus**: Improved visibility by highlighting the current month in selection menus.

### Fixed
- **Data Persistence**: Refactored form submission logic across Goals, Transactions, and Income to ensure reliable saving to the backend (Supabase).
- **Content Clipping**: Fixed overflow issues in Income and Expense cards using `overflow-hidden`.
- **Hydration & State**: Resolved various React hydration errors and form reset bugs in dialog components.

## [0.2.3] - 2026-02-07

### Added
- **Assets UI Refactor**: Completely redesigned the Assets module to match the "Goals" style, grouping all assets within a single container card.
- **Click-to-Edit**: Made both Asset and Goal items fully clickable triggers for their respective edit dialogs, removing redundant dropdown menus.
- **Enhanced Asset Deletion**: Moved the delete functionality into the Asset edit dialog with a confirmation modal for a safer and cleaner experience.

### Changed
- **Unified Module Style**: Standardized both Assets and Goals to use a high-density, card-based layout without internal headers.
- **Compact Layout**: Minimized padding across Assets and Goals (zero top padding, reduced row height) to maximize information density.
- **Container Insets**: Added consistent 16px (`px-4`) left and right padding to the main module cards.
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

# Finance Vibe 💸 `v0.2.5`

![Finance Vibe Hero](./public/images/hero.png)

**Finance Vibe** is a high-performance personal finance dashboard engineered for precision and visual excellence. Built on the core principles of the **50/30/20 rule**, it empowers you to master your cash flow, automate savings, and visualize your financial future with a premium, glassmorphism-inspired interface.

## ✉️ Get an Invitation

Finance Vibe is currently in a controlled beta. If you would like to try out the app and start your own financial journey, please contact the developer for an invitation code:

- **Email**: [boreckyalex@gmail.com](mailto:boreckyalex@gmail.com)
- **Subject**: Invitation Request - Finance Vibe

## ✨ Key Features

### 🧩 The Savings Matrix
Discover your true saving potential. Our unique formula calculates your final savings by combining your fixed target (20% of income) with any leftovers from your **Needs** and **Wants** budgets. 
- **Dynamic Tracking**: Watch your savings target grow as you spend less than planned.
- **Manual Overrides**: Set custom savings goals for specific months when life happens.
- **Visual Progress**: Real-time annual projections keep you motivated.

### 💳 Effortless Expense Management
- **Smart Categorization**: Instantly sort transactions into Needs, Wants, or Savings.
- **Recurring Expenses**: Automate your fixed costs (Rent, Utilities, Netflix) so your budget is always up to date.
- **Drag & Drop**: Effortlessly organize your finances with a modern, interactive interface.

### 📈 Financial Overview
- **Interactive Dashboard**: Get a bird's-eye view of your financial health.
- **Goal Tracking**: Visualize your progress toward big purchases or long-term safety nets.
- **Clean Aesthetics**: A glassmorphism-inspired design that makes managing money feel premium.

## 🚀 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Client-side persistence)
- **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🛠️ Getting Started

Follow these steps to set up Finance Vibe on your local machine.

### 1. Clone & Install
```bash
git clone https://github.com/alexborecky/finance-vibe.git
cd finance-vibe
npm install
```

### 2. Supabase Setup
Finance Vibe requires a Supabase project for authentication and data storage.
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings > API** and find your **Project URL** and **anon public** key.
3. In your project root, copy `.env.local.example` to a new file named `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Paste your Supabase credentials into `.env.local`.

> [!TIP]
> You can easily point your app to a different Supabase project at any time by simply updating the credentials in your `.env.local` file and restarting the dev server.

### 3. Database Migration
1. In your Supabase dashboard, go to the **SQL Editor**.
2. Create a **New Query** and paste the contents of the `supabase/schema_enhanced.sql` file.
3. Click **Run** to set up the necessary tables, RLS policies, and admin roles.

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start your financial journey.

## 📜 50/30/20 Rule Implementation
Finance Vibe follows the standard financial recommendation for healthy spending:
- **50% Needs**: Essential costs like rent, groceries, and insurance.
- **30% Wants**: Lifestyle choices like dining out, hobbies, and shopping.
- **20% Savings/Debt**: Building your future and paying down liabilities.

## 📄 Changelog
Stay up to date with the latest changes and features in our [Changelog](./CHANGELOG.md).

---
Built with ❤️ by [Alexandr Borecky](https://github.com/alexborecky)

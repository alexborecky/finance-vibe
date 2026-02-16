
export const MOCK_USER = {
  id: 'demo-user-id',
  email: 'demo@example.com',
  full_name: 'Demo User',
  avatar_url: 'https://ui-avatars.com/api/?name=Demo+User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_GOALS = [
  {
    id: 'goal-1',
    user_id: MOCK_USER.id,
    name: 'New Laptop',
    target_amount: 2500,
    current_amount: 1200,
    deadline: '2026-12-31',
    created_at: new Date().toISOString(),
    image_url: null,
    is_paused: false,
    priority: 1,
  },
  {
    id: 'goal-2',
    user_id: MOCK_USER.id,
    name: 'Vacation to Japan',
    target_amount: 5000,
    current_amount: 3500,
    deadline: '2027-04-15',
    created_at: new Date().toISOString(),
    image_url: null,
    is_paused: false,
    priority: 2,
  },
];

export const MOCK_TRANSACTIONS = [
  {
    id: 'tx-1',
    user_id: MOCK_USER.id,
    amount: 1200,
    description: 'Salary',
    category: 'Income',
    date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    type: 'income',
    counterparty: 'Employer Inc.',
    payment_method: 'Bank Transfer',
    is_recurring: true,
  },
  {
    id: 'tx-2',
    user_id: MOCK_USER.id,
    amount: -45.50,
    description: 'Grocery Shopping',
    category: 'Food',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    type: 'expense',
    counterparty: 'Supermarket',
    payment_method: 'Credit Card',
    is_recurring: false,
  },
  {
    id: 'tx-3',
    user_id: MOCK_USER.id,
    amount: -15.00,
    description: 'Netflix Subscription',
    category: 'Entertainment',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    type: 'expense',
    counterparty: 'Netflix',
    payment_method: 'Credit Card',
    is_recurring: true,
  },
];

export const MOCK_ASSETS = [
  {
    id: 'asset-1',
    user_id: MOCK_USER.id,
    name: 'Stocks Portfolio',
    value: 15000,
    currency: 'USD',
    type: 'Investment',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'asset-2',
    user_id: MOCK_USER.id,
    name: 'Checking Account',
    value: 5432.10,
    currency: 'USD',
    type: 'Cash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const MOCK_RESERVES = [
  {
    id: 'reserve-1',
    user_id: MOCK_USER.id,
    name: 'Emergency Fund',
    current_amount: 10000,
    target_amount: 15000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const MOCK_PROFILE = {
  id: MOCK_USER.id,
  email: MOCK_USER.email,
  full_name: MOCK_USER.full_name,
  avatar_url: MOCK_USER.avatar_url,
  updated_at: new Date().toISOString(),
  // Income Config
  income_mode: 'fixed',
  income_amount: 45000,
  tax_rate: 15,
  payment_delay: false,
  hourly_rate: null,
  hours_per_week: null,
  income_adjustments: {},
  preferences: {
    theme: 'system',
    currency: 'USD',
  }
};

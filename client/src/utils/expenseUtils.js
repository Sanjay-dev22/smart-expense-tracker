export const commonCategories = [
  'Groceries',
  'Utilities',
  'Rent / Housing',
  'Food & Drink',
  'Transport',
  'Shopping',
  'Entertainment',
  'Health',
  'Education',
  'Travel',
  'Personal Care',
  'Insurance',
  'Gifts & Donations',
  'EMIs / Loans',
  'Savings & Investments',
  'Miscellaneous',
];

export const mergeCategories = (expenses = [], existing = commonCategories) => {
  const fromExpenses = expenses.map((expense) => expense.category).filter(Boolean);
  return Array.from(new Set([...commonCategories, ...existing, ...fromExpenses]));
};

export const sortExpenses = (expenses = [], sortBy = 'createdAt', sortOrder = 'desc') =>
  [...expenses].sort((a, b) => {
    if (sortBy === 'amount') {
      return sortOrder === 'asc'
        ? Number(a.amount) - Number(b.amount)
        : Number(b.amount) - Number(a.amount);
    }

    const aDate = new Date(a.createdAt || a.date || 0).getTime();
    const bDate = new Date(b.createdAt || b.date || 0).getTime();
    return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
  });

export const getExpenseStats = (expenses = []) => {
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const now = new Date();
  const monthly = expenses
    .filter((expense) => {
      const date = new Date(expense.createdAt || expense.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const average = expenses.length ? total / expenses.length : 0;

  return {
    total,
    monthly,
    average,
    count: expenses.length,
    topCategory: topCategory ? topCategory[0] : 'None',
    topCategoryAmount: topCategory ? topCategory[1] : 0,
    categoryCount: Object.keys(categoryTotals).length,
  };
};

export const getCategoryData = (expenses = []) =>
  Object.values(
    expenses.reduce((acc, expense) => {
      const category = expense.category || 'Uncategorized';
      if (!acc[category]) acc[category] = { name: category, value: 0 };
      acc[category].value += Number(expense.amount || 0);
      return acc;
    }, {})
  ).sort((a, b) => b.value - a.value);

export const getDailyTrendData = (expenses = []) => {
  const daily = expenses.reduce((acc, expense) => {
    const date = new Date(expense.createdAt || expense.date);
    if (Number.isNaN(date.getTime())) return acc;
    const key = date.toISOString().split('T')[0];
    acc[key] = (acc[key] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});

  return Object.entries(daily)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

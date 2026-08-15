/**
 * BudgetTracker Financial Suite — Common Data Entry & Sync Engine
 * Root alias for js/common-forms.js
 */

const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwA58LpxUbHaKKA1PjsViLhkO29DwhzxxR8zqmop5VJnx8o5VYKJs7iRRlUKS3mVjoN/exec';

const CURRENCIES = ['JPY', 'MMK', 'USD'];
const STATUS_LIST = ['-', 'Need', 'Want'];

const FOR_WHO = [
  '-', 'CS', 'MG', 'US',
  'Grandparents', 'Mother', 'ThawThaw',
  'Younger_Brother_1', 'Younger_Brother_2',
  'Nephew & Niece', 'Nephew', 'Niece',
  'Mg_Relative', 'Cs_Relative', 'Friend', 'Coworker'
];

const ALL_SOURCES = {
  JPY: [
    'Bk-MUFG_MG', 'Bk-PAYPAY_MG', 'Bk-YUCHO_MG',
    'Cash_MG',
    'Crd-JCB_MG', 'Crd-MUFG_MG', 'Crd-PAIDY_MG', 'Crd-PAYPAY_MG',
    'Suika_MG',
    'Bk-MIZUHO_CS', 'Bk-MUFG_CS', 'Bk-PAYPAY_CS', 'Bk-SMBC_CS', 'Bk-YUCHO_CS',
    'Cash_CS',
    'Crd-EOPS_CS', 'Crd-JCB_CS', 'Crd-MUFG_CS', 'Crd-PAIDY_CS', 'Crd-PAYPAY_CS',
    'Crd-RAKUTEN_CS', 'Crd-SMBC_CS',
    'Suika_CS',
    'Bk-YUCHO_ATP',
    'Money_Changer',
    'Borrower'
  ],
  MMK: [
    'Bk-AYA_MG', 'Bk-KBZ_MG', 'KBZPay_MG', 'WavePay_MG',
    'Bk-AYA_CS', 'Bk-KBZ_CS', 'KBZPay_CS', 'WavePay_CS',
    'KBZPay_Mother', 'KBZPay_Sister',
    'Money_Changer',
    'Cash_CS', 'Cash_MG'
  ],
  USD: [
    '-',
    'PayPal',
    'Other'
  ]
};

const TRANSFER_SOURCES = ALL_SOURCES;

const TYPE_DETAILS = {
  Income: {
    Fixed_Income: ['Salary1', 'Salary2', 'Salary3', 'Other'],
    Extra_Income: ['National_Support', 'University_Support', 'Bonus', 'Gift', 'Other'],
    Business_Income: ['Laptop_Sell', 'Software_Subscription_Sell', 'Tiktok', 'Other'],
    Loan_Income: ['-', 'New Loan', 'Existing Loan', 'Additional Loan', 'Refinance', 'Other'],
    Lend_Income: ['Family Paid Back', 'Friend Paid Back', 'Business Paid Back', 'Other Paid Back', 'Other'],
    Exchange_Income: ['-', 'Exchange Received', 'Refund', 'Other'],
    Other_Income: ['Other', 'Refund', 'Cashback', 'Interest', 'Bonus', 'Gift', 'Side Income', 'Miscellaneous']
  },

  Expense: {
    Fixed_Expenses: ['Rent Housing Fee', 'House Maintenance Fee', 'Water Purifier Fee'],
    Bills_Utilities: ['Electricity Bill', 'Gas Bill', 'Water Bill', 'Mobile Phone Bill', 'Internet Bill'],
    Taxes_Insurance: ['Health Insurance', 'Employment Insurance', 'Pension Contribution', 'Resident Tax', 'Income Tax', 'Bicycle Insurance'],
    Food_Expenses: ['Cooking Food', 'Dining Out', 'Snacks & Drinks'],
    Fashion_Expenses: ['Home Cloth', 'Outfit Cloth', 'Underwear Cloth', 'Sport Cloth', 'Shoes', 'Bags', 'Accessories'],
    Living_Expenses: ['Kitchen Items', 'Bathroom Items', 'Cleaning Items', 'Laundry Items', 'Bedroom Items', 'Furniture', 'Home Appliances', 'Home Tools', 'Home Decor', 'Storage Items', 'Daily Supplies', 'Installation Fee'],
    Social_Expenses: ['Birthday', 'Wedding', 'Funeral', 'Donation'],
    Education_Expenses: ['Tuition Fee', 'Online Course', 'Books', 'Exam Fee', 'Printing', 'School Trip', 'School Supplies', 'Research'],
    Healthcare_Expenses: ['Hospital', 'Clinic', 'Medicine', 'Dental', 'Eye Care', 'Health Check', 'Vaccination'],
    Transportation_Expenses: ['Train', 'Bus', 'Taxi', 'Fuel', 'Parking Fee', 'Bicycle'],
    Business_Expenses: ['Human Resources', 'Advertising & Marketing', 'Transportation'],
    Work_Expenses: ['Transportation', 'Stationery', 'Food', 'Snacks & Drinks', 'Work Clothes', 'Business Trip', 'Training'],
    Loan_Expenses: ['-', 'Partial Repayment', 'Full Repayment', 'Interest', 'Service Fee', 'Late Fee', 'Other Fee'],
    Lend_Expenses: ['-', 'Emergency', 'Living Expense', 'Medical', 'Education', 'Shopping', 'Travel', 'Paid for Someone', 'Other'],
    Exchange_Expenses: ['-', 'Service Fee', 'Transfer Fee', 'Agent Fee', 'Other Fee'],
    Digital_Expenses: ['AI Tools', 'Cloud Storage', 'Domain & Hosting', 'Online Services', 'App Services'],
    PersonalCare_Expenses: ['Haircut', 'Hair Care', 'Nail Care', 'Skin Care', 'Cosmetics', 'Body'],
    Travel_Leisure: ['Hotel', 'Travel', 'Tickets', 'Shopping', 'Activities', 'Gifts', 'Photo Print'],
    Entertainment: ['Movies', 'Games', 'Music', 'Streaming', 'Events', 'Hobbies', 'Fun Activities'],
    Family_Support: ['Living Support', 'Medical Support', 'Education Support', 'Gifts', 'Emergency'],
    Savings_Investments: ['Saving', 'Emergency Fund', 'NISA', 'Stocks', 'Gold', 'House & Land', 'Business Fund'],
    Other_Expenses: ['-', 'Document', 'Print', 'Previous Used']
  },

  Transfer: {
    'Bank → Bank': [],
    'Bank → Cash': [],
    'Bank → Credit': [],
    'Credit → Bank': [],
    'Cash → Bank': []
  }
};

const FLOW_META = {
  Income: {
    icon: '💵',
    title: 'Income Data Entry',
    subtitle: 'Record salary, side-business, and cash inflows.',
    save: 'Save Income'
  },
  Expense: {
    icon: '🛒',
    title: 'Expense Data Entry',
    subtitle: 'Record daily expenses, bills, and purchases.',
    save: 'Save Expense'
  },
  Transfer: {
    icon: '🔄',
    title: 'Transfer Data Entry',
    subtitle: 'Move funds between accounts, cash, or cards.',
    save: 'Save Transfer'
  }
};

let currentFlow = 'Income';

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, function(c) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[c];
  });
}

function optionList(items, placeholder) {
  return '<option value="">' + escapeHtml(placeholder) + '</option>' +
    items.map(function(v) {
      return '<option value="' + escapeHtml(v) + '">' +
        escapeHtml(String(v).split('_').join(' ')) +
      '</option>';
    }).join('');
}

function sourceGroupName(value) {
  const v = String(value || '');
  if (v.indexOf('Bk-') === 0) return '🏦 Bank';
  if (v.indexOf('Crd-') === 0) return '💳 Credit';
  if (/^cash/i.test(v)) return '💵 Cash';
  if (
    v.indexOf('KBZPay') === 0 ||
    v.indexOf('WavePay') === 0 ||
    v === 'PayPal'
  ) {
    return '📱 Mobile Pay';
  }
  if (v.indexOf('Suika') === 0) return '🚆 Suica';
  return '👤 Other';
}

function groupedSourceOptions(items, placeholder) {
  const order = ['🏦 Bank', '💳 Credit', '💵 Cash', '📱 Mobile Pay', '🚆 Suica', '👤 Other'];
  const groups = {};
  order.forEach(g => { groups[g] = []; });

  items.forEach(v => {
    if (v === '-') return;
    const group = sourceGroupName(v);
    if (!groups[group]) groups[group] = [];
    groups[group].push(v);
  });

  let html = '<option value="">' + escapeHtml(placeholder) + '</option>';
  html += '<option value="-">-</option>';

  order.forEach(group => {
    if (!groups[group] || !groups[group].length) return;
    html += '<optgroup label="' + escapeHtml(group) + '">';
    html += groups[group].map(v => '<option value="' + escapeHtml(v) + '">' + escapeHtml(v) + '</option>').join('');
    html += '</optgroup>';
  });

  return html;
}

function todayISO() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function currentMonthISO() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + pad(d.getMonth() + 1);
}

function showToast(message, isError = false) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.background = isError ? '#ef4444' : '#10b981';
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

function initThemeToggle() {
  const savedTheme = localStorage.getItem('budget_tracker_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.textContent = savedTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('budget_tracker_theme', next);
      toggleBtn.textContent = next === 'dark' ? '☀️ Light' : '🌙 Dark';
    });
  }
}

function saveLocalRecent(type, record) {
  try {
    const key = `recent_${type}`;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.unshift({ ...record, id: Date.now(), createdAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(list.slice(0, 30)));
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
});

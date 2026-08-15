# BudgetTracker — မိသားစုဝင်ငွေ/ထွက်ငွေ စီမံခန့်ခွဲမှု ဒက်ရှ်ဘုတ် (Family Finance Dashboard)

Reference ဒီဇိုင်းများနှင့် Excel စာရင်းဇယားအတိုင်း အတိအကျ Pixel-Perfect ဖန်တီးထားသော HTML5/CSS3/Vanilla JavaScript Dashboard Prototype ဖြစ်ပါသည်။

---

## ၁။ စတင်အသုံးပြုပုံ (How to Run Locally)

မည်သည့် Framework သို့မဟုတ် Build Tool မှ မလိုအပ်ဘဲ Browser ပေါ်တွင် တိုက်ရိုက် run နိုင်ပါသည် -

၁။ **Browser ဖြင့် တိုက်ရိုက်ဖွင့်ခြင်း** -
   - `index.html` ဖိုင်ကို Double-Click နှိပ်၍ Google Chrome, Microsoft Edge, Safari စသည့် Browser တစ်ခုခုဖြင့် ချက်ချင်း ဖွင့်ကြည့်နိုင်ပါသည်။

၂။ **Local HTTP Server ဖြင့် စမ်းသပ်ခြင်း** (အကြံပြုချက်) -
   ```bash
   # Python 3 ဖြင့်
   python -m http.server 8080
   # ထို့နောက် Browser တွင် http://localhost:8080 ကို ဖွင့်ပါ
   ```
   သို့မဟုတ် Node.js ဖြင့်:
   ```bash
   npx serve .
   ```

---

## ၂။ ပါဝင်သော Dashboard စာမျက်နှာ (၆) ခု

| Dashboard အမည် | ပါဝင်သော အချက်အလက်များနှင့် လုပ်ဆောင်ချက်များ |
| :--- | :--- |
| **🏠 Overview (အကျဉ်းချုပ်)** | ထိပ်ဆုံး KPI ကတ် (၅) ခု၊ Budget vs Actual နှိုင်းယှဉ်ချက် Bar Chart၊ (၆) လစာ ဝင်ငွေ/ထွက်ငွေ Trend Line Chart၊ အသုံးစရိတ် ကဏ္ဍခွဲ Donut Chart၊ လက်ကျန်ငွေ/ဘဏ်အကောင့်များ၊ လက်ကျန်အကြွေးစာရင်း၊ လာမည့်ပေးချေရမည့်ရက်များ၊ စုငွေရည်မှန်းချက်များ နှင့် အောက်ဆုံးတွင် လတ်တလော ငွေသွင်း/ငွေထုတ်မှတ်တမ်း။ |
| **🏛️ Accounts (ဘဏ်နှင့် ငွေစာရင်းများ)** | အိမ်ထောင်စု စုစုပေါင်းလက်ကျန်ငွေ KPI၊ ဘဏ်အကောင့် (၁၂) ခု၏ အသေးစိတ်စာရင်း (Mizuho, SMBC, Rakuten, MUFG, Yucho, PayPay, Cash, Suica, AEON, JCB စသည်)၊ ကဒ်သုံးစွဲနိုင်သည့် Limit၊ ငွေကြေးအမျိုးအစားအလိုက် စာရင်း (JPY, MMK)၊ လက်ကျန်ငွေ (၀) ဖြစ်နေသော အကောင့်များကို ဖျောက်ထားပေးခြင်း။ |
| **⏱️ Budget (ဘတ်ဂျက် စီမံခန့်ခွဲမှု)** | စုစုပေါင်း သတ်မှတ်ဘတ်ဂျက်၊ အမှန်တကယ် သုံးစွဲငွေ၊ ကျန်ရှိငွေ၊ သုံးစွဲမှုရာခိုင်နှုန်း (74%)၊ ဘတ်ဂျက်ကျော်လွန်သွားသော ကဏ္ဍများ (Transportation +16%, Entertainment +16%)၊ လစဉ် Budget Trend၊ ဘတ်ဂျက်ခွဲဝေမှု Donut Chart နှင့် သတိပေးချက်များ (Alerts)။ |
| **💳 Debt (အကြွေးနှင့် ချေးငွေ စီမံခန့်ခွဲမှု)** | စုစုပေါင်းဆပ်ရန်ကျန်ငွေ (¥728,700)၊ ယခုလပေးဆပ်ပြီးငွေ၊ လာမည့် ၇ ရက်အတွင်း ပေးရန်ရှိငွေ၊ ပျမ်းမျှအတိုးနှုန်း (8.7%)၊ အကြွေးစာရင်း (၅) ခု၏ အတိုးနှုန်းနှင့် ပေးဆပ်မှုတိုးတက်မှု (JCB 15%, MUFG 14.6%, Rakuten Loan 10.8%, Home Loan 0.975%, Car Loan 3.9%)၊ Dual-axis Payoff Trend Chart နှင့် အတိုးသက်သာစေမည့် အကြံပြုချက်။ |
| **📊 Spending (အသုံးစရိတ် အသေးစိတ် လေ့လာဆန်းစစ်မှု)** | စုစုပေါင်းအသုံးစရိတ် (¥198,450)၊ တစ်ရက်ပျမ်းမျှ၊ အရေအတွက်၊ ဝင်ငွေ၏ သုံးစွဲမှုရာခိုင်နှုန်း (38.7%)၊ အသုံးအများဆုံးကဏ္ဍ (Food & Dining)၊ သုံးစွဲသူအလိုက် (Me, Family, Partner, Parents)၊ မရှိမဖြစ် နှင့် လိုအင်ဆန္ဒ ခွဲခြမ်းစိတ်ဖြာမှု (Need 74.1% vs Want 25.9%)၊ လစဉ်ပုံမှန်ကျသင့်ငွေများ (Recurring Expenses)။ |
| **🚩 Goals (စုငွေ ရည်မှန်းချက်များ)** | စုစုပေါင်း ရည်မှန်းငွေ (¥1,650,000)၊ စုဆောင်းပြီးငွေ (¥859,000)၊ အောင်မြင်မှုရာခိုင်နှုန်း (52.1%)၊ ရည်မှန်းချက် (၅) ခု (Family Emergency Fund, Japan Trip, New Laptop, Kids Education Fund, Home Repair Fund)၊ လစဉ်စုဆောင်းရန် အကြံပြုငွေပမာဏ၊ ကျန်ရှိသော ရက်အရေအတွက် Countdown နှင့် အခြေအနေ ၂x၂ Grid (On Track, At Risk, Not Started, Completed)။ |

---

## ၃။ Google Sheets နှင့် ချိတ်ဆက်အသုံးပြုမည့် ပုံစံ (Google Sheets Integration Architecture)

ဤ Dashboard ကို နောင်တွင် **Google Sheets / Google Apps Script** နှင့် အလွယ်တကူ ချိတ်ဆက်အသုံးပြုနိုင်ရန် UI ဒီဇိုင်းကို ပြင်ဆင်စရာမလိုဘဲ Data Provider Layer တစ်ခုတည်းဖြင့် ချိတ်ဆက်နိုင်အောင် တည်ဆောက်ထားပါသည်။

### အလုပ်လုပ်ပုံ အဆင့်ဆင့် (How It Works)

```
[ Google Sheets Data Store ]
 (Income-Expense-Tracker, Budgets, Savings_Goals, Payment_Schedule)
              ▲
              │ (Google Apps Script: Code.gs)
              ▼
    [ google.script.run ]
              ▲
              │
              ▼
[ js/dashboard-data.js ] ──► [ js/calculations.js ] ──► [ 6 Dashboard Views ]
```

### ချိတ်ဆက်နည်း (Step-by-Step Integration)

၁။ **Google Sheet ထဲတွင် Google Apps Script (`Code.gs`) ရေးသားခြင်း** -
```javascript
// Code.gs
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('BudgetTracker')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Google Sheets မှ Data များအားလုံးကို ဖတ်ယူပေးသော function
function getAllDashboardData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const txSheet = ss.getSheetByName('Income-Expense-Tracker');
  const budgetSheet = ss.getSheetByName('Budgets');
  const goalSheet = ss.getSheetByName('Savings_Goals');
  const scheduleSheet = ss.getSheetByName('Payment_Schedule');

  // Sheet ထဲမှ rows များကို ဖတ်ယူ၍ JSON format ဖြင့် return ပြန်ပေးပါမည်
  return {
    transactions: readTransactions(txSheet),
    budgets: readBudgets(budgetSheet),
    goals: readGoals(goalSheet),
    upcomingPayments: readSchedules(scheduleSheet)
  };
}

// Data အသစ်ထည့်ခြင်း / ပြင်ဆင်ခြင်း
function appendTransactionRow(txData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Income-Expense-Tracker');
  sheet.appendRow([
    txData.date, txData.description, txData.cashFlow, txData.cashFlowType,
    txData.fromSource, txData.toSource, txData.amount, txData.currency,
    txData.detail, txData.forWho, txData.status, txData.note
  ]);
  return { success: true };
}
```

၂။ **`js/dashboard-data.js` ထဲတွင် ချိတ်ဆက်ခြင်း** -
`js/dashboard-data.js` ထဲရှိ `getDashboardData()` function နေရာတွင် အောက်ပါအတိုင်း အစားထိုးလိုက်ရုံဖြင့် Google Sheet မှ data များကို တိုက်ရိုက် ဆွဲယူပြသပေးသွားမည် ဖြစ်ပါသည်-

```javascript
async function getDashboardData() {
  return new Promise((resolve, reject) => {
    // Google Apps Script ပေါ်တွင် run နေပါက Google Sheets မှ data ဆွဲမည်
    if (typeof google !== "undefined" && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .getAllDashboardData();
    } else {
      // Local ကွန်ပျူတာပေါ်တွင် စမ်းသပ်နေပါက Local Test Data ကို အသုံးပြုမည်
      resolve(localDashboardData);
    }
  });
}
```

---

## ၄။ အဓိက ထူးခြားချက်များနှင့် ပါဝင်သော စနစ်များ

- **Collapsible Sidebar Menu**: ဘယ်ဘက်ခြမ်း မီနူးကို ပုံမှန်အားဖြင့် ဖျောက်ထားပြီး ထိပ်ဆုံးရှိ **`☰ Menu`** ခလုတ်ကို နှိပ်မှသာ ချောမွေ့စွာ ထွက်ပေါ်လာမည် ဖြစ်သည်။
- **Multi-Currency စနစ်**: `JPY (¥)`, `MMK (Ks)`, `USD ($)` ငွေကြေးများကို သီးခြားစီ စစ်ထုတ်ကြည့်ရှုနိုင်ပြီး ရောနှောပေါင်းစပ်မှု မရှိစေရန် စနစ်တကျ ခွဲခြားထားသည်။
- **In-Memory CRUD စနစ်**: ငွေသွင်း/ငွေထုတ် စာရင်းများကို ချက်ချင်း Edit (ပြင်ဆင်ခြင်း) / Delete (ဖျက်ခြင်း) ပြုလုပ်နိုင်ပြီး KPI နှင့် Chart များ ချက်ချင်း Update ဖြစ်သွားပါသည်။
- **Dark Mode**: ညဘက်အသုံးပြုရန် အလင်း/အမှောင် ပြောင်းလဲနိုင်သော ခလုတ် ပါဝင်သည်။
- **သန့်ရှင်းသော Code ဖွဲ့စည်းမှု**: Framework အကြီးကြီးများ မသုံးဘဲ Vanilla JS, CSS Modules နှင့် Chart.js ဖြင့် ပေါ့ပါးသွက်လက်စွာ တည်ဆောက်ထားသည်။

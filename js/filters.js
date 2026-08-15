/**
 * BudgetTracker Global Filter State Manager
 */

window.BudgetTrackerFilters = (() => {
  const defaultFilters = {
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    currency: "JPY",
    account: "all",
    forWho: "all",
    category: "all"
  };

  let currentFilters = { ...defaultFilters };
  const listeners = [];

  function getFilters() {
    return { ...currentFilters };
  }

  function setFilter(key, value) {
    if (currentFilters[key] !== value) {
      currentFilters[key] = value;
      notifyListeners();
    }
  }

  function resetFilters() {
    currentFilters = { ...defaultFilters };
    notifyListeners();
  }

  function subscribe(fn) {
    listeners.push(fn);
  }

  function notifyListeners() {
    listeners.forEach(fn => fn(currentFilters));
  }

  return {
    getFilters,
    setFilter,
    resetFilters,
    subscribe
  };
})();

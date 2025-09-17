import React, { useState, useEffect } from 'react';

const MonthCalendar = ({ value, onChange, className = '' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (value) {
      const [year, month] = value.split('-');
      setCurrentDate(new Date(parseInt(year), parseInt(month) - 1));
      setSelectedMonth(value);
    } else {
      const now = new Date();
      const currentMonthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setSelectedMonth(currentMonthValue);
      setCurrentDate(now);
    }
  }, [value]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handleMonthSelect = (monthIndex) => {
    const monthValue = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    setSelectedMonth(monthValue);
    onChange(monthValue);
    setIsOpen(false);
  };

  const goToPreviousYear = () => {
    setCurrentDate(new Date(currentYear - 1, currentMonth));
  };

  const goToNextYear = () => {
    setCurrentDate(new Date(currentYear + 1, currentMonth));
  };

  const formatDisplayValue = () => {
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      return `${months[parseInt(month) - 1]} ${year}`;
    }
    return 'Select Month';
  };

  const isSelectedMonth = (monthIndex) => {
    if (!selectedMonth) return false;
    const [selectedYear, selectedMonthStr] = selectedMonth.split('-');
    return parseInt(selectedYear) === currentYear && parseInt(selectedMonthStr) - 1 === monthIndex;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
      >
        <span className="text-gray-700">{formatDisplayValue()}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-80 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-4">
            {/* Year Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={goToPreviousYear}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-lg font-semibold text-gray-800">{currentYear}</h3>
              <button
                type="button"
                onClick={goToNextYear}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Month Grid */}
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleMonthSelect(index)}
                  className={`px-3 py-2 text-sm rounded-md font-medium transition-all duration-200 hover:bg-blue-50 ${
                    isSelectedMonth(index)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {month.substring(0, 3)}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-4 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthCalendar;
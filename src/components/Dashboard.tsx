import { useEffect, useState } from 'react';
import { useEntity } from '../hooks/useEntity';
import { tenantEntityConfig } from '../entities/Tenant';
import { Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

type Tenant = {
  id: number;
  first_name: string;
  last_name: string;
  contract_start_date: string;
  contract_end_date: string;
  rent_amount: number;
  apartment_id: number;
  created_at: string;
  updated_at: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  residential_address?: string;
  country_of_residence?: string;
  deposit_amount?: number;
  notes?: string;
};

export default function Dashboard() {
  const { items: tenants, loading } = useEntity<Tenant>(tenantEntityConfig);
  const [stats, setStats] = useState({
    activeAgreements: 0,
    monthlyIncome: 0,
    expiringInSixty: 0,
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (tenants.length === 0) return;

    const today = new Date();
    const sixtyDaysFromNow = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);

    let activeCount = 0;
    let monthlyTotal = 0;
    let expiringCount = 0;

    tenants.forEach((tenant) => {
      const startDate = new Date(tenant.contract_start_date);
      const endDate = new Date(tenant.contract_end_date);

      if (startDate <= today && endDate >= today) {
        activeCount++;
        monthlyTotal += tenant.rent_amount || 0;
      }

      if (endDate > today && endDate <= sixtyDaysFromNow) {
        expiringCount++;
      }
    });

    setStats({
      activeAgreements: activeCount,
      monthlyIncome: monthlyTotal,
      expiringInSixty: expiringCount,
    });
  }, [tenants]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDayEvents = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tenants.filter(
      (tenant) =>
        tenant.contract_start_date.startsWith(dateStr) ||
        tenant.contract_end_date.startsWith(dateStr)
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Active Agreements */}
        <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-bold tracking-wide">ACTIVE AGREEMENTS</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">{stats.activeAgreements}</p>
            </div>
            <div className="p-3 sm:p-4 bg-blue-100 rounded-2xl transform group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-bold tracking-wide">MONTHLY INCOME</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.monthlyIncome.toLocaleString()} PLN</p>
            </div>
            <div className="p-3 sm:p-4 bg-green-100 rounded-2xl transform group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Expiring in 60 Days */}
        <div className={`border-2 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
          stats.expiringInSixty > 0
            ? 'bg-gradient-to-br from-amber-50 to-white border-amber-200'
            : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-bold tracking-wide">EXPIRING IN 60 DAYS</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">{stats.expiringInSixty}</p>
            </div>
            <div className={`p-3 sm:p-4 rounded-2xl transform group-hover:scale-110 transition-transform ${
              stats.expiringInSixty > 0
                ? 'bg-amber-100'
                : 'bg-gray-100'
            }`}>
              <AlertCircle className={`w-6 h-6 sm:w-8 sm:h-8 ${stats.expiringInSixty > 0 ? 'text-amber-600' : 'text-gray-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white border-2 border-gray-200 rounded-3xl p-4 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            Contract Timeline
          </h2>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={handlePrevMonth}
              className="px-3 sm:px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium transition-all hover:bg-gray-200 active:scale-95 transform hover:scale-110"
            >
              ←
            </button>
            <span className="text-gray-700 font-medium text-sm sm:text-base flex-1 sm:flex-none text-center min-w-[150px] sm:min-w-[200px]">{monthName}</span>
            <button
              onClick={handleNextMonth}
              className="px-3 sm:px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium transition-all hover:bg-gray-200 active:scale-95 transform hover:scale-110"
            >
              →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-3 sm:space-y-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-gray-600 text-xs sm:text-sm font-bold py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {/* Days of month */}
            {days.map((day) => {
              const dayEvents = getDayEvents(day);
              const hasEvent = dayEvents.length > 0;

              return (
                <div
                  key={day}
                  className={`aspect-square border-2 rounded-2xl p-1 sm:p-2 flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-110 cursor-pointer ${
                    hasEvent
                      ? 'bg-blue-50 border-blue-400 hover:shadow-lg'
                      : 'bg-white border-gray-300 hover:border-gray-400 hover:shadow-md'
                  }`}
                >
                  <p className="text-gray-900 font-bold text-xs sm:text-sm">{day}</p>
                  {hasEvent && (
                    <div className="mt-0.5 sm:mt-1 flex gap-0.5">
                      {dayEvents.slice(0, 2).map((_, idx) => (
                        <div key={idx} className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full"></div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 flex flex-wrap gap-4 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer hover:scale-105 transition-transform">
            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-300 rounded group-hover:border-gray-500"></div>
            <span className="text-gray-600 text-xs sm:text-sm font-bold group-hover:text-gray-900 transition-colors">No events</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer hover:scale-105 transition-transform">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded group-hover:scale-125 transition-transform"></div>
            <span className="text-gray-600 text-xs sm:text-sm font-bold group-hover:text-gray-900 transition-colors">Contract event</span>
          </div>
        </div>
      </div>
    </div>
  );
}

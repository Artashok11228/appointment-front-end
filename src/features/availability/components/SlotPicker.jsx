/**
 * Presentational slot list for availability options from useServiceAvailability.
 * onSelect receives the full SlotOption (ISO + naive) for later book/reschedule.
 */
export default function SlotPicker({
  options = [],
  selectedIso = null,
  onSelect,
  loading = false,
  error = null,
  empty = false,
  /** True when the selected calendar day is outside Mon–Fri UTC open days. */
  closedDay = false,
  enabled = false,
  disabled = false,
  className = '',
}) {
  if (!enabled) {
    return (
      <p className={`text-xs text-champagne-muted ${className}`}>
        Select a service and date to load available slots.
      </p>
    );
  }

  if (loading) {
    return (
      <p className={`text-xs text-champagne-muted ${className}`}>
        Loading slots…
      </p>
    );
  }

  if (error) {
    return (
      <p className={`text-xs text-red-400 ${className}`} role="alert">
        {error}
      </p>
    );
  }

  if (empty || closedDay) {
    return (
      <p className={`text-xs text-champagne-muted ${className}`}>
        {closedDay
          ? 'Closed day — bookings are Mon–Fri only (UTC). Pick a weekday.'
          : 'No free slots for this day (closed or fully booked).'}
      </p>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${className}`}
      role="listbox"
      aria-label="Available time slots"
    >
      {options.map((option) => {
        const isSelected = option.startsAtIso === selectedIso;
        return (
          <button
            key={option.startsAtIso}
            type="button"
            role="option"
            aria-selected={isSelected}
            disabled={disabled}
            onClick={() => onSelect?.(option)}
            className={`border-2 px-2 py-2 text-xs sm:text-sm font-black tracking-tight transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isSelected
                ? 'border-champagne bg-champagne/15 text-champagne'
                : 'border-[#454545] text-champagne-muted hover:border-champagne hover:text-champagne'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

import  { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux'
import { addRequest } from '../authSlice';


export default function EmployeeLeaveManagementView() {
  const [leaveType, setLeaveType] = useState('');
  const [reason, setReason] = useState('');
  

//USING import { connect } from 'react-redux'
  const dispatch = useDispatch();

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   dispatch(addRequest())
  // }



  // Month navigation view state
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // June 2026
  
  // Date range states
  const [rangeStart, setRangeStart] = useState(new Date(2026, 5, 11)); // Default June 11
  const [rangeEnd, setRangeEnd] = useState(new Date(2026, 5, 12));   // Default June 12

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // 1. Generate Calendar Grid Day Matrix
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); 
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: totalDaysInPrevMonth - i,
        month: currentMonth === 0 ? 11 : currentMonth - 1,
        year: currentMonth === 0 ? currentYear - 1 : currentYear,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      days.push({
        day: d,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const remainingSlots = 42 - days.length;
    for (let n = 1; n <= remainingSlots; n++) {
      days.push({
        day: n,
        month: currentMonth === 11 ? 0 : currentMonth + 1,
        year: currentMonth === 11 ? currentYear + 1 : currentYear,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // 2. Dynamic Day Counter Logic
  const numberOfDays = useMemo(() => {
    if (!rangeStart) return 0;
    if (!rangeEnd) return 1; // Single day selection fallback
    
    const differenceInTime = rangeEnd.getTime() - rangeStart.getTime();
    const differenceInDays = Math.round(differenceInTime / (1000 * 3600 * 24)) + 1;
    
    return differenceInDays > 0 ? differenceInDays : 0;
  }, [rangeStart, rangeEnd]);

  // 3. Click Handler for Range Logic
  const handleDateClick = (dayObj) => {
    const clickedDate = new Date(dayObj.year, dayObj.month, dayObj.day);

    if (!rangeStart || (rangeStart && rangeEnd)) {
      // First click or resetting range selection
      setRangeStart(clickedDate);
      setRangeEnd(null);
    } else if (rangeStart && !rangeEnd) {
      // Second click: If clicked date is before start date, swap them
      if (clickedDate < rangeStart) {
        setRangeEnd(rangeStart);
        setRangeStart(clickedDate);
      } else {
        setRangeEnd(clickedDate);
      }
    }
  };

  // Helper formatting checkers
  const getTimestamp = (date) => (date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() : null);

  const isDateSelected = (dayObj) => {
    const targetTime = new Date(dayObj.year, dayObj.month, dayObj.day).getTime();
    const startTime = getTimestamp(rangeStart);
    const endTime = getTimestamp(rangeEnd);

    if (startTime && endTime) {
      return targetTime >= startTime && targetTime <= endTime;
    }
    return targetTime === startTime;
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const formatDateLabel = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!leaveType || !rangeStart) {
      alert("Please select a leave type and date range.");
      return;
    }

    // Pass form state into your Redux dispatch payload
    dispatch(addRequest({
      leaveType,
      reason,
      startDate: rangeStart.toISOString(),
      endDate: rangeEnd ? rangeEnd.toISOString() : rangeStart.toISOString(),
      days: numberOfDays
    }));

    setLeaveType("")
    setReason("")
    setCurrentDate(new Date(2026, 5, 1))
    setRangeStart(new Date(2026, 5, 11))
    setRangeEnd(new Date(2026,5,12))
  };



  return (
    <div className="min-h-screen bg-[#111318] text-[#e2e8f0] p-8 flex justify-center items-start font-sans w-full">
      <div className="w-full max-w-[720px] bg-[#161920] border border-[#222733] rounded-xl p-6 shadow-2xl">
        
        <h2 className="text-2xl font-semibold text-white mb-6 tracking-wide">
          Apply for Leave
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {/* Select Leave Type */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-400">Select Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full bg-[#1c202c] border border-[#2b3244] focus:border-[#1d6fd2] rounded-lg px-4 py-2.5 text-sm text-gray-200 outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled>Select Leave Type</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Casual Leave">Casual Leave</option>
            </select>
          </div>

          {/* Select Dates Component */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-400">Select Dates (Click Start & End Date)</label>
            
            <div className="flex items-start gap-4 flex-wrap relative">
              <div className="w-full max-w-[340px] bg-[#1c202c] border border-[#2b3244] rounded-lg p-3">
                
                {/* Header Controls */}
                <div className="flex justify-between items-center mb-3 px-1">
                  <button type="button" onClick={handlePrevMonth} className="text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#252b3b]">&lt;</button>
                  <span className="text-xs font-semibold text-gray-200">{monthNames[currentMonth]} {currentYear}</span>
                  <button type="button" onClick={handleNextMonth} className="text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#252b3b]">&gt;</button>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 text-center gap-y-1 mb-1">
                  {weekDays.map((wd, index) => (
                    <span key={wd} className={`text-[10px] font-medium ${index === 0 || index === 6 ? 'text-red-500/80' : 'text-gray-500'}`}>{wd}</span>
                  ))}
                </div>

                {/* Dynamic Grid Mapping */}
                <div className="grid grid-cols-7 text-center gap-1">
                  {calendarDays.map((item, idx) => {
                    const isSelected = isDateSelected(item);
                    const dayOfWeek = new Date(item.year, item.month, item.day).getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                    let styleClasses = "text-xs py-1.5 rounded transition-all cursor-pointer ";
                    
                    if (isSelected) {
                      styleClasses += "bg-[#1d6fd2] text-white font-semibold";
                    } else if (!item.isCurrentMonth) {
                      styleClasses += "text-gray-600";
                    } else if (isWeekend) {
                      styleClasses += "text-red-400/70 bg-red-950/10 hover:bg-red-950/30";
                    } else {
                      styleClasses += "text-gray-400 hover:bg-[#252b3b]";
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleDateClick(item)}
                        className={styleClasses}
                      >
                        {item.day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Range Label / Tooltip */}
              {rangeStart && (
                <div className="self-center flex items-center relative md:mt-0 mt-2">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-[#2c3242] absolute left-[-8px]"></div>
                  <div className="bg-[#2c3242] text-xs text-gray-200 py-2 px-3 rounded-md shadow-lg border border-[#373e52] whitespace-nowrap">
                    {leaveType || "Leave Type"}, {numberOfDays} {numberOfDays === 1 ? 'Day' : 'Days'},{' '}
                    {formatDateLabel(rangeStart)}
                    {rangeEnd && ` - ${formatDateLabel(rangeEnd)}`}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Combined Dynamic Number of Days Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-400">Number of Days</label>
            <input
              type="text"
              readOnly
              value={numberOfDays.toFixed(1)}
              className="w-full bg-[#1c202c] border border-[#2b3244] rounded-lg px-4 py-2.5 text-sm text-gray-400 outline-none cursor-not-allowed"
            />
          </div>

          {/* Reason text box */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-400">Reason</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional note..."
              className="w-full bg-[#1c202c] border border-[#2b3244] focus:border-[#1d6fd2] rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none resize-none transition-all"
            />
          </div>

          {/* Submission and Action Bar Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button type='submit' className="bg-[#1d6fd2] hover:bg-[#1a65c0] text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-all ">
              Submit Leave Request
            </button>
            <button 
              type="button" 
              onClick={() => { setReason(''); setLeaveType(''); setRangeStart(null); setRangeEnd(null); }}
              className="bg-transparent border border-[#2b3244] hover:bg-[#222838] text-gray-300 font-medium text-sm px-5 py-2.5 rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
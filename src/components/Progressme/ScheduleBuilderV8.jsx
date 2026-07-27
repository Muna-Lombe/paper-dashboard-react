import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { api } from "../../api";
import { useDispatch } from "react-redux";
import { addError} from "../../variables/slices/errorSlice"; // Assuming addSuccess is available
import { endpoints } from '../../config';
import { addToast } from '../../variables/slices/toastSlice';

// import { endpoints } from "../config";
// endpoints

// Months and Days Mapping
const languages = {
  en: {
    months: [
      "September",
      "October",
      "November",
      "December",
      "January",
      "February",
      "March",
      "April",
      "May",
    ],
    labels: {
      newSchedule: "Create new schedule",
      lessonSettings: "Lesson and Holiday Settings",
      daysForLessons: "Days for Lessons",
      holidays: "Holidays or Breaks",
      lessonsOnHolidays: "Lessons on Holidays",
      weekends: "Select Weekends",
      selectAll: "Select All Months",
      addButton: "Add to Schedule",
      exportButton: "Export as Image",
      scheduleTable: "Schedule Table",
      exportSchedule: "Export Schedule",
      toggleLanguage: "Switch to Russian",
      legendTitle: "Legend",
      totalLessons: "Total Lessons",
      grandTotalLessons: "Grand Total Lessons",
      wednesdaySchedule: "Wednesday Schedule",
      lessonDay: "Lesson Day",
      holiday: "Holiday",
      lessonOnHoliday: "Lesson on Holiday",
      makeRecurring: "Make Recurring",
      addToSchedule: "Add to Schedule",
    },
    tooltips: {
      daysForLessons:
        "Enter lesson days as numbers or days of the week (comma separated). Example: 1, 8, Monday, Wednesday",
      holidays:
        "Enter holidays or break days as numbers (comma separated). Example: 5, 12, 19",
      lessonsOnHolidays:
        "Enter lesson days during holidays as numbers (comma separated). Example: 3, 10, 17",
    },
  },
  ru: {
    months: [
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
    ],
    labels: {
      newSchedule: "создать новое расписание",
      lessonSettings: "Настройки занятий и праздников",
      daysForLessons: "Дни занятий",
      holidays: "Праздники или перерывы",
      lessonsOnHolidays: "Занятия на каникулах",
      weekends: "Выбрать выходные",
      selectAll: "Выбрать все месяцы",
      addButton: "Добавить в расписание",
      exportButton: "Экспорт в изображение",
      scheduleTable: "Расписание занятий",
      exportSchedule: "Экспорт расписания",
      toggleLanguage: "Переключить на английский",
      legendTitle: "Легенда",
      totalLessons: "Итого занятий",
      grandTotalLessons: "Итого уроков",
      wednesdaySchedule: "Расписание занятий",
      lessonDay: "День занятия",
      holiday: "Праздник",
      lessonOnHoliday: "Занятие на празднике",
      makeRecurring: "Сделать повторяющимся",
      addToSchedule: "Добавить в расписание",
    },
    tooltips: {
      daysForLessons:
        "Введите дни занятий в виде чисел или дней недели (через запятую). Пример: 1, 8, Понедельник, Среда",
      holidays:
        "Введите дни праздников или перерывов в виде чисел (через запятую). Пример: 5, 12, 19",
      lessonsOnHolidays:
        "Введите дни занятий во время праздников в виде чисел (через запятую). Пример: 3, 10, 17",
    },
  },
};

const ScheduleBuilder = () => {
  const dispatch = useDispatch();
  // States for settings and table
  const [language, setLanguage] = useState("ru");
  const [lessonDaysInput, setLessonDaysInput] = useState("");
  const [holidayDaysInput, setHolidayDaysInput] = useState("");
  const [holidayLessonsInput, setHolidayLessonsInput] = useState("");
  const [lessonDays, setLessonDays] = useState({});
  const [holidayDays, setHolidayDays] = useState({});
  const [holidayLessons, setHolidayLessons] = useState({});
  const [selectedMonths, setSelectedMonths] = useState(
    Array(languages[language].months.length).fill(true)
  );
  const [selectAll, setSelectAll] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState({});
  const [currentCell, setCurrentCell] = useState(null);
  const [selectedDayType, setSelectedDayType] = useState('lesson');
  const [makeRecurring, setMakeRecurring] = useState(false);

  // New state variables for dropdown selected days
  // Removed individual selectedDayForX states
  const [selectedCategory, setSelectedCategory] = useState(''); // To select which type of days to add
  const [tempSelectedDays, setTempSelectedDays] = useState({
    lessonDays:[],
    holidayDays:[],
    holidayLessons:[]
  }); // For checkboxes in the multi-select

  const daysOfWeekOptions = [
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
  ];

  // Predefined months and years
  const currentYear = new Date().getFullYear();
  const monthsData = [
    { name: languages[language].months[0], month: 8, year: currentYear }, // September
    { name: languages[language].months[1], month: 9, year: currentYear }, // October
    { name: languages[language].months[2], month: 10, year: currentYear }, // November
    { name: languages[language].months[3], month: 11, year: currentYear }, // December
    { name: languages[language].months[4], month: 0, year: currentYear + 1 }, // January
    { name: languages[language].months[5], month: 1, year: currentYear + 1 }, // February
    { name: languages[language].months[6], month: 2, year: currentYear + 1 }, // March
    { name: languages[language].months[7], month: 3, year: currentYear + 1 }, // April
    { name: languages[language].length > 8 ? languages[language].months[8] : "May", month: 4, year: currentYear + 1 }, // May (Safeguard for missing May in smaller language arrays)
  ];

  useEffect(() => {
    fetchSchedule();
  }, []);

  useEffect(() => {
    const hasOpenPopover = Object.values(popoverOpen).some(Boolean);
    if (!hasOpenPopover) return undefined;

    const closePopovers = () => {
      setPopoverOpen({});
      setCurrentCell(null);
    };

    const onPointerDown = (event) => {
      if (event.target.closest("[data-schedule-popover]") || event.target.closest("[data-schedule-cell]")) {
        return;
      }
      closePopovers();
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") closePopovers();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [popoverOpen]);

  const clearSchedule = async () => {
    setTempSelectedDays({
      lessonDays: [],
      holidayDays: [],
      holidayLessons: []
    })
    setLessonDays( {});
    setHolidayDays({});
    setHolidayLessons({});
    setSelectedMonths([]);
    setSelectAll(false);

    
  }
  const fetchSchedule = async () => {
    try {
      const response = await api.get(endpoints.schedule.get.url);
      if (response.data && response.data.scheduleData) {
        const { lessonDays, holidayDays, holidayLessons, selectedMonths, selectAll, language } = response.data.scheduleData;
        setLessonDays(lessonDays || {});
        setHolidayDays(holidayDays || {});
        setHolidayLessons(holidayLessons || {});
        setSelectedMonths(selectedMonths || Array(languages[language].months.length).fill(true));
        setSelectAll(selectAll !== undefined ? selectAll : true);
        setLanguage(language || "ru");
      }
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to fetch schedule."));
    }
  };

  const saveSchedule = async () => {
    try {
      const scheduleData = {
        lessonDays,
        holidayDays,
        holidayLessons,
        selectedMonths,
        selectAll,
        language,
      };
      const response = await api.post(endpoints.schedule.save.url, scheduleData);
      dispatch(addToast(response.data.message || "Schedule saved successfully!"));
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to save schedule."));
    }
  };

  // Toggle Language
  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ru" : "en";
    setLanguage(newLanguage);
    setSelectedMonths(Array(languages[newLanguage].months.length).fill(true));
    setSelectAll(true);
  };

  // Toggle selection for all months
  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedMonths(selectedMonths.map(() => !selectAll));
  };

  // Toggle individual month selection
  const toggleMonth = (index) => {
    const updatedMonths = [...selectedMonths];
    updatedMonths[index] = !updatedMonths[index];
    setSelectedMonths(updatedMonths);
    setSelectAll(updatedMonths.every(Boolean));
  };

  // Export the table to an image
  const exportToImage = () => {
    html2canvas(document.querySelector("#schedule-table")).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "schedule.png";
      link.click();
    });
  };

  // Helper function to get all days for a specific weekday in a month
  function getDaysInMonth(year, month, weekday) {
    const days = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      if (date.getDay() === weekday) {
        days.push(date.getDate());
      }
      date.setDate(date.getDate() + 1);
    }
    return days;
  }

  // Function to get day of week index from name (still needed for cell click recurring)
  const getDayOfWeekIndex = (dayName) => {
    const daysOfWeekEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const daysOfWeekRu = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    const indexEn = daysOfWeekEn.findIndex(
      (day) => day.toLowerCase() === dayName.toLowerCase()
    );
    const indexRu = daysOfWeekRu.findIndex(
      (day) => day.toLowerCase() === dayName.toLowerCase()
    );
    return indexEn !== -1 ? indexEn : indexRu;
  };

  // Add Days to Schedule using selected days from dropdowns/checkboxes
  const handleAddDaysToSchedule = () => {
    if (tempSelectedDays.length === 0 || !selectedCategory) {
      dispatch(addError("Please select a category and at least one day."));
      return;
    }

    const selectedDayIndices = tempSelectedDays[selectedCategory].map(Number);

    const updateSchedule = (currentSchedule, setSchedule) => {
      const updatedSchedule = { ...currentSchedule };
      monthsData.forEach((monthData, monthIndex) => {
        selectedDayIndices.forEach(dayOfWeek => {
          const daysInMonthForWeekday = getDaysInMonth(monthData.year, monthData.month, dayOfWeek);
          updatedSchedule[monthIndex] = [...new Set([...(updatedSchedule[monthIndex] || []), ...daysInMonthForWeekday])];
        });
      });
      setSchedule(updatedSchedule);
    };

    switch (selectedCategory) {
      case 'lessonDays':
        updateSchedule(lessonDays, setLessonDays);
        break;
      case 'holidayDays':
        updateSchedule(holidayDays, setHolidayDays);
        break;
      case 'holidayLessons':
        updateSchedule(holidayLessons, setHolidayLessons);
        break;
      default:
        break;
    }

    // setTempSelectedDays({
    //   lessonDays: [],
    //   holidayDays: [],
    //   holidayLessons: []
    // }) // Clear temporary selections
    setSelectedCategory(''); // Clear category selection after adding
  };

  // Handle cell click to toggle popover (click same cell again to dismiss)
  const handleCellClick = (e, monthIndex, day) => {
    e.stopPropagation();
    const cellId = `cell-${monthIndex}-${day}`;
    const isOpen = !!popoverOpen[cellId];

    if (isOpen) {
      setPopoverOpen({});
      setCurrentCell(null);
      return;
    }

    setCurrentCell({ monthIndex, day });
    setPopoverOpen({ [cellId]: true });
    setSelectedDayType("lesson");
    setMakeRecurring(false);
  };

  const closePopover = (e) => {
    e?.stopPropagation();
    setPopoverOpen({});
    setCurrentCell(null);
  };

  // Add day from cell menu
  const addDayFromCell = () => {
    const { monthIndex, day } = currentCell;
    if (selectedDayType === 'lesson') {
      // Add to lessonDays
      const updatedLessonDays = { ...lessonDays };
      if (makeRecurring) {
        // Get day of week
        const date = new Date(monthsData[monthIndex].year, monthsData[monthIndex].month, day);
        const dayOfWeek = date.getDay();
        monthsData.forEach((monthData, index) => {
          const days = getDaysInMonth(monthData.year, monthData.month, dayOfWeek);
          updatedLessonDays[index] = [...new Set([...(updatedLessonDays[index] || []), ...days])];
        });
      } else {
        updatedLessonDays[monthIndex] = [...new Set([...(updatedLessonDays[monthIndex] || []), day])];
      }
      setLessonDays(updatedLessonDays);
    } else if (selectedDayType === 'holiday') {
      // Add to holidayDays
      const updatedHolidayDays = { ...holidayDays };
      if (makeRecurring) {
        // Get day of week
        const date = new Date(monthsData[monthIndex].year, monthsData[monthIndex].month, day);
        const dayOfWeek = date.getDay();
        monthsData.forEach((monthData, index) => {
          const days = getDaysInMonth(monthData.year, monthData.month, dayOfWeek);
          updatedHolidayDays[index] = [...new Set([...(updatedHolidayDays[index] || []), ...days])];
        });
      } else {
        updatedHolidayDays[monthIndex] = [...new Set([...(updatedHolidayDays[monthIndex] || []), day])];
      }
      setHolidayDays(updatedHolidayDays);
    } else if (selectedDayType === 'holidayLesson') {
      // Add to holidayLessons
      const updatedHolidayLessons = { ...holidayLessons };
      if (makeRecurring) {
        // Get day of week
        const date = new Date(monthsData[monthIndex].year, monthsData[monthIndex].month, day);
        const dayOfWeek = date.getDay();
        monthsData.forEach((monthData, index) => {
          const days = getDaysInMonth(monthData.year, monthData.month, dayOfWeek);
          updatedHolidayLessons[index] = [...new Set([...(updatedHolidayLessons[index] || []), ...days])];
        });
      } else {
        updatedHolidayLessons[monthIndex] = [...new Set([...(updatedHolidayLessons[monthIndex] || []), day])];
      }
      setHolidayLessons(updatedHolidayLessons);
    }
    setPopoverOpen({});
    setCurrentCell(null);
  };

  // Helper function to dynamically determine the color class for each cell
  const getCellClass = (monthIndex, day) => {
    const daysInMonth = new Date(
      monthsData[monthIndex].year,
      monthsData[monthIndex].month + 1,
      0
    ).getDate();

    if (day > daysInMonth) {
      return "bg-gray-200 cursor-not-allowed"; // Tailwind classes for invalid day
    }

    const isHolidayLesson = (holidayLessons[monthIndex] || []).includes(day);
    const isHoliday = (holidayDays[monthIndex] || []).includes(day);
    const isLesson = (lessonDays[monthIndex] || []).includes(day);

    if (isHolidayLesson) return "bg-yellow-400"; // Tailwind class for holiday lesson
    if (isHoliday) return "bg-red-500"; // Tailwind class for holiday
    if (isLesson) return "bg-gray-400"; // Tailwind class for lesson
    return "";
  };

  const currentLabels = languages[language].labels;
  const currentTooltips = languages[language].tooltips;

  // Function to calculate total lessons per month
  const calculateTotalLessons = (monthIndex) => {
    const lessons = new Set([
      ...(lessonDays[monthIndex] || []),
      ...(holidayLessons[monthIndex] || []),
    ]);
    const holidaysOnLessonDays = (holidayDays[monthIndex] || []).filter((day) =>
      (lessonDays[monthIndex] || []).includes(day)
    );
    holidaysOnLessonDays.forEach((day) => lessons.delete(day));
    return lessons.size;
  };

  // Calculate grand total lessons
  const grandTotalLessons = monthsData.reduce(
    (acc, _, monthIndex) => acc + calculateTotalLessons(monthIndex),
    0
  );

  return (
    <div className="pd-page pd-page-wide">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="pd-title">{currentLabels.wednesdaySchedule}</h1>
          <p className="pd-subtitle">
            Mark lesson days, holidays, and holiday lessons across the school year.
          </p>
        </div>
        <button type="button" className="pd-btn pd-btn-ghost" onClick={toggleLanguage}>
          {currentLabels.toggleLanguage}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        <aside className="pd-panel h-fit p-4 lg:sticky lg:top-3">
          <h2 className="pd-display text-base font-bold">
            {currentLabels.lessonSettings}
          </h2>
          <form id="schedule-properties" className="mt-4 space-y-4">
            <div>
              <label htmlFor="selectedCategory" className="pd-label">
                Select category
              </label>
              <select
                id="selectedCategory"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pd-input"
              >
                <option value="">Select a category</option>
                <option value="lessonDays">{currentLabels.daysForLessons}</option>
                <option value="holidayDays">{currentLabels.holidays}</option>
                <option value="holidayLessons">{currentLabels.lessonsOnHolidays}</option>
              </select>
            </div>

            {selectedCategory && (
              <div className="rounded-[10px] border border-[var(--pd-border)] bg-[color-mix(in_srgb,var(--pd-canvas-end)_80%,white)] p-3">
                <p className="pd-label mb-2">Select days</p>
                <div className="grid grid-cols-2 gap-2">
                  {daysOfWeekOptions.map((option) => (
                    <label key={option.value} className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={tempSelectedDays[selectedCategory]?.includes(option.value)}
                        onChange={(e) => {
                          const { value, checked } = e.target;
                          setTempSelectedDays((prev) => {
                            checked
                              ? prev[selectedCategory].push(value)
                              : prev[selectedCategory]?.filter((day) => day !== value);
                            return { ...prev };
                          });
                        }}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  className="pd-btn pd-btn-primary mt-3 w-full"
                  onClick={handleAddDaysToSchedule}
                >
                  {currentLabels.addButton}
                </button>
              </div>
            )}

            <button type="button" className="pd-btn pd-btn-primary w-full" onClick={saveSchedule}>
              Save Schedule
            </button>
          </form>
        </aside>

        <section className="pd-panel overflow-hidden" id="schedule-table">
          <div className="flex flex-col gap-3 border-b border-[var(--pd-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
              <div className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-sm bg-[var(--pd-muted)]" />
                <span>{currentLabels.daysForLessons}</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-sm bg-[var(--pd-danger)]" />
                <span>{currentLabels.holidays}</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-sm bg-[var(--pd-warn)]" />
                <span>{currentLabels.lessonsOnHolidays}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="pd-btn pd-btn-ghost" onClick={clearSchedule} title={currentLabels.newSchedule}>
                <i className="fas fa-plus" />
                <span className="hidden sm:inline">New</span>
              </button>
              <button type="button" className="pd-btn pd-btn-primary" onClick={exportToImage}>
                <i className="fas fa-file-export" />
                <span>{currentLabels.exportButton}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto p-2 sm:p-3">
            <table className="w-full min-w-[920px] border-collapse text-center text-xs sm:text-sm">
              <thead>
                <tr className="bg-[color-mix(in_srgb,var(--pd-canvas-end)_85%,white)]">
                  <th className="sticky left-0 z-10 border border-[var(--pd-border)] bg-[color-mix(in_srgb,var(--pd-canvas-end)_95%,white)] px-2 py-2 text-left font-semibold">
                    Month
                  </th>
                  {Array.from({ length: 31 }, (_, i) => (
                    <th key={i} className="border border-[var(--pd-border)] px-1 py-2 font-semibold text-[var(--pd-muted)]">
                      {i + 1}
                    </th>
                  ))}
                  <th className="border border-[var(--pd-border)] px-2 py-2 font-semibold">
                    {currentLabels.totalLessons}
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthsData.map((monthData, monthIndex) => (
                  <tr key={monthIndex}>
                    <td className="sticky left-0 z-10 border border-[var(--pd-border)] bg-[var(--pd-surface)] px-2 py-1.5 text-left font-medium whitespace-nowrap">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedMonths[monthIndex]}
                          onChange={() => toggleMonth(monthIndex)}
                        />
                        {monthData.name}
                      </label>
                    </td>
                    {Array.from({ length: 31 }, (_, dayIndex) => {
                      const day = dayIndex + 1;
                      const cellId = `cell-${monthIndex}-${day}`;
                      const isHighlighted = selectedMonths[monthIndex];
                      const cellClass = getCellClass(monthIndex, day);
                      const daysInMonth = new Date(
                        monthData.year,
                        monthData.month + 1,
                        0
                      ).getDate();
                      const isInvalidDay = day > daysInMonth;

                      return (
                        <td
                          key={dayIndex}
                          id={cellId}
                          data-schedule-cell={cellId}
                          className={`relative h-8 cursor-pointer border border-[var(--pd-border)] px-0.5 py-0.5 ${
                            isHighlighted ? cellClass : ""
                          } ${isInvalidDay ? "bg-[color-mix(in_srgb,var(--pd-muted)_12%,white)]" : ""}`}
                          onClick={
                            !isInvalidDay
                              ? (e) => handleCellClick(e, monthIndex, day)
                              : undefined
                          }
                        >
                          {isInvalidDay ? (
                            <div className="pointer-events-none absolute inset-0 bg-[color-mix(in_srgb,var(--pd-muted)_18%,transparent)]" />
                          ) : (
                            isHighlighted && cellClass && (
                              <span className="text-[10px] font-bold uppercase">x</span>
                            )
                          )}
                          {!isInvalidDay && popoverOpen[cellId] && (
                            <div
                              data-schedule-popover
                              className="absolute left-0 top-full z-20 mt-1 w-52 rounded-[10px] border border-[var(--pd-border)] bg-[var(--pd-surface)] p-3 text-left"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-[var(--pd-muted)]">
                                  Day {day}
                                </p>
                                <button
                                  type="button"
                                  className="pd-btn pd-btn-ghost px-2 py-1 text-xs"
                                  onClick={closePopover}
                                  aria-label="Close"
                                >
                                  <i className="fas fa-times" />
                                </button>
                              </div>
                              <div className="mb-2">
                                <label className="inline-flex items-center gap-2 text-sm">
                                  <input
                                    type="radio"
                                    name={`dayType-${monthIndex}-${day}`}
                                    value="lesson"
                                    checked={selectedDayType === "lesson"}
                                    onChange={(e) => setSelectedDayType(e.target.value)}
                                  />
                                  <span>{currentLabels.lessonDay}</span>
                                </label>
                              </div>
                              <div className="mb-2">
                                <label className="inline-flex items-center gap-2 text-sm">
                                  <input
                                    type="radio"
                                    name={`dayType-${monthIndex}-${day}`}
                                    value="holiday"
                                    checked={selectedDayType === "holiday"}
                                    onChange={(e) => setSelectedDayType(e.target.value)}
                                  />
                                  <span>{currentLabels.holiday}</span>
                                </label>
                              </div>
                              <div className="mb-2">
                                <label className="inline-flex items-center gap-2 text-sm">
                                  <input
                                    type="radio"
                                    name={`dayType-${monthIndex}-${day}`}
                                    value="holidayLesson"
                                    checked={selectedDayType === "holidayLesson"}
                                    onChange={(e) => setSelectedDayType(e.target.value)}
                                  />
                                  <span>{currentLabels.lessonOnHoliday}</span>
                                </label>
                              </div>
                              <label className="mt-1 inline-flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={makeRecurring}
                                  onChange={(e) => setMakeRecurring(e.target.checked)}
                                />
                                <span>{currentLabels.makeRecurring}</span>
                              </label>
                              <button
                                type="button"
                                className="pd-btn pd-btn-primary mt-3 w-full"
                                onClick={addDayFromCell}
                              >
                                {currentLabels.addToSchedule}
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="border border-[var(--pd-border)] px-2 py-1.5 font-semibold">
                      {calculateTotalLessons(monthIndex)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={32}
                    className="border border-[var(--pd-border)] px-3 py-2.5 text-right font-bold"
                  >
                    {currentLabels.grandTotalLessons}: {grandTotalLessons}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ScheduleBuilder;

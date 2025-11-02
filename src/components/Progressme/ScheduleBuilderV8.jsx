import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import axios from "axios";
axios.defaults.withCredentials = true;
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
      const response = await axios.get(endpoints.schedule.get.url);
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
      const response = await axios.post(endpoints.schedule.save.url, scheduleData);
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

  // Handle cell click to open popover
  const handleCellClick = (e, monthIndex, day) => {
    setCurrentCell({ monthIndex, day });
    setPopoverOpen({ ...popoverOpen, [`cell-${monthIndex}-${day}`]: true });
    setSelectedDayType('lesson');
    setMakeRecurring(false);
  };

  // Toggle popover
  const togglePopover = (monthIndex, day) => {
    setPopoverOpen({
      ...popoverOpen,
      [`cell-${monthIndex}-${day}`]: !popoverOpen[`cell-${monthIndex}-${day}`],
    });
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
    <div className="flex flex-col">
      <div className="w-full flex flex-row">
        {/* Left Sidebar */}
        <div className="p-3 border-r min-w-[225px] w-2/12">
          <button className="text-blue-500 hover:underline" onClick={toggleLanguage}>
            {currentLabels.toggleLanguage}
          </button>
          <h5 className="text-lg font-semibold mt-4">{currentLabels.lessonSettings}</h5>
          <form id="schedule-properties" className="space-y-4 mt-4"> {/* Wrapped in a form */}
            <div className="mb-4">
              <label htmlFor="selectedCategory" className="block text-gray-700 text-sm font-bold mb-2">
                Select Category:
              </label>
              <select
                id="selectedCategory"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                   // Clear selected days when category changes
                }}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Select a category</option>
                <option value="lessonDays">{currentLabels.daysForLessons}</option>
                <option value="holidayDays">{currentLabels.holidays}</option>
                <option value="holidayLessons">{currentLabels.lessonsOnHolidays}</option>
              </select>
            </div>

            {selectedCategory && (
              <div className="mb-4 p-3 border rounded shadow-sm bg-gray-50">
                <p className="block text-gray-700 text-sm font-bold mb-2">Select Days:</p>
                <div className="grid grid-cols-2 gap-2 truncate">
                  {daysOfWeekOptions.map(option => (
                    <label key={option.value} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={tempSelectedDays[selectedCategory]?.includes(option.value)}
                        onChange={(e) => {
                          const { value, checked } = e.target;
                          setTempSelectedDays(prev =>{
                            checked ? 
                            prev[selectedCategory].push(value) : prev[selectedCategory]?.filter(day => day !== value)
                            return {...prev}

                          }
                          );
                        }}
                        className="form-checkbox"
                      />
                      <span className="ml-2">{option.label}</span>
                    </label>
                  ))}
                </div>
                <button type="button" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-3 w-full" onClick={handleAddDaysToSchedule}>
                  {currentLabels.addButton}
                </button>
              </div>
            )}

            {/* // Display selected days for each category
            {Object.entries(lessonDays).some(([, days]) => days.length > 0) && (
              <div className="mt-4 text-sm text-gray-600 border p-2 rounded bg-blue-50">
                <p className="font-bold">{currentLabels.daysForLessons}:</p>
                {Object.entries(lessonDays).map(([monthIndex, days]) => (
                  days.length > 0 && (
                    <p key={monthIndex} className="mb-1">{monthsData[monthIndex].name}: {days.sort((a, b) => a - b).join(', ')}</p>
                  )
                ))}
              </div>
            )}

            {Object.entries(holidayDays).some(([, days]) => days.length > 0) && (
              <div className="mt-4 text-sm text-gray-600 border p-2 rounded bg-red-50">
                <p className="font-bold">{currentLabels.holidays}:</p>
                {Object.entries(holidayDays).map(([monthIndex, days]) => (
                  days.length > 0 && (
                    <p key={monthIndex} className="mb-1">{monthsData[monthIndex].name}: {days.sort((a, b) => a - b).join(', ')}</p>
                  )
                ))}
              </div>
            )}

            {Object.entries(holidayLessons).some(([, days]) => days.length > 0) && (
              <div className="mt-4 text-sm text-gray-600 border p-2 rounded bg-yellow-50">
                <p className="font-bold">{currentLabels.lessonsOnHolidays}:</p>
                {Object.entries(holidayLessons).map(([monthIndex, days]) => (
                  days.length > 0 && (
                    <p key={monthIndex} className="mb-1">{monthsData[monthIndex].name}: {days.sort((a, b) => a - b).join(', ')}</p>
                  )
                ))}
              </div>
            )} */}

            <div className="mt-6">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded w-full"
                onClick={saveSchedule}
              >
                Save Schedule
              </button>
            </div>
          </form>
        </div>

        {/* Schedule Table */}
        <div className="flex-grow p-3 w-10/12 overflow-x-hidden " id="schedule-table">

          <h5 className="text-lg font-semibold mb-4">{currentLabels.wednesdaySchedule}</h5>
          <div className="p-3 w-full flex justify-between items-baseline">
            {/* Legend */}
            <div className="flex flex-wrap">
              <div className="flex items-center mb-2 mr-4">
                <div className="w-5 h-5 border border-black mr-2 bg-gray-400"></div>
                <span>{currentLabels.daysForLessons}</span>
              </div>
              <div className="flex items-center mb-2 mr-4">
                <div className="w-5 h-5 border border-black mr-2 bg-red-500"></div>
                <span>{currentLabels.holidays}</span>
              </div>
              <div className="flex items-center mb-2">
                <div className="w-5 h-5 border border-black mr-2 bg-yellow-400"></div>
                <span>{currentLabels.lessonsOnHolidays}</span>
              </div>
            </div>
            <div className="flex gap-1 flex-row">
              <button className="max-w-16 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"  onClick={clearSchedule}>
                <i className='fas fa-plus mr-2' />
                {/* <span>
                  {currentLabels.newSchedule}
                </span> */}
              </button>
              <button className="max-w-36 bg-gray-500 hover:bg-gray-300 text-white font-bold py-2 px-4 rounded truncate" onClick={exportToImage}>
                <i className='fas fa-file-export mr-2'/>
                <span>
                  {currentLabels.exportButton}
                </span>
              </button>

            </div>
          </div>
          {/* Legend */}
          {/* <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <h5 className="text-lg font-semibold mb-2">{currentLabels.legendTitle}</h5>
            
          </div> */}
          <div className="w-full overflow-x-scroll">
            <table className="table-auto w-full border-collapse border border-gray-400"> {/* Replaced Table */}
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 border border-gray-400"></th>
                  {Array.from({ length: 31 }, (_, i) => (
                    <th key={i} className="px-4 py-2 border border-gray-400">{i + 1}</th>
                  ))}
                  <th className="px-4 py-2 border border-gray-400">{currentLabels.totalLessons}</th>
                </tr>
              </thead>
              <tbody>
                {monthsData.map((monthData, monthIndex) => (
                  <tr key={monthIndex}>
                    <td className="px-4 py-2 border border-gray-400">
                      <input
                        type="checkbox"
                        checked={selectedMonths[monthIndex]}
                        onChange={() => toggleMonth(monthIndex)}
                        className="mr-2"
                      />
                      {monthData.name}
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
                          className={`relative cursor-pointer px-4 py-2 border border-gray-400 ${isHighlighted ? cellClass : ""} ${isInvalidDay ? "bg-gray-200" : ""}`} // Updated classes
                          onClick={
                            !isInvalidDay
                              ? (e) => handleCellClick(e, monthIndex, day)
                              : undefined
                          }
                        >
                          {isInvalidDay ? (
                            <div className="absolute inset-0 bg-gray-600 opacity-20 pointer-events-none transform -skew-y-12"></div> // Replaced invalid-day-overlay
                          ) : (
                            isHighlighted && cellClass && "x"
                          )}
                          {!isInvalidDay && (
                            <div // Replaced UncontrolledPopover
                              className={`absolute z-10 bg-white shadow-lg rounded-lg p-4 ${popoverOpen[cellId] ? "block" : "hidden"}`}
                              style={{ minWidth: "200px" }}
                            >
                              <div className="mb-2"> {/* Replaced FormGroup */}
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    name={`dayType-${monthIndex}-${day}`}
                                    value="lesson"
                                    checked={selectedDayType === 'lesson'}
                                    onChange={(e) => setSelectedDayType(e.target.value)}
                                    className="form-radio"
                                  />
                                  <span className="ml-2">{currentLabels.lessonDay}</span>
                                </label>
                              </div>
                              <div className="mb-2"> {/* Replaced FormGroup */}
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    name={`dayType-${monthIndex}-${day}`}
                                    value="holiday"
                                    checked={selectedDayType === 'holiday'}
                                    onChange={(e) => setSelectedDayType(e.target.value)}
                                    className="form-radio"
                                  />
                                  <span className="ml-2">{currentLabels.holiday}</span>
                                </label>
                              </div>
                              <div className="mb-2"> {/* Replaced FormGroup */}
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    name={`dayType-${monthIndex}-${day}`}
                                    value="holidayLesson"
                                    checked={selectedDayType === 'holidayLesson'}
                                    onChange={(e) => setSelectedDayType(e.target.value)}
                                    className="form-radio"
                                  />
                                  <span className="ml-2">{currentLabels.lessonOnHoliday}</span>
                                </label>
                              </div>
                              <label className="inline-flex items-center mt-2"> {/* Replaced FormGroup check */}
                                <input
                                  type="checkbox"
                                  checked={makeRecurring}
                                  onChange={(e) => setMakeRecurring(e.target.checked)}
                                  className="form-checkbox"
                                />{" "}
                                <span className="ml-2">
                                  {currentLabels.makeRecurring}
                                </span>
                              </label>
                              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2" onClick={addDayFromCell}>
                                {currentLabels.addToSchedule}
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2 border border-gray-400">{calculateTotalLessons(monthIndex)}</td>
                  </tr>
                ))}
              </tbody>
              {/* Grand Total */}
              <tfoot>
                <tr>
                  <td colSpan={32} className="text-right px-4 py-2 border border-gray-400">
                    <strong className="font-bold">
                      {currentLabels.grandTotalLessons}: {grandTotalLessons}
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>

          </div>
        </div>

        {/* Right Sidebar */}
        
      </div>

      
    </div>
  );
};

export default ScheduleBuilder;

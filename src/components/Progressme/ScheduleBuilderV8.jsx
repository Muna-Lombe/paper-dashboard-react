import React, { useState } from 'react';
import {
  Table,
  Button,
  Input,
  Row,
  Col,
  Label,
  FormGroup,
  UncontrolledTooltip,
  UncontrolledPopover,
  PopoverBody,
} from 'reactstrap';
import html2canvas from 'html2canvas';

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

  // Add Days to Schedule from Inputs
  const addLessonDays = () => {
    const entries = lessonDaysInput.split(",").map((d) => d.trim());
    const updatedLessonDays = { ...lessonDays };

    entries.forEach((entry) => {
      if (isNaN(entry)) {
        // Assume it's a day of the week
        const dayOfWeek = getDayOfWeekIndex(entry);
        if (dayOfWeek !== -1) {
          // Mark recurring days
          monthsData.forEach((monthData, index) => {
            const days = getDaysInMonth(monthData.year, monthData.month, dayOfWeek);
            updatedLessonDays[index] = [...new Set([...(updatedLessonDays[index] || []), ...days])];
          });
        }
      } else {
        // It's a specific date
        const dayNumber = parseInt(entry, 10);
        selectedMonths.forEach((isSelected, index) => {
          if (isSelected) {
            updatedLessonDays[index] = [...new Set([...(updatedLessonDays[index] || []), dayNumber])];
          }
        });
      }
    });

    setLessonDays(updatedLessonDays);
    setLessonDaysInput("");
  };

  // Function to get day of week index from name
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

  const addHolidayDays = () => {
    const days = holidayDaysInput
      .split(",")
      .map((d) => parseInt(d.trim(), 10));
    const updatedHolidayDays = { ...holidayDays };
    selectedMonths.forEach((isSelected, index) => {
      if (isSelected) {
        updatedHolidayDays[index] = [
          ...(updatedHolidayDays[index] || []),
          ...days,
        ];
      }
    });
    setHolidayDays(updatedHolidayDays);
    setHolidayDaysInput("");
  };

  const addHolidayLessons = () => {
    const days = holidayLessonsInput
      .split(",")
      .map((d) => parseInt(d.trim(), 10));
    const updatedHolidayLessons = { ...holidayLessons };
    selectedMonths.forEach((isSelected, index) => {
      if (isSelected) {
        updatedHolidayLessons[index] = [
          ...(updatedHolidayLessons[index] || []),
          ...days,
        ];
      }
    });
    setHolidayLessons(updatedHolidayLessons);
    setHolidayLessonsInput("");
  };

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
    { name: languages[language].months[8], month: 4, year: currentYear + 1 }, // May
  ];

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
      return "invalid-day";
    }

    const isHolidayLesson = (holidayLessons[monthIndex] || []).includes(day);
    const isHoliday = (holidayDays[monthIndex] || []).includes(day);
    const isLesson = (lessonDays[monthIndex] || []).includes(day);

    if (isHolidayLesson) return "holiday-lesson";
    if (isHoliday) return "holiday";
    if (isLesson) return "lesson";
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
    <div className="d-flex flex-column">
      <div className="d-flex flex-row">
        {/* Left Sidebar */}
        <div
          className="left-sidebar p-3 border-right"
          style={{ minWidth: "250px" }}
        >
          <Button color="link" onClick={toggleLanguage}>
            {currentLabels.toggleLanguage}
          </Button>
          <h5>{currentLabels.lessonSettings}</h5>
          <FormGroup>
            <Label for="lessonDays" id="lessonDaysTooltip">
              {currentLabels.daysForLessons}
            </Label>
            <Input
              type="text"
              id="lessonDays"
              value={lessonDaysInput}
              placeholder="Enter days (comma separated)"
              onChange={(e) => setLessonDaysInput(e.target.value)}
            />
            <UncontrolledTooltip placement="right" target="lessonDaysTooltip">
              {currentTooltips.daysForLessons}
            </UncontrolledTooltip>
            <Button color="primary" className="mt-2" onClick={addLessonDays}>
              {currentLabels.addButton}
            </Button>
          </FormGroup>
          <FormGroup>
            <Label for="holidayDays" id="holidayDaysTooltip">
              {currentLabels.holidays}
            </Label>
            <Input
              type="text"
              id="holidayDays"
              value={holidayDaysInput}
              placeholder="Enter days (comma separated)"
              onChange={(e) => setHolidayDaysInput(e.target.value)}
            />
            <UncontrolledTooltip placement="right" target="holidayDaysTooltip">
              {currentTooltips.holidays}
            </UncontrolledTooltip>
            <Button color="primary" className="mt-2" onClick={addHolidayDays}>
              {currentLabels.addButton}
            </Button>
          </FormGroup>
          <FormGroup>
            <Label for="holidayLessons" id="holidayLessonsTooltip">
              {currentLabels.lessonsOnHolidays}
            </Label>
            <Input
              type="text"
              id="holidayLessons"
              value={holidayLessonsInput}
              placeholder="Enter days (comma separated)"
              onChange={(e) => setHolidayLessonsInput(e.target.value)}
            />
            <UncontrolledTooltip
              placement="right"
              target="holidayLessonsTooltip"
            >
              {currentTooltips.lessonsOnHolidays}
            </UncontrolledTooltip>
            <Button color="primary" className="mt-2" onClick={addHolidayLessons}>
              {currentLabels.addButton}
            </Button>
          </FormGroup>
        </div>

        {/* Schedule Table */}
        <div className="flex-grow-1 p-3" id="schedule-table">
          <h5>{currentLabels.wednesdaySchedule}</h5>
          <Table bordered responsive className="schedule-table">
            <thead>
              <tr>
                <th></th>
                {Array.from({ length: 31 }, (_, i) => (
                  <th key={i}>{i + 1}</th>
                ))}
                <th>{currentLabels.totalLessons}</th>
              </tr>
            </thead>
            <tbody>
              {monthsData.map((monthData, monthIndex) => (
                <tr key={monthIndex}>
                  <td>
                    <Input
                      type="checkbox"
                      checked={selectedMonths[monthIndex]}
                      onChange={() => toggleMonth(monthIndex)}
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
                        className={`${isHighlighted ? cellClass : ""} ${isInvalidDay ? "invalid-day" : ""
                          }`}
                        onClick={
                          !isInvalidDay
                            ? (e) => handleCellClick(e, monthIndex, day)
                            : undefined
                        }
                        style={{ position: "relative", cursor: "pointer" }}
                      >
                        {isInvalidDay ? (
                          <div className="invalid-day-overlay"></div>
                        ) : (
                          isHighlighted && cellClass && "x"
                        )}
                        {!isInvalidDay && (
                          <UncontrolledPopover
                            trigger="legacy"
                            isOpen={popoverOpen[cellId]}
                            target={cellId}
                            toggle={() => togglePopover(monthIndex, day)}
                            placement="auto"
                          >
                            <PopoverBody>
                              <FormGroup>
                                <Label>
                                  <Input
                                    type="radio"
                                    name={`dayType-${monthIndex}-${day}`}
                                    value="lesson"
                                    checked={selectedDayType === 'lesson'}
                                    onChange={(e) => setSelectedDayType(e.target.value)}
                                  />
                                  {language === "en" ? "Lesson Day" : "День занятия"}
                                </Label>
                              </FormGroup>
                              <FormGroup>
                                <Label>
                                  <Input
                                    type="radio"
                                    name={`dayType-${monthIndex}-${day}`}
                                    value="holiday"
                                    checked={selectedDayType === 'holiday'}
                                    onChange={(e) => setSelectedDayType(e.target.value)}
                                  />
                                  {language === "en" ? "Holiday" : "Праздник"}
                                </Label>
                              </FormGroup>
                              <FormGroup>
                                <Label>
                                  <Input
                                    type="radio"
                                    name={`dayType-${monthIndex}-${day}`}
                                    value="holidayLesson"
                                    checked={selectedDayType === 'holidayLesson'}
                                    onChange={(e) => setSelectedDayType(e.target.value)}
                                  />
                                  {language === "en" ? "Lesson on Holiday" : "Занятие на празднике"}
                                </Label>
                              </FormGroup>
                              <FormGroup check className="mt-2">
                                <Label check>
                                  <Input
                                    type="checkbox"
                                    checked={makeRecurring}
                                    onChange={(e) => setMakeRecurring(e.target.checked)}
                                  />{" "}
                                  {language === "en"
                                    ? "Make Recurring"
                                    : "Сделать повторяющимся"}
                                </Label>
                              </FormGroup>
                              <Button
                                color="primary"
                                className="mt-2"
                                onClick={addDayFromCell}
                              >
                                {language === "en" ? "Add to Schedule" : "Добавить в расписание"}
                              </Button>
                            </PopoverBody>
                          </UncontrolledPopover>
                        )}
                      </td>
                    );
                  })}
                  <td>{calculateTotalLessons(monthIndex)}</td>
                </tr>
              ))}
            </tbody>
            {/* Grand Total */}
            <tfoot>
              <tr>
                <td colSpan={32} className="text-end">
                  <strong>
                    {currentLabels.grandTotalLessons}: {grandTotalLessons}
                  </strong>
                </td>
              </tr>
            </tfoot>
          </Table>
        </div>

        {/* Right Sidebar */}
        <div
          className="right-sidebar p-3 border-left"
          style={{ minWidth: "200px" }}
        >
          <h5>{currentLabels.exportSchedule}</h5>
          <Button color="success" onClick={exportToImage}>
            {currentLabels.exportButton}
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="legend mt-4 p-3">
        <h5>{currentLabels.legendTitle}</h5>
        <Row>
          <Col className="d-flex align-items-center mb-2">
            <div className="legend-box lesson me-2"></div>
            <span>{currentLabels.daysForLessons}</span>
          </Col>
          <Col className="d-flex align-items-center mb-2">
            <div className="legend-box holiday me-2"></div>
            <span>{currentLabels.holidays}</span>
          </Col>
          <Col className="d-flex align-items-center mb-2">
            <div className="legend-box holiday-lesson me-2"></div>
            <span>{currentLabels.lessonsOnHolidays}</span>
          </Col>
        </Row>
      </div>

      {/* Styling for the legend boxes and table highlights */}
      <style jsx>{`
        .legend-box {
          width: 20px;
          height: 20px;
          border: 1px solid #000;
        }
        .lesson {
          background-color: #a9a9a9; /* Gray */
        }
        .holiday {
          background-color: #ff0000; /* Red */
        }
        .holiday-lesson {
          background-color: #ffff00; /* Yellow */
        }
        td.lesson {
          background-color: #a9a9a9;
        }
        td.holiday {
          background-color: #ff0000;
        }
        td.holiday-lesson {
          background-color: #ffff00;
        }
        .schedule-table th,
        .schedule-table td {
          text-align: center;
          vertical-align: middle;
          padding: 5px;
          position: relative;
        }
        .invalid-day {
          background-color: #e9ecef;
          cursor: not-allowed;
        }
        .invalid-day-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: linear-gradient(135deg, transparent 25%, #6c757d 25%, #6c757d 50%, transparent 50%, transparent 75%, #6c757d 75%, #6c757d);
          background-size: 10px 10px;
          opacity: 0.2;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default ScheduleBuilder;

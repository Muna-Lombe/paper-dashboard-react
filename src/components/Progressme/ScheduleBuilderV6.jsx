import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Row, Col, Label, FormGroup, UncontrolledTooltip } from 'reactstrap';
import html2canvas from 'html2canvas';
// import moment from 'moment';

// Months and Days Mapping
const languages = {
  en: {
    months: [
      "September", "October", "November", "December", "January", "February", "March", "April", "May"
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
      wednesdaySchedule: "Wednesday Schedule"
    },
    tooltips: {
      daysForLessons: "Enter lesson days as numbers (comma separated). Example: 1, 8, 15, 22",
      holidays: "Enter holidays or break days as numbers (comma separated). Example: 5, 12, 19",
      lessonsOnHolidays: "Enter lesson days during holidays as numbers (comma separated). Example: 3, 10, 17"
    }
  },
  ru: {
    months: [
      "Сентябрь", "Октябрь", "Ноябрь", "Декабрь", "Январь", "Февраль", "Март", "Апрель", "Май"
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
      wednesdaySchedule: "Расписание на среду"
    },
    tooltips: {
      daysForLessons: "Введите дни занятий в виде чисел (через запятую). Пример: 1, 8, 15, 22",
      holidays: "Введите дни праздников или перерывов в виде чисел (через запятую). Пример: 5, 12, 19",
      lessonsOnHolidays: "Введите дни занятий во время праздников в виде чисел (через запятую). Пример: 3, 10, 17"
    }
  }
};

const ScheduleBuilder = () => {
  // States for settings and table
  const [language, setLanguage] = useState("ru");
  const [lessonDaysInput, setLessonDaysInput] = useState('');
  const [holidayDaysInput, setHolidayDaysInput] = useState('');
  const [holidayLessonsInput, setHolidayLessonsInput] = useState('');
  const [lessonDays, setLessonDays] = useState({});
  const [holidayDays, setHolidayDays] = useState({});
  const [holidayLessons, setHolidayLessons] = useState({});
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Initialize selected months on component mount
  useEffect(() => {
    const months = languages[language].months;
    setSelectedMonths(Array(months.length).fill(true));
    setSelectAll(true);
  }, [language]);

  // Predefined months and years
  const currentYear = new Date().getFullYear();
  const monthsData = [
    { name: languages[language].months[0], month: 8, year: currentYear },      // September
    { name: languages[language].months[1], month: 9, year: currentYear },      // October
    { name: languages[language].months[2], month: 10, year: currentYear },     // November
    { name: languages[language].months[3], month: 11, year: currentYear },     // December
    { name: languages[language].months[4], month: 0, year: currentYear + 1 },  // January
    { name: languages[language].months[5], month: 1, year: currentYear + 1 },  // February
    { name: languages[language].months[6], month: 2, year: currentYear + 1 },  // March
    { name: languages[language].months[7], month: 3, year: currentYear + 1 },  // April
    { name: languages[language].months[8], month: 4, year: currentYear + 1 }   // May
  ];

  // Predefined holidays and lessons
  useEffect(() => {
    // Predefined holidays and lessons as per your description
    const predefinedHolidays = {
      // monthIndex: [holiday days]
      1: [25],               // October holidays on the 25th
      2: [1, 8],             // November holidays on the 1st and 8th
      3: [27, 28, 29, 30, 31], // December holidays from 27th onwards
      4: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // January holidays until 10th
      8: [1, 8, 15]          // May holidays on the 1st, 8th, 15th
    };

    const predefinedHolidayLessons = {
      // monthIndex: [lesson days during holidays]
      2: [8],    // Lesson during holiday on November 8th
      8: [1, 8]  // Lessons during holidays on May 1st and 8th
    };

    const predefinedLessonDays = {};

    // Generate lesson days (Wednesdays)
    monthsData.forEach((monthData, index) => {
      const wednesdays = getDaysInMonth(monthData.year, monthData.month, 3); // 3 for Wednesday
      predefinedLessonDays[index] = wednesdays;
    });

    setLessonDays(predefinedLessonDays);
    setHolidayDays(predefinedHolidays);
    setHolidayLessons(predefinedHolidayLessons);
  }, [monthsData]);

  // Toggle Language
  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ru" : "en";
    setLanguage(newLanguage);
    // Update selected months for new language
    const months = languages[newLanguage].months;
    setSelectedMonths(Array(months.length).fill(true));
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

  // Add Days to Schedule from Inputs
  const addLessonDays = () => {
    const days = lessonDaysInput.split(',').map((d) => parseInt(d.trim(), 10));
    const updatedLessonDays = { ...lessonDays };
    selectedMonths.forEach((isSelected, index) => {
      if (isSelected) {
        updatedLessonDays[index] = [...(updatedLessonDays[index] || []), ...days];
      }
    });
    setLessonDays(updatedLessonDays);
    setLessonDaysInput('');
  };

  const addHolidayDays = () => {
    const days = holidayDaysInput.split(',').map((d) => parseInt(d.trim(), 10));
    const updatedHolidayDays = { ...holidayDays };
    selectedMonths.forEach((isSelected, index) => {
      if (isSelected) {
        updatedHolidayDays[index] = [...(updatedHolidayDays[index] || []), ...days];
      }
    });
    setHolidayDays(updatedHolidayDays);
    setHolidayDaysInput('');
  };

  const addHolidayLessons = () => {
    const days = holidayLessonsInput.split(',').map((d) => parseInt(d.trim(), 10));
    const updatedHolidayLessons = { ...holidayLessons };
    selectedMonths.forEach((isSelected, index) => {
      if (isSelected) {
        updatedHolidayLessons[index] = [...(updatedHolidayLessons[index] || []), ...days];
      }
    });
    setHolidayLessons(updatedHolidayLessons);
    setHolidayLessonsInput('');
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

  // Helper function to dynamically determine the color class for each cell
  const getCellClass = (monthIndex, day) => {
    const isHolidayLesson = (holidayLessons[monthIndex] || []).includes(day);
    const isHoliday = (holidayDays[monthIndex] || []).includes(day);
    const isLesson = (lessonDays[monthIndex] || []).includes(day);

    if (isHolidayLesson) return 'holiday-lesson';
    if (isHoliday) return 'holiday';
    if (isLesson) return 'lesson';
    return '';
  };

  const currentLabels = languages[language].labels;
  const currentTooltips = languages[language].tooltips;

  return (
    <div className="d-flex flex-column">
      <div className="d-flex flex-row">
        {/* Left Sidebar */}
        <div className="left-sidebar p-3 border-right" style={{ minWidth: '250px' }}>
          <Button color="link" onClick={toggleLanguage}>
            {currentLabels.toggleLanguage}
          </Button>
          <h5>{currentLabels.lessonSettings}</h5>
          <FormGroup>
            <Label for="lessonDays" id="lessonDaysTooltip">{currentLabels.daysForLessons}</Label>
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
            <Label for="holidayDays" id="holidayDaysTooltip">{currentLabels.holidays}</Label>
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
            <Label for="holidayLessons" id="holidayLessonsTooltip">{currentLabels.lessonsOnHolidays}</Label>
            <Input
              type="text"
              id="holidayLessons"
              value={holidayLessonsInput}
              placeholder="Enter days (comma separated)"
              onChange={(e) => setHolidayLessonsInput(e.target.value)}
            />
            <UncontrolledTooltip placement="right" target="holidayLessonsTooltip">
              {currentTooltips.lessonsOnHolidays}
            </UncontrolledTooltip>
            <Button color="primary" className="mt-2" onClick={addHolidayLessons}>
              {currentLabels.addButton}
            </Button>
          </FormGroup>
          <FormGroup>
            <Label>{currentLabels.selectAll}</Label>
            <Input
              type="checkbox"
              checked={selectAll}
              onChange={toggleSelectAll}
            />
          </FormGroup>
          {languages[language].months.map((month, index) => (
            <FormGroup key={index} check>
              <Label check>
                <Input
                  type="checkbox"
                  checked={selectedMonths[index]}
                  onChange={() => toggleMonth(index)}
                />
                {month}
              </Label>
            </FormGroup>
          ))}
        </div>

        {/* Schedule Table */}
        <div className="flex-grow-1 p-3" id="schedule-table">
          <h5>{currentLabels.wednesdaySchedule}</h5>
          <Table bordered>
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
                    const isHighlighted = selectedMonths[monthIndex];
                    const cellClass = getCellClass(monthIndex, day);
                    return (
                      <td
                        key={dayIndex}
                        className={isHighlighted ? cellClass : ''}
                      >
                        {isHighlighted && cellClass ? 'x' : ''}
                      </td>
                    );
                  })}
                  <td>
                    {
                      ((lessonDays[monthIndex] || []).length + (holidayLessons[monthIndex] || []).length) - (holidayDays[monthIndex] || []).filter(day => (lessonDays[monthIndex] || []).includes(day)).length
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {/* Grand Total */}
          <div className="text-end">
            <strong>{language === 'en' ? 'Total Lessons:' : 'Итого уроков:'} {calculateGrandTotal()}</strong>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="right-sidebar p-3 border-left" style={{ minWidth: '200px' }}>
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
      `}</style>
    </div>
  );

  // Function to calculate the grand total of lessons
  function calculateGrandTotal() {
    let total = 0;
    monthsData.forEach((_, monthIndex) => {
      const lessons = (lessonDays[monthIndex] || []).length;
      const holidayLessonsCount = (holidayLessons[monthIndex] || []).length;
      const holidaysOnLessonDays = (holidayDays[monthIndex] || []).filter(day => (lessonDays[monthIndex] || []).includes(day)).length;
      total += (lessons + holidayLessonsCount) - holidaysOnLessonDays;
    });
    return total;
  }
};

export default ScheduleBuilder;

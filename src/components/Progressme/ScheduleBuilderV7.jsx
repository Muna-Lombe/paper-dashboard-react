import React, { useState } from 'react';
import { Table, Button, Input, Row, Col, Label, FormGroup, UncontrolledTooltip } from 'reactstrap';
import html2canvas from 'html2canvas';

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
      grandTotalLessons: "Grand Total Lessons",
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
      toggleLanguage: "Switch to English",
      legendTitle: "Легенда",
      totalLessons: "Итого занятий",
      grandTotalLessons: "Итого уроков",
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
  const [lessonDays, setLessonDays] = useState([]);
  const [holidayDays, setHolidayDays] = useState([]);
  const [holidayLessons, setHolidayLessons] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState(Array(languages[language].months.length).fill(true));
  const [selectAll, setSelectAll] = useState(true);

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

  // Add Days to Schedule
  const addLessonDays = () => {
    setLessonDays(lessonDaysInput.split(',').map((d) => parseInt(d.trim(), 10)));
    setLessonDaysInput('');
  };

  const addHolidayDays = () => {
    setHolidayDays(holidayDaysInput.split(',').map((d) => parseInt(d.trim(), 10)));
    setHolidayDaysInput('');
  };

  const addHolidayLessons = () => {
    setHolidayLessons(holidayLessonsInput.split(',').map((d) => parseInt(d.trim(), 10)));
    setHolidayLessonsInput('');
  };

  // Add Weekends (Saturdays and Sundays)
  const addWeekends = () => {
    setLessonDays(Array.from({ length: 31 }, (_, i) => i + 1).filter(day => (day % 7 === 0 || (day + 1) % 7 === 0)));
  };

  // Helper function to dynamically determine the color class for each cell
  const getCellClass = (day) => {
    const isHolidayLesson = holidayLessons.includes(day);
    const isHoliday = holidayDays.includes(day);
    const isLesson = lessonDays.includes(day);

    if (isHolidayLesson) return 'holiday-lesson';
    if (isHoliday) return 'holiday';
    if (isLesson) return 'lesson';
    return '';
  };

  const currentLabels = languages[language].labels;
  const currentMonths = languages[language].months;
  const currentTooltips = languages[language].tooltips;

  // Function to calculate total lessons per month
  const calculateTotalLessons = () => {
    return currentMonths.map((_, index) => {
      return lessonDays.length + holidayLessons.length;
    });
  };

  // Calculate grand total lessons
  const grandTotalLessons = calculateTotalLessons().reduce((acc, val) => acc + val, 0);

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
          <Button color="secondary" className="mt-3" onClick={addWeekends}>
            {currentLabels.weekends}
          </Button>
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
              {currentMonths.map((month, monthIndex) => (
                <tr key={monthIndex}>
                  <td>
                    <Input
                      type="checkbox"
                      checked={selectedMonths[monthIndex]}
                      onChange={() => toggleMonth(monthIndex)}
                    />
                    {month}
                  </td>
                  {Array.from({ length: 31 }, (_, dayIndex) => {
                    const day = dayIndex + 1;
                    const isHighlighted = selectedMonths[monthIndex];
                    const cellClass = getCellClass(day);
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
                    {lessonDays.length + holidayLessons.length}
                  </td>
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
        .schedule-table th,
        .schedule-table td {
          text-align: center;
          vertical-align: middle;
          padding: 5px;
        }
      `}</style>
    </div>
  );
};

export default ScheduleBuilder;

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
      lessonSettingsTip: "🛈 Notice: This sets the holidays and lessons for the whole schedule.",
      daysForLessons: "Days for Lessons",
      holidays: "Holidays or Breaks",
      lessonsOnHolidays: "Lessons on Holidays",
      selectAll: "Select All Months",
      addButton: "+",
      exportButton: "Export as Image",
      resetButton: "Reset Schedule",
      scheduleTable: "Schedule Table",
      scheduleName: "Schedule Name",
      exportSchedule: "Export Schedule",
      toggleLanguage: "Ru",
      legendTitle: "Legend",
      totalLessons: "Total Lessons",
      grandTotalLessons: "Grand Total Lessons",
      scheduleTitle: "Schedule",
      addToLessonDays: "Add to Lesson Days",
      addToHolidayDays: "Add to Holiday Days",
      addToHolidayLessons: "Add to Holiday Lessons",
      makeRecurring: "Make Recurring (This Month)",
      removeDay: "Remove"
    },
    tooltips: {
      daysForLessons:
        "Enter lesson days as numbers or days of the week (comma separated). Example: 1, 8, Monday, Wednesday",
      holidays:
        "Enter holidays or break days as numbers (comma separated). Example: 5, 12, 19",
      lessonsOnHolidays:
        "Enter lesson days during holidays as numbers (comma separated). Example: 3, 10, 17",
      addToSchedule: "Add to Schedule"
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
      lessonSettingsTip: "🛈 Примечание: здесь устанавливаются праздники и уроки для всего расписания.",
      daysForLessons: "Дни занятий",
      holidays: "Праздники или перерывы",
      lessonsOnHolidays: "Занятия на каникулах",
      selectAll: "Выбрать все месяцы",
      addButton: "+",
      exportButton: "Экспорт в изображение",
      resetButton: "Сбросить расписание",
      scheduleTable: "Расписание занятий",
      scheduleName: "Название расписания",
      exportSchedule: "Экспорт расписания",
      toggleLanguage: "En",
      legendTitle: "Легенда",
      totalLessons: "Итого занятий",
      grandTotalLessons: "Итого уроков",
      scheduleTitle: "Расписание",
      addToLessonDays: "Добавить в дни занятий",
      addToHolidayDays: "Добавить в дни праздников",
      addToHolidayLessons: "Добавить в занятия на каникулах",
      makeRecurring: "Сделать повторяющимся (в этом месяце)",
      removeDay: "Удалить"
    },
    tooltips: {
      daysForLessons:
        "Введите дни занятий в виде чисел или дней недели (через запятую). Пример: 1, 8, Понедельник, Среда",
      holidays:
        "Введите дни праздников или перерывов в виде чисел (через запятую). Пример: 5, 12, 19",
      lessonsOnHolidays:
        "Введите дни занятий во время праздников в виде чисел (через запятую). Пример: 3, 10, 17",
      addToSchedule: "Добавить в расписание"
    },
  },
};

const ScheduleBuilder = () => {
  // States for settings and table
  const [language, setLanguage] = useState("ru");
  // const [lessonDaysInput, setLessonDaysInput] = useState("");
  // const [holidayDaysInput, setHolidayDaysInput] = useState("");
  // const [holidayLessonsInput, setHolidayLessonsInput] = useState("");
  const [lessonDays, setLessonDays] = useState({});
  const [holidayDays, setHolidayDays] = useState({});
  const [holidayLessons, setHolidayLessons] = useState({});
  const [selectedMonths, setSelectedMonths] = useState(
    Array(languages[language].months.length).fill(true)
  );
  const [selectAll, setSelectAll] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState({});
  const [currentCell, setCurrentCell] = useState(null);
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

  const createImagePreview = () => {
    const table = document.querySelector("#schedule-table");
    const img = document.createElement("img");

    // hide schedule-header
    const header = table.querySelector(".schedule-header");
    header.style.display = "none";

    //create an modal, add the table to the modal, make sure the full table component is in full view and open the modal
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    

  }
  // Export the table to an image
  const exportToImage = () => {
    html2canvas(document.querySelector("#schedule-table")).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "schedule.png";
      link.click();
    });
  };

  // Reset the schedule
  const resetSchedule = () => {
    setLessonDays({});
    setHolidayDays({});
    setHolidayLessons({});
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
    const lessonDaysInput = document.querySelector("input#lessonDays").value
    const entries = lessonDaysInput.split(",").map((d) => d.trim());
    const updatedLessonDays = { ...lessonDays };

    entries.forEach((entry) => {
      if (isNaN(entry)) {
        // Assume it's a day of the week
        const dayOfWeek = getDayOfWeekIndex(entry);
        if (dayOfWeek !== -1) {
          monthsData.forEach((monthData, index) => {
            if (selectedMonths[index]) {
              const days = getDaysInMonth(
                monthData.year,
                monthData.month,
                dayOfWeek
              );
              updatedLessonDays[index] = [
                ...new Set([...(updatedLessonDays[index] || []), ...days]),
              ];
            }
          });
        }
      } else {
        // It's a specific date
        const dayNumber = parseInt(entry, 10);
        selectedMonths.forEach((isSelected, index) => {
          if (isSelected) {
            updatedLessonDays[index] = [
              ...new Set([...(updatedLessonDays[index] || []), dayNumber]),
            ];
          }
        });
      }
    });

    setLessonDays(updatedLessonDays);
    // setLessonDaysInput("");
  };

  // Function to get day of week index from name
  const getDayOfWeekIndex = (dayName) => {
    const daysOfWeekEn = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const daysOfWeekRu = [
      "Воскресенье",
      "Понедельник",
      "Вторник",
      "Среда",
      "Четверг",
      "Пятница",
      "Суббота",
    ];
    const indexEn = daysOfWeekEn.findIndex(
      (day) => day.toLowerCase() === dayName.toLowerCase()
    );
    const indexRu = daysOfWeekRu.findIndex(
      (day) => day.toLowerCase() === dayName.toLowerCase()
    );
    return indexEn !== -1 ? indexEn : indexRu;
  };

  const addHolidayDays = () => {
    const holidayDaysInput = document.querySelector("input#holidayDays").value
    const entries = holidayDaysInput.split(",").map((d) => d.trim());
    const updatedHolidayDays = { ...holidayDays };

    entries.forEach((entry) => {
      if (!isNaN(entry)) {
        const dayNumber = parseInt(entry, 10);
        selectedMonths.forEach((isSelected, index) => {
          if (isSelected) {
            updatedHolidayDays[index] = [
              ...new Set([...(updatedHolidayDays[index] || []), dayNumber]),
            ];
          }
        });
      }
    });

    setHolidayDays(updatedHolidayDays);
    // setHolidayDaysInput("");
  };

  const addHolidayLessons = () => {
    const holidayLessonsInput = document.querySelector("input#holidayLessons").value
    const entries = holidayLessonsInput.split(",").map((d) => d.trim());
    const updatedHolidayLessons = { ...holidayLessons };

    entries.forEach((entry) => {
      if (!isNaN(entry)) {
        const dayNumber = parseInt(entry, 10);
        selectedMonths.forEach((isSelected, index) => {
          if (isSelected) {
            updatedHolidayLessons[index] = [
              ...new Set([...(updatedHolidayLessons[index] || []), dayNumber]),
            ];
          }
        });
      }
    });

    setHolidayLessons(updatedHolidayLessons);
    // setHolidayLessonsInput("");
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
    setMakeRecurring(false); // Reset the 'Make Recurring' checkbox
  };

  // Toggle popover
  const togglePopover = (monthIndex, day) => {
    setPopoverOpen({
      ...popoverOpen,
      [`cell-${monthIndex}-${day}`]: !popoverOpen[`cell-${monthIndex}-${day}`],
    });
  };

  // Handle 'Make Recurring' checkbox change
  const handleMakeRecurringChange = (e) => {
    setMakeRecurring(e.target.checked);
  };

  // Remove activity by cellId
  const handleDeleteActivity = (cellId, category, handlePopover=true) => {
    if(!category) return;

    if (category === "lesson") {
      const updatedLessonDays = {...lessonDays};
      const [_,monthIndex, day] = cellId.split("-");
      
      const month =   updatedLessonDays[parseInt(monthIndex)]
      if(!month) return;

      updatedLessonDays[parseInt(monthIndex)].splice(month.findIndex(x => x === parseInt(day)), 1);
      if(handlePopover) { 
        togglePopover(parseInt(monthIndex), parseInt(day))
      }
      setLessonDays(updatedLessonDays);
    } else if (category === "holiday") {
      const updatedHolidayDays = {...holidayDays};
      const [_,monthIndex, day] = cellId.split("-");
      const month = updatedHolidayDays[parseInt(monthIndex)]
      if (!month) return;

      updatedHolidayDays[parseInt(monthIndex)].splice(month.findIndex(x => x === parseInt(day)), 1);
      if(handlePopover) { 
        togglePopover(parseInt(monthIndex), parseInt(day))
      }
      setHolidayDays(updatedHolidayDays);
      

    } else if (category === "holidayLesson") {
      const updatedHolidayLessons = {...holidayLessons};
      const [_,monthIndex, day] = cellId.split("-");
      const month = updatedHolidayLessons[parseInt(monthIndex)]
      if (!month) return;

      updatedHolidayLessons[parseInt(monthIndex)].splice(month.findIndex(x => x === parseInt(day)), 1);
      if(handlePopover) { 
        togglePopover(parseInt(monthIndex), parseInt(day))
      }
      setHolidayLessons(updatedHolidayLessons);
    }
    

  }
  //first remove all other activities from the cell 
  // then add a new activity
  const updateCell = (category) =>{
    ['lesson', 'holiday', 'holidayLesson'].forEach(cat=>(
      handleDeleteActivity(`cell-${currentCell.monthIndex}-${currentCell.day}`, cat, null)
    ))
    addActivityFromCell(category)


  }
  // Add day to specific category from cell menu
  const addActivityFromCell = (category) => {
    const { monthIndex, day } = currentCell;
    let updatedDays;

    if (category === "lesson") {
      updatedDays = { ...lessonDays };
    } else if (category === "holiday") {
      updatedDays = { ...holidayDays };
    } else if (category === "holidayLesson") {
      updatedDays = { ...holidayLessons };
    }

    if (makeRecurring) {
      // Get day of week
      const date = new Date(
        monthsData[monthIndex].year,
        monthsData[monthIndex].month,
        day
      );
      const dayOfWeek = date.getDay();
      const days = getDaysInMonth(
        monthsData[monthIndex].year,
        monthsData[monthIndex].month,
        dayOfWeek
      );
      updatedDays[monthIndex] = [
        ...new Set([...(updatedDays[monthIndex] || []), ...days]),
      ];
    } else {
      
      // handleDeleteActivity(`cell-${monthIndex}-${day}`, category)
      
      updatedDays[monthIndex] = [
        ...new Set([...(updatedDays[monthIndex] || []), day]),
      ];
    }

    // Update the corresponding state
    if (category === "lesson" || category === "Lesson") {
      setLessonDays(updatedDays);
    } else if (category === "holiday") {
      setHolidayDays(updatedDays);
    } else if (category === "holidayLesson") {
      setHolidayLessons(updatedDays);
    }
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
  const TranslateIcon = () =>(
    <svg style={{width:'15px', aspectRatio:'1/1'}} fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="bi bi-translate" viewBox="0 0 16 16">
      <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286H4.545zm1.634-.736L5.5 3.956h-.049l-.679 2.022H6.18z" />
      <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm7.138 9.995c.193.301.402.583.63.846-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6.066 6.066 0 0 1-.415-.492 1.988 1.988 0 0 1-.94.31z" />
    </svg>
  )
  const DaysInput= ()=>(
    <div className="days-input d-flex flex-column">
      <h5>{currentLabels.lessonSettings}</h5>
      <p className='font-xs'>{currentLabels.lessonSettingsTip}</p>
      <div className="grouped-forms d-flex flex-row flex-lg-column" style={{gap:'8px'}}>
        <FormGroup>
          <Label for="lessonDays" id="lessonDaysTooltip">
            {currentLabels.daysForLessons}
          </Label>
          <Input
            type="text"
            id="lessonDays"
            // value={lessonDaysInput}
            placeholder="Enter days (comma separated)"
            // onChange={(e) => setLessonDaysInput(e.target.value)}
          />
          <UncontrolledTooltip placement="right" target="lessonDaysTooltip">
            {currentTooltips.daysForLessons}
          </UncontrolledTooltip>
          <Button size='sm' color="primary" className="mt-2 d-flex align-items-center" onClick={addLessonDays}>
            <span style={{fontSize:"22px"}}>
              {currentLabels.addButton}
            </span>
          </Button>
        </FormGroup>
        <FormGroup>
          <Label for="holidayDays" id="holidayDaysTooltip">
            {currentLabels.holidays}
          </Label>
          <Input
            type="text"
            id="holidayDays"
            // value={holidayDaysInput}
            placeholder="Enter days (comma separated)"
            // onChange={(e) => setHolidayDaysInput(e.target.value)}
          />
          <UncontrolledTooltip placement="right" target="holidayDaysTooltip">
            {currentTooltips.holidays}
          </UncontrolledTooltip>
          <Button size='sm' color="primary" className="mt-2 d-flex align-items-center" onClick={addHolidayDays}>
            <span style={{fontSize:"22px"}}>
              {currentLabels.addButton}
            </span>
          </Button>
        </FormGroup>
        <FormGroup>
          <Label for="holidayLessons" id="holidayLessonsTooltip">
            {currentLabels.lessonsOnHolidays}
          </Label>
          <Input
            type="text"
            id="holidayLessons"
            // value={holidayLessonsInput}
            placeholder="Enter days (comma separated)"
            // onChange={(e) => setHolidayLessonsInput(e.target.value)}
          />
          <UncontrolledTooltip
            placement="right"
            target="holidayLessonsTooltip"
          >
            {currentTooltips.lessonsOnHolidays}
          </UncontrolledTooltip>
          <Button size='sm' color="primary" className="mt-2 d-flex align-items-center" onClick={addHolidayLessons}>
            <span style={{fontSize:"22px"}}>
              {currentLabels.addButton}
            </span>
          </Button>
        </FormGroup>

      </div>
    </div>
  )

  const LeftSideBar =()=>(
    <div
      className="left-sidebar p-3 border-right d-flex flex-row flex-lg-column"
      style={{ minWidth: "250px", boxSizing: "border-box" }}
    >
      <DaysInput />
      {/* Legend */}
      <div className="legend m-lg-0 mx-3 px-3" style={{ boxSizing: "border-box" }}>
        <h5>{currentLabels.legendTitle}</h5>
        <Row className='d-flex flex-column'>
          <Col className="d-flex align-items-center mb-2">
            <div className="legend-box lesson me-2"></div>
            <span>{currentLabels.daysForLessons}</span>
          </Col>
          <Col className="d-flex align-items-center mb-2">
            <div className="legend-box holiday me-2"></div>
            <span>{currentLabels.holidays}</span>
          </Col>
          <Col className="d-flex align-items-center mb-2 ">
            <div className="legend-box holiday-lesson me-2"></div>
            <span>{currentLabels.lessonsOnHolidays}</span>
          </Col>
        </Row>
      </div>
    </div>
  )
 
  return (
    <div className="d-flex flex-column bg-white" style={{ overflowX: "auto" }}>
      <p onClick={toggleLanguage} className='btn  m-3 d-flex  justify-content-center align-items-center m-1 border rounded' style={{width:'50px', height:'40px', cursor:'pointer'}}>
        <TranslateIcon/>
        <span className='' >
          {currentLabels.toggleLanguage}
        </span>
      </p>
      <div className="d-flex flex-column  flex-lg-row ">
        {/* Left Sidebar */}
        <LeftSideBar/>

        {/* Schedule Table */}
        {/* <Scheduletable/> */}
        <div
          className="flex-grow-1 p-3"
          id="schedule-table"
          style={{ boxSizing: "border-box" }}
        >
          <h5>{currentLabels.scheduleTitle}</h5>
          <div className="schedule-header w-100 d-flex justify-content-between">
            <Button size='sm' color="danger" className="mt-3" onClick={resetSchedule}>
              {currentLabels.resetButton}
            </Button>
            <Button color="success" onClick={exportToImage}>
              {currentLabels.exportButton}
            </Button>
          </div>
          <div>
            <p className='w-100 d-flex text-nowrap justify-content-center align-items-baseline' style={{gap:'8px'}}>
              <Label for="holidayLessons" id="holidayLessonsTooltip">
                {currentLabels.scheduleName}
              </Label>
              <Input
                type="text"
                id="holidayLessons"
                className='w-25'
                // value={holidayLessonsInput}
                placeholder={""}
              // onChange={(e) => setHolidayLessonsInput(e.target.value)}
              />
            </p>
            <Table bordered responsive className="schedule-table" style={{ width: '100%' }}>
              
              <thead>
                {/* <tr className='w-100' >
                  <th colSpan={33} className=' d-flex'>
                  </th>
                </tr> */}
                <tr>
                  <th>{' '}</th>
                  <th>{' '}</th>
                  {Array.from({ length: 31 }, (_, i) => (
                    <th key={i}>{i + 1}</th>
                  ))}
                  <th>{currentLabels.totalLessons}</th>
                </tr>
              </thead>
              <tbody>
                {monthsData.map((monthData, monthIndex) => (
                  <tr key={monthIndex} style={{ height: "10px" }}>
                    <td className='d-flex justify-content-end align-items-center '>
                      <Input

                        type="checkbox"
                        checked={selectedMonths[monthIndex]}
                        onChange={() => toggleMonth(monthIndex)}
                      />
                    </td>
                    <td>
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
                          style={{
                            position: "relative",
                            cursor: isInvalidDay ? "not-allowed" : "pointer",
                            height: "10px"
                          }}
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
                                {/* Add to Lesson Days */}
                                <FormGroup 
                                check 
                                className='checkbox-formgroup activity'>
                                  <Label check className="lessons">
                                    <Input
                                      type="checkbox"
                                      onChange={() =>{
                                          //ensure all other inputs are unchecked
                                        const checkFormGroup = document.querySelectorAll(".checkbox-formgroup.activity:not(:has(label.lessons))")
                                          checkFormGroup.forEach((formGroup)=>{
                                            const checkbox = formGroup.querySelector("input[type='checkbox']")
                                            checkbox.checked = false;
                                          }) 
                                          updateCell("lesson")
                                        }
                                      }
                                    />{" "}
                                    {currentLabels.addToLessonDays}
                                  </Label>
                                </FormGroup>
                                {/* Add to Holiday Days */}
                                <FormGroup 
                                check 
                                
                                className="checkbox-formgroup activity mt-2">
                                  <Label check className='holiday-days'>
                                    <Input
                                      type="checkbox"
                                      onChange={() =>{
                                          //ensure all other inputs are unchecked
                                          const checkFormGroup = document.querySelectorAll(".checkbox-formgroup.activity:not(:has(label.holiday-days))")

                                          checkFormGroup.forEach((formGroup)=>{
                                            const checkbox = formGroup.querySelector("input[type='checkbox']")
                                            checkbox.checked = false;
                                          }) 
                                          updateCell("holiday")
                                        }
                                      }
                                    />{" "}
                                    {currentLabels.addToHolidayDays}
                                  </Label>
                                </FormGroup>
                                {/* Add to Holiday Lessons */}
                                <FormGroup check className="checkbox-formgroup activity mt-2">
                                  <Label check className='holiday-lessons'>
                                    <Input
                                      type="checkbox"
                                      onChange={() =>{
                                          //ensure all other inputs are unchecked
                                          const checkFormGroup = document.querySelectorAll(".checkbox-formgroup.activity:not(:has(label.holiday-lessons))")

                                          checkFormGroup.forEach((formGroup)=>{
                                            const checkbox = formGroup.querySelector("input[type='checkbox']")
                                            checkbox.checked = false;
                                          }) 
                                          updateCell("holidayLesson")
                                        }
                                      }
                                    />{" "}
                                    {currentLabels.addToHolidayLessons}
                                  </Label>
                                </FormGroup>
                                {/* Make Recurring */}
                                <FormGroup check className="checkbox-formgroup mt-2">
                                  <Label check className='make-recurring checked-'>
                                    <Input
                                      type="checkbox"
                                      onChange={handleMakeRecurringChange}
                                    />{" "}
                                    {currentLabels.makeRecurring}
                                  </Label>
                                </FormGroup>
                                
                                <Button size='sm' color="danger" onClick={()=>{
                                  handleDeleteActivity(cellId, getCellClass(monthIndex, day));
                                  // setModalOpen(false);
                                }}>
                                  {currentLabels.removeDay}
                                </Button>
                              </PopoverBody>
                              <style jsx>
                                {`
                                  .checkbox-formgroup{
                                    border:1px;
                                    border-radius: 5px;
                                    
                                  }
                                  .checkbox-formgroup:hover{
                                    background-color: #34b5b8;
                                    color: white;
                                  }
                                  .checkbox-formgroup:has(label input:checked){
                                    // padding: 3px;

                                    border: 3px,#34b5b8;
                                    border-radius: 10px;
                                    color: #34b5b8;
                                  }
                                  .checkbox-formgroup:has(label input:checked):hover{
                                    background-color: white;
                                    border: 4px;
                                    border-radius: 10px;
                                  }
                                `}
                              </style>
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
        </div>
        {/* Right Sidebar */}
        {/* <div
          className="right-sidebar p-3 border-left"
          style={{ minWidth: "200px", boxSizing: "border-box" }}
        >
          <h5>{currentLabels.exportSchedule}</h5>
          
        </div> */}
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
          min-width: 30px;
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
          background-image: linear-gradient(
            135deg,
            transparent 25%,
            #6c757d 25%,
            #6c757d 50%,
            transparent 50%,
            transparent 75%,
            #6c757d 75%,
            #6c757d
          );
          background-size: 10px 10px;
          opacity: 0.2;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default ScheduleBuilder;

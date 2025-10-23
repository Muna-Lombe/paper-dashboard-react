import React, { useEffect, useState } from 'react';
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
      scheduleName: "Class",
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
      scheduleName: "Урок",
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
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [imagePreview, setImagePreview] =  useState(null)
  const toggleImageModal = () => setImageModalOpen(!imageModalOpen);

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
    const tablewrapper = document.querySelector(".table-wrapper ");
    
    
    // hide schedule-header
    // const header = tablewrapper.querySelector(".schedule-header");
    // header.style.display = "none";
    // table.removeChild(header)
    
    //check the screen size 
    //and resize the table component accordingly 
    //then add it to a canvas as an image
    // make sure the whole component can be seen and no parts are cut off
    // then add the image to the modal
    // Check the screen size and resize the table component accordingly
    const table = tablewrapper.querySelector('table')
    const scale = Math.min(window.innerWidth / table.offsetWidth, 1);
    table.style.transform = `scale(${scale})`;
    table.style.transformOrigin = 'top left';

    // Use html2canvas to capture the table as an image
    html2canvas(tablewrapper, { scale: 1 }).then((canvas) => {
      // Reset the table's transform
      table.style.transform = '';
      tablewrapper.querySelector(".table-name> input").type = 'text'
      // header.style.display = '';

      // Make sure the whole component can be seen and no parts are cut off
      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/png");
      img.style.width = '100%';
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "schedule.png";
      
      // Add the image to the modal
      setImagePreview(() => () => (
        <div className="flex flex-col">
          <a href={link.href} download={link.download} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            {currentLabels.exportSchedule}
          </a>
            <img src={img.src} id="image-preview" alt="Schedule Preview" className="w-full" />
        </div>
      ));
      setImageModalOpen(true);
    });
    
   

  
    // setImagePreview(table)
    

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
    

    // console.log("setting popover open 3");
    setCurrentCell({ monthIndex, day });

    setPopoverOpen({ ...popoverOpen, [`cell-${monthIndex}-${day}`]: true });
    setMakeRecurring(false); // Reset the 'Make Recurring' checkbox
  };

  // Toggle popover
  const togglePopover = (e=null,monthIndex, day) => {
    // console.log("setting popover open 1",e);
    if(e?.srcElement?.tagName === "TR"){
      e?.preventDefault();
      return
    }
    setPopoverOpen({
      ...popoverOpen,
      [`cell-${monthIndex}-${day}`]: !popoverOpen[`cell-${monthIndex}-${day}`],
    });
  };
  
  //Handle cell range select to open popover
  const handleCellRangeSelect = (e, cellRange) => {
    // console.log("setting popover open 2");
    setPopoverOpen({ ...popoverOpen, [`cell-${cellRange.last.monthIndex}-${cellRange.last.day}`]: true });
    setCurrentCell({...cellRange.last, isRange:true, range:cellRange});
    // togglePopover(cellRange.last.monthIndex,  cellRange.last.day)
    setMakeRecurring(false);

  }

  // Handle 'Make Recurring' checkbox change
  const handleMakeRecurringChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMakeRecurring(e.target.checked);
  };

  // Remove activity by cellId
  const handleDeleteActivity = (cellId, category, handlePopover=true, rangeOfCellIds=null) => {
    let monthIndex, day;
    const removeFromLessons = (cellId, prevState) =>{
      // console.log(cellId, prevState);
      
      const updatedLessonDays = { ...prevState };
      const [_, monthIndex, day] = cellId.split("-");

      const month = updatedLessonDays[parseInt(monthIndex)]
      if (!month) return {};

      const dayIdx = month.findIndex(x => x === parseInt(day));
      if (dayIdx !== -1) {

        updatedLessonDays[parseInt(monthIndex)].splice(dayIdx, 1);
      }
      return updatedLessonDays;
    }
    const removeFromHolidays = (cellId, prevState)=>{
      const hDays = prevState;
      const updatedHolidayDays = { ...hDays };
      const [_, monthIndex, day] = cellId.split("-");
      const month = updatedHolidayDays[parseInt(monthIndex)]
      if (!month) return {};

      const dayIdx = month.findIndex(x => x === parseInt(day));
      if (dayIdx !== -1) {

        updatedHolidayDays[parseInt(monthIndex)].splice(dayIdx, 1);
      }
      return updatedHolidayDays;
    }
    const removeFromHolidayLessons = (cellId, prevState)=>{
      const hLessons = prevState ;
      const updatedHolidayLessons = { ...hLessons };
      const [_, monthIndex, day] = cellId.split("-");
      const month = updatedHolidayLessons[parseInt(monthIndex)]
      if (!month) return {};

      const dayIdx = month.findIndex(x => x === parseInt(day));
      if (dayIdx !== -1) {

        updatedHolidayLessons[parseInt(monthIndex)].splice(dayIdx, 1);
      }
      return updatedHolidayLessons
    }
    if(!category) return;
    
    if (category === "lesson") {
      let updatedLessonDays = { ...lessonDays };
      if(rangeOfCellIds){
        const [_,m,d] = rangeOfCellIds.at(-1).split('-')
        monthIndex=m
        day=d
        // console.log("updated lessons...", updatedLessonDays);
        for(const c in rangeOfCellIds){
          const oldUpdate = updatedLessonDays
          const newUpdate = removeFromLessons(rangeOfCellIds[c], oldUpdate);
          updatedLessonDays = newUpdate;
          // setLessonDays(updatedLessonDays);
        }
        
      }else{
        const [_,m,d] = cellId.split('-')
        monthIndex = m
        day = d
        updatedLessonDays = removeFromLessons(cellId, {...lessonDays});

      }

      if(handlePopover) { 
        togglePopover(parseInt(monthIndex), parseInt(day))
      }
      setLessonDays(updatedLessonDays);
    } else if (category === "holiday") {
      let updatedHolidayDays = {...holidayDays};
      if (rangeOfCellIds) {
        const [_, m, d] = rangeOfCellIds.at(-1).split('-')
        monthIndex = m
        day = d
        for (const c in rangeOfCellIds) {
          const oldUpdate = updatedHolidayDays
          const newUpdate = removeFromHolidays(rangeOfCellIds[c], oldUpdate);
          updatedHolidayDays = newUpdate;
          // setLessonDays(updatedLessonDays);
        }
      }else{
        const [_, m, d] = cellId.split('-')
        monthIndex = m
        day = d
  
        updatedHolidayDays = removeFromHolidays(cellId, {...holidayDays})
      }
      if(handlePopover) { 
        togglePopover(parseInt(monthIndex), parseInt(day))
      }
      setHolidayDays(updatedHolidayDays);
      

    } else if (category === "holidayLesson" || category === "holiday-lesson") {
      let updatedHolidayLessons = {...holidayLessons};
      if (rangeOfCellIds) {
        const [_, m, d] = rangeOfCellIds.at(-1).split('-')
        monthIndex = m
        day = d
        for (const c in rangeOfCellIds) {
          const oldUpdate = updatedHolidayLessons;
          const newUpdate = removeFromHolidayLessons(rangeOfCellIds[c], oldUpdate);
          updatedHolidayLessons = newUpdate;
          // setLessonDays(updatedLessonDays);
        }
      }else{
        const [_, m, d] = cellId.split('-')
        monthIndex = m
        day = d

        updatedHolidayLessons = removeFromHolidayLessons(cellId,{...holidayLessons})
      }
      if(handlePopover) { 
        togglePopover(parseInt(monthIndex), parseInt(day))
      }
      setHolidayLessons(updatedHolidayLessons);
    }
    

  }
  //first remove all other activities from the cell 
  // then add a new activity
  const updateCell = (category) =>{
    // console.log("currentCell", currentCell);
    
    if(currentCell.isRange){
      const {first, last} = currentCell.range;
      const {monthIndex:fm, day:fd} = first;
      const {monthIndex:lm, day:ld} = last;
      if(fm !== lm){
        return;
      }
      
      const rangeOfCellIds = []
      for(let i = fd; i <= ld; i++){
        // addActivityToCell(category, {monthIndex:fm, day:i})
        rangeOfCellIds.push(`cell-${fm}-${i}`)
      }
      // console.log("setting activity for range");
      ['lesson', 'holiday', 'holidayLesson'].forEach(cat=>(
        handleDeleteActivity(null, cat, false, rangeOfCellIds)
      ))
      // return
    }else{
      ['lesson', 'holiday', 'holidayLesson'].forEach(cat=>(
        handleDeleteActivity(`cell-${currentCell.monthIndex}-${currentCell.day}`, cat, null)
      ))
      
    }
    addActivityToCell(category)


  }
  // Add day to specific category from cell menu
  const addActivityToCell = (category, cell = currentCell) => {
    const { monthIndex, day } = cell;
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
      if(cell.isRange){
        const {first, last} = cell.range;
        const {monthIndex:fm, day:fd} = first;
        const {monthIndex:lm, day:ld} = last;
        if(fm !== lm){
          return;
        }
        for(let i = fd; i <= ld; i++){
          updatedDays[fm] = [
            ...new Set([...(updatedDays[fm] || []), i]),
          ];
        }
        
      }else{

        updatedDays[monthIndex] = [
          ...new Set([...(updatedDays[monthIndex] || []), day]),
        ];
      }
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
  const TranslateIcon = () =>(
    <i className="fas fa-language w-4 h-4" />
  )
  
  const removeHighlightSelection = () =>{
    // find any cells that have been highlighted and remove highilighting
    // console.log("removing styles");
    
    const highlightedCells = document.querySelectorAll('.bg-blue-200, .border-blue-500')
    highlightedCells.forEach(cell => {
      cell.classList.remove('bg-blue-200')
      cell.classList.remove('border-l-2')
      cell.classList.remove('border-r-2')
      cell.classList.remove('border-t-2')
      cell.classList.remove('border-b-2')
      cell.classList.remove('rounded-l-lg')
      cell.classList.remove('rounded-r-lg')
      cell.classList.remove('border-blue-500')
    })
  }
  const highlightSelection = ()=> {
    const userSelection = window.getSelection().getRangeAt(0);
    let sc = userSelection.startContainer;
    let ec = userSelection.endContainer;
    const startContainerIsCell = (
      (userSelection.startContainer.tagName === "TD" &&
      userSelection.startContainer.id.includes("cell-")) ||
      (userSelection.startContainer.tagName === "SPAN" &&
        userSelection.startContainer.parentElement.id.includes("cell-") && (sc = userSelection.startContainer.parentElement)) 
    )
    const endContainerIsCell = (
      (userSelection.endContainer.tagName === "TD" &&
        userSelection.endContainer.id.includes("cell-")) ||
      (userSelection.endContainer.tagName === "SPAN" &&
        userSelection.endContainer.parentElement.id.includes("cell-") && (ec = userSelection.endContainer.parentElement))
    )
    if (startContainerIsCell && endContainerIsCell){
      return highlightRange({sc,ec});

    }
    return;
    
  }
  
  const highlightRange = (range) => {
    const {ec, sc} =range;
    const firstCell = sc.id;
    const lastCell = ec.id;
   
    markHighlightedCellsInRange(firstCell,lastCell)
  }
  const markHighlightedCellsInRange = (firstCell, lastCell) => {
    const table = document.querySelector('.schedule-table');
    const rows = table.querySelectorAll('tr');
    const [f_, fm, fd] = firstCell.split("-")
    const [l_, lm, ld] = lastCell.split("-")
    const rangeDirection = (()=>{
      if(fm === lm){
        return fd > ld ? 'up' : 'down'
      }
      if ( fd===ld){
        return fm > lm ? 'left' : 'right'
      }
      if (fm > lm && fd > ld){
        return 'left-diagonal'
      }
      if (fm > lm && fd < ld){
        return 'right-diagonal'
      }
      if (fm < lm && fd > ld){
        return 'right-diagonal'
      }
      if (fm < lm && fd < ld){
        return 'left-diagonal'
      }
    })();
    const highlightedCells = Array.from(rows).reduce((acc, row, index) => {
      const cells = Array.from(row.children);
      const firstCellIndex = cells.findIndex(cell=>cell.id === firstCell);
      const lastCellIndex = cells.findIndex(cell=>cell.id === lastCell);
      if(firstCellIndex !== -1 && lastCellIndex !== -1){
        if(rangeDirection === 'up'){
          for(let i = firstCellIndex; i <= lastCellIndex; i++){
            acc.push(cells[i])
          }
        }else if(rangeDirection === 'down'){
          for(let i = lastCellIndex; i >= firstCellIndex; i--){
            acc.push(cells[i])
          }
        }else if(rangeDirection === 'left'){
          for(let i = fm; i <= lm; i++){
            acc.push(rows[i].children[fd])
          }
        }else if(rangeDirection === 'right'){
          for(let i = lm; i <= fm; i++){
            acc.push(rows[i].children[ld])
          }
        }else if(rangeDirection === 'right-diagonal'){
          let x = fd;
          for(let i = fm; i <= lm; i++){
            acc.push(rows[i].children[x])
            x++;
          }
        }else if (rangeDirection === 'left-diagonal'){
          let x = fd;
          for(let i = fm; i <= lm; i++){
            acc.push(rows[i].children[x])
            x--;
          }
        }
      }
      return acc;
    }, []);
    // console.log(highlightedCells);
    handleCellRangeSelect(null, { first: { monthIndex: parseInt(fm), day: parseInt(fd) }, last: { monthIndex: parseInt(lm), day: parseInt(ld) } });
    
    (
      highlightedCells.forEach((cell, x)=> {
        cell.classList.add('bg-blue-200', 'border-blue-500');
        if (x === 0) {
          cell.classList.add('rounded-l-lg', 'border-l-2', 'border-t-2', 'border-b-2');
        } else if (x === highlightedCells.length - 1) {
          cell.classList.add('rounded-r-lg', 'border-r-2', 'border-t-2', 'border-b-2');
        } else {
          cell.classList.add('border-t-2', 'border-b-2');
        }
      })
    )

    
    
  }

  const DaysInput= ()=>(
    <div className="flex flex-col">
      <h5 className="text-lg font-semibold mb-2">{currentLabels.lessonSettings}</h5>
      <p className="text-red-500 font-bold text-sm mb-4">{currentLabels.lessonSettingsTip}</p>
      <div className="flex flex-row flex-wrap lg:flex-col gap-2">
        <div className="mb-4"> {/* Replaced FormGroup */}
          <label htmlFor="lessonDays" id="lessonDaysTooltip" className="block text-gray-700 text-sm font-bold mb-2">
            {currentLabels.daysForLessons}
          </label>
          <input
            type="text"
            id="lessonDays"
            placeholder="Enter days (comma separated)"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <div id="lessonDaysTooltip" className="text-sm text-gray-500 mt-1">
            {currentTooltips.daysForLessons}
          </div>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xl flex items-center mt-2" onClick={addLessonDays}>
            <span>{currentLabels.addButton}</span>
          </button>
        </div>
        <div className="mb-4"> {/* Replaced FormGroup */}
          <label htmlFor="holidayDays" id="holidayDaysTooltip" className="block text-gray-700 text-sm font-bold mb-2">
            {currentLabels.holidays}
          </label>
          <input
            type="text"
            id="holidayDays"
            placeholder="Enter days (comma separated)"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <div id="holidayDaysTooltip" className="text-sm text-gray-500 mt-1">
            {currentTooltips.holidays}
          </div>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xl flex items-center mt-2" onClick={addHolidayDays}>
            <span>{currentLabels.addButton}</span>
          </button>
        </div>
        <div className="mb-4"> {/* Replaced FormGroup */}
          <label htmlFor="holidayLessons" id="holidayLessonsTooltip" className="block text-gray-700 text-sm font-bold mb-2">
            {currentLabels.lessonsOnHolidays}
          </label>
          <input
            type="text"
            id="holidayLessons"
            placeholder="Enter days (comma separated)"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <div
            id="holidayLessonsTooltip"
            className="text-sm text-gray-500 mt-1"
          >
            {currentTooltips.lessonsOnHolidays}
          </div>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xl flex items-center mt-2" onClick={addHolidayLessons}>
            <span>{currentLabels.addButton}</span>
          </button>
        </div>
      </div>
    </div>
  )

  const LeftSideBar =()=>(
    <div
      className="p-3 border-r flex flex-row flex-wrap lg:flex-col min-w-[250px] box-border"
    >
      <DaysInput />
      {/* Legend */}
      <div className="lg:m-0 mx-3 px-3 box-border">
        <h5 className="text-lg font-semibold mb-2">{currentLabels.legendTitle}</h5>
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <div className="w-5 h-5 border border-black mr-2 bg-gray-400"></div>
            <span>{currentLabels.daysForLessons}</span>
          </div>
          <div className="flex items-center mb-2">
            <div className="w-5 h-5 border border-black mr-2 bg-red-500"></div>
            <span>{currentLabels.holidays}</span>
          </div>
          <div className="flex items-center mb-2 ">
            <div className="w-5 h-5 border border-black mr-2 bg-yellow-400"></div>
            <span>{currentLabels.lessonsOnHolidays}</span>
          </div>
        </div>
      </div>
    </div>
  )
 
  useEffect(() => {
    const table = document.querySelector('.schedule-table');

    const handleMouseUp = () => {
      if (window.getSelection().toString()) {
        highlightSelection();
      }
    };

    table.addEventListener('mouseup', handleMouseUp);

    return () => {
      table.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  return (
    <div className="flex flex-col bg-white overflow-x-auto">
      <p onClick={toggleLanguage} className="flex justify-center items-center m-3 p-1 border rounded w-12 h-10 cursor-pointer">
        <TranslateIcon/>
        <span>{currentLabels.toggleLanguage}</span>
      </p>
      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar */}
        <LeftSideBar/>

        {/* Schedule Table */}
        <div
          className="flex-grow p-3 box-border"
          id="schedule-table"
        >
          <h5 className="text-lg font-semibold mb-4">{currentLabels.scheduleTitle}</h5>
          <div className="w-full flex justify-between items-center mb-4">
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm" onClick={resetSchedule}>
              {currentLabels.resetButton}
            </button>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={createImagePreview}>
              {currentLabels.exportButton}
            </button>
          </div>
          <div className="table-wrapper">
            <p className="w-full flex flex-nowrap justify-center items-baseline font-bold gap-2 mb-2">
              <label htmlFor="scheduleName" id="scheduleNameTooltip">
                {currentLabels.scheduleName}:
              </label>
              <input
                type="text"
                id="scheduleName"
                className="w-1/4 font-bold border-b border-gray-300 focus:outline-none focus:border-blue-500"
                placeholder=""
              />
            </p>
            <table className="table-auto w-full border-collapse border border-gray-400"> {/* Replaced Table */}
              <thead>
                <tr>
                  <th className="px-2 py-1 border border-gray-400">{' '}</th>
                  <th className="px-2 py-1 border border-gray-400">{' '}</th>
                  {Array.from({ length: 31 }, (_, i) => (
                    <th key={i} className="px-2 py-1 border border-gray-400">{i + 1}</th>
                  ))}
                  <th className="px-2 py-1 border border-gray-400">{currentLabels.totalLessons}</th>
                </tr>
              </thead>
              <tbody>
                {monthsData.map((monthData, monthIndex) => (
                  <tr key={monthIndex} className="h-10">
                    <td className="flex justify-end items-center px-2 py-1 border border-gray-400">
                      <input
                        type="checkbox"
                        checked={selectedMonths[monthIndex]}
                        onChange={() => toggleMonth(monthIndex)}
                        className="mr-2"
                      />
                    </td>
                    <td className="px-2 py-1 border border-gray-400">
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
                          className={`relative text-center align-middle p-1 min-w-[30px] border border-gray-400 ${isHighlighted ? cellClass : ""} ${isInvalidDay ? "bg-gray-200 cursor-not-allowed" : ""}`}
                          
                          onClick={
                            !isInvalidDay
                              ? (e) => {
                                e.stopPropagation();
                                removeHighlightSelection();
                                handleCellClick(e, monthIndex, day)
                              }
                              : undefined
                          }
                          
                        >
                          {isInvalidDay ? (
                            <div className="absolute inset-0 bg-gray-600 opacity-20 pointer-events-none transform -skew-y-12"></div>
                          ) : (
                            
                            <span 
                              onClick={
                                !isInvalidDay
                                  ? (e) => {
                                    e.stopPropagation();
                                    removeHighlightSelection();
                                    handleCellClick(e, monthIndex, day)
                                  }
                                  : undefined
                              }
                            >
                                {
                                  isHighlighted && cellClass ?  "x" : ' '
                                }
                            </span> 
                          )}
                          {!isInvalidDay && (
                            <div // Replaced UncontrolledPopover
                              className={`absolute z-10 bg-white shadow-lg rounded-lg p-4 ${popoverOpen[cellId] ? "block" : "hidden"}`}
                              style={{ minWidth: "200px" }}
                            >
                              <div className="mb-2"> 
                                <label className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    onChange={(e) =>{
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const checkboxes = document.querySelectorAll("input[type='checkbox'][name^='dayType-']");
                                        checkboxes.forEach((checkbox) => {
                                          if (checkbox !== e.target) checkbox.checked = false;
                                        });
                                        updateCell("lesson")
                                      }
                                    }
                                    className="form-checkbox"
                                  />{" "}
                                  <span className="ml-2">{currentLabels.addToLessonDays}</span>
                                </label>
                              </div>
                              <div className="mb-2"> 
                                <label className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    onChange={(e) =>{
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const checkboxes = document.querySelectorAll("input[type='checkbox'][name^='dayType-']");
                                        checkboxes.forEach((checkbox) => {
                                          if (checkbox !== e.target) checkbox.checked = false;
                                        });
                                        updateCell("holiday")
                                      }
                                    }
                                    className="form-checkbox"
                                  />{" "}
                                  <span className="ml-2">{currentLabels.addToHolidayDays}</span>
                                </label>
                              </div>
                              <div className="mb-2"> 
                                <label className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    onChange={(e) =>{
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const checkboxes = document.querySelectorAll("input[type='checkbox'][name^='dayType-']");
                                        checkboxes.forEach((checkbox) => {
                                          if (checkbox !== e.target) checkbox.checked = false;
                                        });
                                        updateCell("holidayLesson")
                                      }
                                    }
                                    className="form-checkbox"
                                  />{" "}
                                  <span className="ml-2">{currentLabels.addToHolidayLessons}</span>
                                </label>
                              </div>
                              <label className="inline-flex items-center mt-2"> 
                                <input
                                  type="checkbox"
                                  checked={makeRecurring}
                                  onChange={handleMakeRecurringChange}
                                  className="form-checkbox"
                                />{" "}
                                <span className="ml-2">
                                  {currentLabels.makeRecurring}
                                </span>
                              </label>
                              
                              <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded mt-2" onClick={()=>{
                                handleDeleteActivity(cellId, getCellClass(monthIndex, day));
                              }}>
                                {currentLabels.removeDay}
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                   <td className="px-2 py-1 border border-gray-400">{calculateTotalLessons(monthIndex)}</td>
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
            <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${imageModalOpen ? 'block' : 'hidden'}`}>
              <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold">Schedule Preview</h4>
                  <button onClick={toggleImageModal} className="text-gray-500 hover:text-gray-700">Close</button>
                </div>
                {
                  imagePreview && imagePreview()
                }
              </div>
            </div>
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
    </div>
  );
};

export default ScheduleBuilder;

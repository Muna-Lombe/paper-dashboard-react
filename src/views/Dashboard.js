
import React, { useState, useEffect } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
import { useDispatch } from "react-redux";
import { addError } from "../variables/slices/errorSlice";
import { endpoints } from "../config";
import { addToast } from "../variables/slices/toastSlice";

function Dashboard() {
  const dispatch = useDispatch();
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalSales: 0,
    totalLectures: 0,
  });
  // Calendar states
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]); // Fetched events
  const [studentRequests, setStudentRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [currentWeekStart]); // Re-fetch when week changes

  const fetchDashboardData = async () => {
    try {
      const summaryResponse = await axios.get(endpoints.dashboard.summary.url);
      setSummary(summaryResponse.data);

      // Fetch calendar events for the current week
      const calendarResponse = await axios.get(endpoints.dashboard.calendarEvents.url, {
        params: {
          startDate: currentWeekStart.toISOString().split('T')[0],
          endDate: new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 days after start
        },
      });
      // Transform fetched events into a map for easier rendering {dayIndex: {time: [events]}}
      const organizedEvents = {};
      calendarResponse.data.events.forEach(event => {
        const eventDate = new Date(event.date);
        const dayOfWeek = eventDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
        if (!organizedEvents[dayOfWeek]) {
          organizedEvents[dayOfWeek] = {};
        }
        if (!organizedEvents[dayOfWeek][event.time]) {
          organizedEvents[dayOfWeek][event.time] = [];
        }
        organizedEvents[dayOfWeek][event.time].push(event);
      });
      setCalendarEvents(organizedEvents);

      const requestsResponse = await axios.get(endpoints.dashboard.studentRequests.get.url);
      setStudentRequests(requestsResponse.data.requests);
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to fetch dashboard data."));
    }
  };

  const handleApproveRejectRequest = async (id, action) => {
    try {
      let response;
      if (action === "approve") {
        response = await axios.post(endpoints.dashboard.studentRequests.approve(id).url);
      } else {
        response = await axios.post(endpoints.dashboard.studentRequests.reject(id).url);
      }
      dispatch(addToast(response.data.message || `Request ${action}d successfully.`));
      fetchDashboardData(); // Refresh data
    } catch (error) {
      dispatch(addError(error.response?.data?.message || `Failed to ${action} request.`));
    }
  };

  const CalendarEvent = ({ time, title, grade, type, color }) => (
    <div className={`p-2 rounded-lg text-white text-sm mb-1 ${color}`}>
      <p className="font-bold">{time}</p>
      <p>{title}</p>
      <p className="text-xs opacity-80">{grade}</p>
      <p className="text-xs opacity-80">{type}</p>
    </div>
  );

  // Calendar Utility Functions
  const daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
  const timeSlots = [];
  for (let i = 9; i <= 22; i++) { // 09:00 to 22:00 (10 PM)
    timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
  }

  const getWeekDays = (startOfWeek) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeekStart);

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const formatDate = (date) => {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getWeekRange = (startOfWeek) => {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)} ${startOfWeek.getFullYear()}`;
  };

  return (
    <div className="h-full w-full ">
      {/* Central Content (col-span-9 from previous design, now col-span-9 of the overall grid when sidebar is external) */}
      <main className="col-span-9">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-5 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Joined Students</p>
              <p className="text-3xl font-bold text-gray-900">{summary?.totalStudents}</p>
            </div>
            <i className="fas fa-users text-blue-500 text-4xl opacity-50"></i>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Sales</p>
              <p className="text-3xl font-bold text-gray-900">${summary?.totalSales?.toFixed(2)}</p>
            </div>
            <i className="fas fa-dollar-sign text-green-500 text-4xl opacity-50"></i>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Lectures</p>
              <p className="text-3xl font-bold text-gray-900">{summary?.totalLectures}</p>
            </div>
            <i className="fas fa-book-open text-purple-500 text-4xl opacity-50"></i>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Calendar</h2>
            <div className="flex items-center space-x-2">
              <button onClick={handlePreviousWeek} className="p-2 rounded-full hover:bg-gray-200"><i className="fas fa-chevron-left text-gray-600"></i></button>
              <span className="text-gray-700">{getWeekRange(currentWeekStart)}</span>
              <button onClick={handleNextWeek} className="p-2 rounded-full hover:bg-gray-200"><i className="fas fa-chevron-right text-gray-600"></i></button>
            </div>
          </div>
          <div className="grid grid-cols-8 text-center border-b pb-2 mb-2">
            <div className="font-semibold text-gray-700">Time</div>
            {weekDays.map((day, index) => (
              <div key={index} className="font-semibold text-gray-700">
                {daysOfWeek[day.getDay()]}
                <p className="text-xs text-gray-500">{formatDate(day)}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-8 gap-1 text-sm">
            {timeSlots.map((time, timeIndex) => (
              <React.Fragment key={timeIndex}>
                <div className="text-right pr-2 font-medium text-gray-700">{time}</div>
                {weekDays.map((day, dayIndex) => {
                  const dayEvents = calendarEvents[day.getDay()]?.[time] || [];
                  return (
                    <div key={dayIndex} className="border-t border-gray-200 pt-1">
                      {dayEvents.map((event, eventIndex) => (
                        <CalendarEvent
                          key={eventIndex}
                          time={event.time}
                          title={event.title}
                          grade={event.grade}
                          type={event.type}
                          color={event.color}
                        />
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>

      {/* Right Sidebar - Student Requests (col-span-3 of the overall grid when sidebar is external) */}
      <aside className="col-span-3 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Students Requests</h2>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{studentRequests.length}</span>
          <a href="#" className="text-blue-600 text-sm">View All</a>
        </div>
        <div className="space-y-4">
          {studentRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src="/path/to/student-avatar.png" alt={request.name} className="h-10 w-10 rounded-full" /> {/* Replace with actual avatar path */}
                <div>
                  <p className="font-semibold text-gray-800">{request.name}</p>
                  <p className="text-sm text-gray-600">{request.grade}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {request.approved ? (
                  <i className="fas fa-check-circle text-green-500 text-xl"></i>
                ) : (
                  <>
                    <button onClick={() => handleApproveRejectRequest(request.id, "approve")}>
                      <i className="fas fa-check-circle text-gray-400 hover:text-green-500 text-xl"></i>
                    </button>
                    <button onClick={() => handleApproveRejectRequest(request.id, "reject")}>
                      <i className="fas fa-times-circle text-gray-400 hover:text-red-500 text-xl"></i>
                    </button>
                  </>
                )}
                <button className="p-1 rounded-full hover:bg-gray-200"><i className="fas fa-ellipsis-v text-gray-500"></i></button>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default Dashboard;

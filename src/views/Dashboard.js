import React, { useState, useEffect, useMemo } from "react";
import { api } from "../api";
import { useDispatch } from "react-redux";
import { addError } from "../variables/slices/errorSlice";
import { endpoints } from "../config";
import { addToast } from "../variables/slices/toastSlice";
import PageHeader from "../components/admin/PageHeader";

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function Dashboard() {
  const dispatch = useDispatch();
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalSales: 0,
    totalLectures: 0,
  });
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState({});
  const [studentRequests, setStudentRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [currentWeekStart]);

  const fetchDashboardData = async () => {
    try {
      const summaryResponse = await api.get(endpoints.dashboard.summary.url);
      setSummary(summaryResponse.data);

      const calendarResponse = await api.get(endpoints.dashboard.calendarEvents.url, {
        params: {
          startDate: currentWeekStart.toISOString().split("T")[0],
          endDate: new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        },
      });

      const organizedEvents = {};
      (calendarResponse.data.events || []).forEach((event) => {
        const eventDate = new Date(event.date);
        const dayOfWeek = eventDate.getDay();
        if (!organizedEvents[dayOfWeek]) organizedEvents[dayOfWeek] = {};
        if (!organizedEvents[dayOfWeek][event.time]) {
          organizedEvents[dayOfWeek][event.time] = [];
        }
        organizedEvents[dayOfWeek][event.time].push(event);
      });
      setCalendarEvents(organizedEvents);

      const requestsResponse = await api.get(endpoints.dashboard.studentRequests.get.url);
      setStudentRequests(requestsResponse.data.requests || []);
    } catch (error) {
      dispatch(
        addError(error.response?.data?.message || "Failed to fetch dashboard data.")
      );
    }
  };

  const handleApproveRejectRequest = async (id, action) => {
    try {
      let response;
      if (action === "approve") {
        response = await api.post(endpoints.dashboard.studentRequests.approve(id).url);
      } else {
        response = await api.post(endpoints.dashboard.studentRequests.reject(id).url);
      }
      dispatch(addToast(response.data.message || `Request ${action}d successfully.`));
      fetchDashboardData();
    } catch (error) {
      dispatch(
        addError(error.response?.data?.message || `Failed to ${action} request.`)
      );
    }
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 9; i <= 18; i++) {
      slots.push(`${i.toString().padStart(2, "0")}:00`);
    }
    return slots;
  }, []);

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

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const getWeekRange = (startOfWeek) => {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return `${formatDate(startOfWeek)} – ${formatDate(endOfWeek)} ${startOfWeek.getFullYear()}`;
  };

  return (
    <div className="pd-page">
      <PageHeader
        title="Dashboard"
        description="Overview of students, lectures, and this week's schedule."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="pd-stat">
          <div>
            <p className="pd-stat-label">Joined Students</p>
            <p className="pd-stat-value">{summary?.totalStudents ?? 0}</p>
          </div>
          <div className="pd-stat-icon">
            <i className="fas fa-users" aria-hidden="true" />
          </div>
        </div>
        <div className="pd-stat">
          <div>
            <p className="pd-stat-label">Total Sales</p>
            <p className="pd-stat-value">
              ${(summary?.totalSales ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="pd-stat-icon">
            <i className="fas fa-dollar-sign" aria-hidden="true" />
          </div>
        </div>
        <div className="pd-stat sm:col-span-2 xl:col-span-1">
          <div>
            <p className="pd-stat-label">Total Lectures</p>
            <p className="pd-stat-value">{summary?.totalLectures ?? 0}</p>
          </div>
          <div className="pd-stat-icon">
            <i className="fas fa-book-open" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="pd-panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--pd-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="pd-display text-lg font-bold">
              Calendar
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePreviousWeek}
                className="pd-btn pd-btn-ghost px-2.5 py-2"
                aria-label="Previous week"
              >
                <i className="fas fa-chevron-left" />
              </button>
              <span className="min-w-[10rem] text-center text-sm font-semibold text-[var(--pd-muted)]">
                {getWeekRange(currentWeekStart)}
              </span>
              <button
                type="button"
                onClick={handleNextWeek}
                className="pd-btn pd-btn-ghost px-2.5 py-2"
                aria-label="Next week"
              >
                <i className="fas fa-chevron-right" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto px-2 py-3">
            <div className="min-w-[640px]">
              <div className="mb-2 grid grid-cols-8 gap-1 px-1 text-center text-xs font-semibold uppercase tracking-wide text-[var(--pd-muted)]">
                <div className="text-left">Time</div>
                {weekDays.map((day, index) => (
                  <div key={index}>
                    <div>{daysOfWeek[day.getDay()]}</div>
                    <div className="font-medium normal-case tracking-normal">
                      {formatDate(day)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-8 gap-1">
                    <div className="pr-2 pt-1 text-right text-xs font-semibold text-[var(--pd-muted)]">
                      {time}
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const dayEvents = calendarEvents[day.getDay()]?.[time] || [];
                      return (
                        <div
                          key={dayIndex}
                          className="min-h-10 rounded-md border border-[var(--pd-border)] bg-[color-mix(in_srgb,var(--pd-canvas-end)_70%,white)] p-1"
                        >
                          {dayEvents.map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className={`mb-1 rounded-md px-1.5 py-1 text-[11px] leading-snug text-white last:mb-0 ${
                                event.color || "bg-[var(--pd-accent)]"
                              }`}
                            >
                              <p className="font-bold">{event.time}</p>
                              <p className="truncate">{event.title}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="pd-panel flex flex-col">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--pd-border)] px-4 py-3">
            <h2 className="pd-display text-lg font-bold">
              Student Requests
            </h2>
            <span className="rounded-md bg-[color-mix(in_srgb,var(--pd-danger)_12%,white)] px-2 py-0.5 text-xs font-bold text-[var(--pd-danger)]">
              {studentRequests.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {studentRequests.length === 0 ? (
              <p className="px-1 py-6 text-center text-sm text-[var(--pd-muted)]">
                No pending student requests.
              </p>
            ) : (
              studentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--pd-border)] px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="pd-avatar text-[0.7rem]">
                      {getInitials(request.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{request.name}</p>
                      <p className="truncate text-xs text-[var(--pd-muted)]">
                        {request.grade}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {request.approved ? (
                      <i className="fas fa-check-circle text-[var(--pd-accent)]" />
                    ) : (
                      <>
                        <button
                          type="button"
                          className="pd-btn pd-btn-ghost px-2 py-1.5 text-[var(--pd-accent)]"
                          onClick={() =>
                            handleApproveRejectRequest(request.id, "approve")
                          }
                          aria-label={`Approve ${request.name}`}
                        >
                          <i className="fas fa-check" />
                        </button>
                        <button
                          type="button"
                          className="pd-btn pd-btn-ghost px-2 py-1.5 text-[var(--pd-danger)]"
                          onClick={() =>
                            handleApproveRejectRequest(request.id, "reject")
                          }
                          aria-label={`Reject ${request.name}`}
                        >
                          <i className="fas fa-times" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;

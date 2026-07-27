import React, { memo, useEffect, useState } from "react";
import { api } from "@/api";
import { addError } from "../../variables/slices/errorSlice";
import { useDispatch } from "react-redux";
import { endpoints } from "@/config";
import { addToast } from "variables/slices/toastSlice";
import useAuth from "../../variables/hooks/useAuth";
import PageHeader from "../admin/PageHeader";

const CourseScraper = () => {
  const [targetUrl, setTargetUrl] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [testUrl] = useState("");
  const [currentPUID, setCurrentPUID] = useState("");
  const { getProgressmeUser } = useAuth();
  const sess = sessionStorage;
  const dispatch = useDispatch();

  useEffect(() => {
    if (sess.getItem("api-token")) {
      setIsAuthed(true);
    } else {
      setIsAuthed(false);
    }
  }, []);

  const handleAuthIn = async (event) => {
    event?.preventDefault();

    let apiToken;
    if (event && event.target && event.target.apiToken) {
      apiToken = event.target.apiToken.value;
    } else {
      apiToken = sess.getItem("api-token");
    }

    if (!apiToken) {
      dispatch(
        addError(
          "API token is missing. Please enter it or ensure it's in session storage."
        )
      );
      return;
    }

    const response = await getProgressmeUser(apiToken);

    if (response.success) {
      setIsAuthed(true);
      setCurrentPUID(response.data?.puid || "");
      dispatch(addToast(response.message || "API Token set successfully!"));
    } else {
      setIsAuthed(false);
      dispatch(addError(response.message || "Failed to set API Token."));
    }
  };

  const handleGetBook = async (e, tUrl) => {
    e.preventDefault();
    try {
      const response = await api.get(
        `${endpoints.paperDashApi.getBook.url}?url=${btoa(targetUrl ?? tUrl) || ""}`,
        {
          headers: {
            Authorization: "Bearer " + sess.getItem("Auth-Token"),
          },
        }
      );
      if (response?.data) {
        sess.setItem("bookId", response.data?.bookId || "nil");
        sess.setItem("bookName", response.data?.bookName || "nil");
      } else {
        dispatch(addError("Book not loaded correctly. Please try again."));
        sess.setItem("bookId", "");
        sess.setItem("bookName", "");
      }
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Failed to get book"));
      if (error.response && error.response.status === 401) {
        dispatch(
          addError(
            "Unauthorized: Please obtain an API token via the Telegram bot."
          )
        );
      }
      sess.setItem("bookId", "");
      sess.setItem("bookName", "");
    }
  };

  const handleLoadLink = async (e, setLinkLoading) => {
    e.preventDefault();
    setLinkLoading(true);

    try {
      const nextUrl = e.target.url.value.trim();
      const response = await api.post(endpoints.paperDashApi.validateUrl.url, {
        url: nextUrl || "",
      });

      if (response.data.url) {
        await handleGetBook(e, nextUrl);
        setTargetUrl(nextUrl);
      } else {
        dispatch(addError("Book link is not correct. Please check."));
        setTargetUrl(testUrl);
      }
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Failed to validate URL"));
      if (error.response && error.response.status === 401) {
        dispatch(
          addError(
            "Unauthorized: Please obtain an API token via the Telegram bot."
          )
        );
      }
      setTargetUrl(testUrl);
    } finally {
      setTimeout(() => setLinkLoading(false), 300);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const bookId = sess.getItem("bookId");
    const userId = sess.getItem("userId");

    if (!bookId || !userId) {
      dispatch(addError("Missing required information (Book ID or User ID)."));
      return;
    }

    try {
      await api.post(
        endpoints.paperDashApi.copyCourse.url,
        {
          bookId,
          userId: String(currentPUID),
        },
        {
          headers: {
            Authorization: "Bearer " + sess.getItem("Auth-Token"),
          },
        }
      );
      dispatch(addToast("Book saved, go to your dashboard to see it"));
      setTimeout(() => {
        setTargetUrl("https://progressme.ru/TeacherAccount/materials/personal");
      }, 10000);
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Failed to copy course"));
      if (error.response && error.response.status === 401) {
        dispatch(
          addError(
            "Unauthorized: Please obtain an API token via the Telegram bot."
          )
        );
      }
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    sess.removeItem("bookId");
    sess.removeItem("bookName");
    setTargetUrl("https://progressme.ru");
    setIsAuthed(false);
    sess.removeItem("api-token");
  };

  const handleClearTokenInput = (e) => {
    e.preventDefault();
    if (e.target.form?.["apiToken"]) {
      e.target.form["apiToken"].value = "";
    } else {
      document.getElementById("api-token-input").value = "";
    }
  };

  const hasNoBookUserId = () =>
    !(sess.getItem("bookId")?.length > 0 && sess.getItem("userId")?.length > 0);

  const LoadingButton = () => (
    <button className="pd-btn pd-btn-primary" disabled>
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
      Loading
    </button>
  );

  const AuthIn = () => (
    <div className="flex h-full min-h-[280px] flex-col justify-center p-4 sm:p-6">
      <h3 className="pd-display text-lg font-bold">
        Scraper Access Authentication
      </h3>
      <p className="mt-2 text-sm text-[var(--pd-muted)]">
        To use the scraper features, you need an API token from our Telegram bot.
      </p>
      <a
        href="https://t.me/omni_lang_bot"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex text-sm font-semibold text-[var(--pd-accent)] hover:underline"
        onClick={() => alert("You will be redirected to the telegram bot")}
      >
        How to get an API token?
      </a>

      <form id="authForm" onSubmit={handleAuthIn} className="mt-5 space-y-3">
        <label htmlFor="api-token-input" className="pd-label">
          Enter your API Token
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            id="api-token-input"
            name="apiToken"
            placeholder="Enter API Token"
            className="pd-input"
          />
          <button
            type="button"
            form="authForm"
            className="pd-btn pd-btn-ghost px-3"
            onClick={handleClearTokenInput}
            aria-label="Clear token"
          >
            <i className="fas fa-xmark text-[var(--pd-danger)]" />
          </button>
        </div>
        <button type="submit" className="pd-btn pd-btn-primary w-full sm:w-auto">
          Submit Token
        </button>
      </form>
    </div>
  );

  const NoTargetUrlSet = () => (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-4 py-10 text-center">
      <i className="fas fa-link mb-3 text-3xl text-[var(--pd-muted)]" aria-hidden="true" />
      <h4 className="max-w-sm text-base font-semibold text-[var(--pd-ink)]">
        Add a book link above to preview and copy it into your library
      </h4>
    </div>
  );

  const BookCopied = () => (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-4 py-10 text-center">
      <h3 className="pd-display text-xl font-bold">
        Book Copied!
      </h3>
      <p className="mt-2 max-w-md text-sm text-[var(--pd-muted)]">
        Log in to{" "}
        <a
          href="https://progressme.ru/Account/Login"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--pd-accent)] hover:underline"
        >
          progressme.ru
          <i className="fas fa-external-link ml-1" aria-hidden="true" />
        </a>{" "}
        to see the book in your personal library.
      </p>
    </div>
  );

  const LoadLink = ({ setLinkLoading }) => (
    <form
      id="load-link"
      className="space-y-3"
      onSubmit={(e) => handleLoadLink(e, setLinkLoading)}
    >
      <div>
        <label htmlFor="progressme-url" className="pd-label">
          ProgressMe book link
        </label>
        <input
          id="progressme-url"
          type="text"
          name="url"
          placeholder="https://progressme.ru/..."
          defaultValue={targetUrl || ""}
          className="pd-input"
        />
        <p className="mt-1.5 text-xs text-[var(--pd-warn)]">
          Check the link and make sure there are no spaces.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="pd-btn pd-btn-primary" type="submit">
          Connect
        </button>
        <button className="pd-btn pd-btn-danger" type="button" onClick={handleReset}>
          Reset
        </button>
      </div>
    </form>
  );

  const BookInfo = ({ disabled = false }) => (
    <form
      id={disabled ? "disabled-save-book" : "save-book"}
      className="space-y-3"
    >
      <div>
        <label className="pd-label" htmlFor={disabled ? "disabled-book-id" : "book-id"}>
          Book ID
        </label>
        <input
          className="pd-input"
          type="text"
          id={disabled ? "disabled-book-id" : "book-id"}
          readOnly
          defaultValue={disabled ? "—" : sess.getItem("bookId") || "—"}
        />
      </div>
      <div>
        <label className="pd-label" htmlFor={disabled ? "disabled-book-name" : "book-name"}>
          Book name
        </label>
        <input
          className="pd-input"
          type="text"
          id={disabled ? "disabled-book-name" : "book-name"}
          readOnly
          defaultValue={disabled ? "—" : sess.getItem("bookName") || "—"}
        />
      </div>
      <div>
        <label className="pd-label" htmlFor={disabled ? "disabled-user-id" : "user-id"}>
          User
        </label>
        <input
          className="pd-input"
          type="text"
          id={disabled ? "disabled-user-id" : "user-id"}
          readOnly
          defaultValue={disabled ? "—" : currentPUID || "—"}
        />
      </div>
      <button
        className="pd-btn pd-btn-primary w-full"
        type="button"
        disabled={disabled || hasNoBookUserId()}
        onClick={handleSave}
      >
        Save to library
      </button>
    </form>
  );

  const IntermediateComponent = ({ linkLoading }) => (
    <div className="relative w-full">
      {hasNoBookUserId() ? (
        linkLoading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <LoadingButton />
          </div>
        ) : (
          <NoTargetUrlSet />
        )
      ) : (
        <BookCopied />
      )}
    </div>
  );

  const MemoizedIframe = memo(({ authedIn, targetUrlSet, linkLoading }) => {
    if (!authedIn) return <AuthIn />;
    if (!targetUrlSet) return <IntermediateComponent linkLoading={linkLoading} />;
    if (linkLoading) {
      return (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-3">
          <span className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--pd-accent)] border-b-transparent" />
          <span className="text-sm text-[var(--pd-muted)]">Page is loading…</span>
        </div>
      );
    }
    return (
      <iframe
        id="iframe_iframe"
        src={targetUrl}
        frameBorder="0"
        allowFullScreen
        className="h-[min(70vh,640px)] w-full rounded-[10px] border border-[var(--pd-border)] bg-white"
        title="course preview"
      />
    );
  });

  const LeftComponent = ({ authedIn, targetUrlSet }) => {
    const [linkLoading, setLinkLoading] = useState(false);
    return (
      <div className="space-y-4">
        <div className="pd-panel p-4 sm:p-5">
          <LoadLink setLinkLoading={setLinkLoading} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
          <div className="pd-panel min-h-[280px] overflow-hidden">
            <MemoizedIframe
              authedIn={authedIn}
              targetUrlSet={targetUrlSet}
              linkLoading={linkLoading}
            />
          </div>
          <div className="pd-panel h-fit p-4">
            <h3 className="mb-3 pd-display text-base font-bold">
              Book details
            </h3>
            <BookInfo disabled={!isAuthed} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pd-page pd-page-wide">
      <PageHeader
        title="Course Scraper"
        description="Connect a ProgressMe book, preview it, and copy it into your library."
      />
      <LeftComponent authedIn={isAuthed} targetUrlSet={!!targetUrl} />
    </div>
  );
};

export default memo(CourseScraper);

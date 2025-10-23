import React, { memo, useEffect, useState } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
import { addError } from "../../variables/slices/errorSlice";
import { useDispatch } from "react-redux";
import { endpoints } from "@/config";
import { addToast } from "variables/slices/toastSlice";

const CourseScraper = () => {
  const [targetUrl, setTargetUrl] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [testUrl, setTestUrl] = useState(
    "https://progressme.ru/SharingMaterial/c172ca5c-2488-4a14-843f-8caf7c993c79",
  );
  const [showLogin, setShowLogin] = useState(false);
  const sess = sessionStorage;
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if api-token exists in sessionStorage or a more robust check if needed
    if (sessionStorage.getItem("api-token")) {
      setIsAuthed(true);
    } else {
      setIsAuthed(false);
    }
  }, []);

  const handleGetBook = async (e, tUrl) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `${endpoints.paperDashApi.getBook.url}?url=${btoa(targetUrl ?? tUrl) || ""}`,
      );
      // console.log("book response", response);
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
        dispatch(addError("Unauthorized: Please obtain an API token via the Telegram bot."));
      }
      sess.setItem("bookId", "");
      sess.setItem("bookName", "");
    }
  };
  const handleLoadLink = async (e, setLinkLoading) => {
    e.preventDefault();
    setLinkLoading(true);

    try {
      const response = await axios.post(
        endpoints.paperDashApi.validateUrl.url,
        {
          url: e.target.url.value.trim() || "",
        },
      );

      if (response.data.url) {
        await handleGetBook(e, response.data.url);
        setTargetUrl(response.data.url);
        setShowLogin(false);
      } else {
        dispatch(addError("Book link is not correct. Please check."));
        setTargetUrl(testUrl);
      }
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Failed to validate URL"));
      if (error.response && error.response.status === 401) {
        dispatch(addError("Unauthorized: Please obtain an API token via the Telegram bot."));
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
    // The API token is now handled via HttpOnly cookie or x-api-token header, so no direct `token` from sessionStorage needed

    if (!bookId || !userId) {
      dispatch(addError("Missing required information (Book ID or User ID)."));
      return;
    }

    try {
      await axios.post(endpoints.paperDashApi.copyCourse.url, {
        bookId,
        userId,
      });
      dispatch(addToast( "Book saved, go to your dashboard to see it"))
      setTimeout(() => {
        setTargetUrl("https://progressme.ru/TeacherAccount/materials/personal");
      }, 10000);
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Failed to copy course"));
      if (error.response && error.response.status === 401) {
        dispatch(addError("Unauthorized: Please obtain an API token via the Telegram bot."));
      }
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    sess.removeItem("bookId");
    sess.removeItem("bookName");
    setTargetUrl("https://progressme.ru");
    setShowLogin(true);
    setIsAuthed(false); // Reset authentication status
    sessionStorage.removeItem("api-token"); // Clear any stored API token
  };

  const hasNoBookUserId = () =>
    !(sess.getItem("bookId")?.length > 0 && sess.getItem("userId")?.length > 0);

  // Components
  const LoadingButton = () => (
    <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed" disabled>
      <span className="animate-spin inline-block w-4 h-4 mr-2 border-b-2 border-white rounded-full"></span>
      Loading
    </button>
  );

  const AuthIn = () => {
    return (
      <div className="w-3/4 h-full p-4">
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Scraper Access Authentication</h3>
          <p className="text-gray-700 text-sm">
            To use the scraper features, you need an API token.
            <br />
            Please obtain your API token by registering through our Telegram bot.
            <br />
            
            <a href="https://t.me/omni_lang_bot" target="_blank"  className="text-blue-500 hover:underline" onClick={() => alert("You will be redirected to the telegram bot")}>How to get an API token?</a>
          </p>
        </div>
        {/* Optionally, add a field here to manually enter an API token if you want to support that flow */}
        <button 
          onClick={() => {
            // On click, re-evaluate if the API token is now available
            if (sessionStorage.getItem("api-token")) {
              setIsAuthed(true); // If token is found, set authed state to true
              setShowLogin(false); // Hide the AuthIn component
            } else {
              // Optionally, inform the user that the token is still missing
              dispatch(addError("API token not found. Please ensure you have obtained it via the Telegram bot."));
            }
          }} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          I have an Access Token
        </button>
      </div>
    );
  };

  const NoTargetUrlSet = () => (
    <div className="absolute inset-0 w-full flex flex-col justify-center items-center p-2">
      <i className="fas fa-arrow-alt-circle-up text-gray-400 text-5xl mb-3 transform -rotate-90"></i>
      <h4 className="w-3/4 text-center mt-4 text-lg font-semibold">
        Add the link to your book up here and see the magic
      </h4>
    </div>
  );

  const BookCopied = () => (
    <div className="absolute inset-0 w-full flex flex-col justify-center items-center my-5 p-2">
      <div className="w-full h-full text-center">
        <h3 className="text-2xl font-bold mb-2">Book Copied!</h3>
        <h5 className="text-lg text-gray-700">
          Log in to
          <a
            href="https://progressme.ru/Account/Login"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline ml-1"
          >
            progressme.ru
            <i className="fas fa-external-link ml-1" aria-hidden="true"></i>
          </a>
          to see the book in your personal library
        </h5>
      </div>
    </div>
  );

  const LoadLink = ({ setLinkLoading }) => (
    <form
      id="load-link"
      className="w-3/4 space-y-4"
      onSubmit={(e) => handleLoadLink(e, setLinkLoading)}
    >
      <div className="w-full">
        <input
          type="text"
          name="url"
          placeholder="progressme link"
          defaultValue={targetUrl || ""}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
        />
        <div className="text-red-500 text-xs italic mb-2">
          Please check the link and make sure there are no spaces.
        </div>
        <div className="flex space-x-2">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">
            Connect
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            type="button"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
    </form>
  );

  const BookInfo = ({ disabled = false }) => (
    <form id={disabled ? "disabled-save-book" : "save-book"} className="space-y-4">
      <div className="w-full">
        <input
          className="mb-1 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          id={disabled ? "disabled-book-id" : "book-id"}
          readOnly
          defaultValue={
            disabled ? "book id" : sessionStorage.getItem("bookId") || "book id"
          }
        />
        <input
          className="my-1 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          id={disabled ? "disabled-book-name" : "book-name"}
          readOnly
          defaultValue={
            disabled ? "book name" : sessionStorage.getItem("bookName") || "book name"
          }
        />
        <input
          className="mt-1 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          id={disabled ? "disabled-user-id" : "user-id"}
          readOnly
          defaultValue={
            disabled ? "user name" : sessionStorage.getItem("userId") || "user name"
          }
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
          type="button"
          disabled={disabled || hasNoBookUserId()}
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </form>
  );

  const IntermediateComponent = ({ linkLoading }) => (
    <div className="w-full relative">
      <div className="w-full h-full bg-cover" style={{ backgroundImage: `url('https://static.tildacdn.com/tild3633-3338-4961-b237-633361646262/Footer_Bg.svg')` }}>
      </div>
      {hasNoBookUserId() ? (
        linkLoading ? (
          <LoadingButton />
        ) : (
          <NoTargetUrlSet />
        )
      ) : (
        <BookCopied />
      )}
    </div>
  );

  const MemoizedIframe = memo(({ authedIn, targetUrlSet, linkLoading }) =>
    authedIn ? (
      targetUrlSet ? (
        linkLoading ? (
          <div className="w-full h-full flex flex-col justify-center items-center">
            <span className="animate-spin inline-block w-12 h-12 border-b-2 border-gray-900 mb-3 rounded-full"></span>
            <span className="mt-2">Page is loading...</span>
          </div>
        ) : (
          <div className="w-full relative">
            {!authedIn ? (
              <div
                className="absolute inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-10"
              >
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  type="button"
                  disabled={false}
                  onClick={() => setShowLogin(true)}
                >
                  Login
                </button>
              </div>
            ) : (
              <></>
            )}
            <iframe
              id="iframe_iframe"
              src={targetUrl}
              frameBorder="0"
              allowFullScreen={true}
              className="w-full h-full min-h-[500px]"
              title="course preview"
            />
          </div>
        )
      ) : (
        <IntermediateComponent linkLoading={linkLoading} />
      )
    ) : (
      <AuthIn />
    )
  );

  const LeftComponent = ({ authedIn, targetUrlSet }) => {
    const [linkLoading, setLinkLoading] = useState(false);
    return (
      <div className="w-full">
        <div className="lg:w-10/12">
          <LoadLink setLinkLoading={setLinkLoading} />
        </div>
        <div className="lg:w-10/12 h-full">
          <div
            className="w-full h-full"
            style={{ minHeight: "500px" }}
          >
            <MemoizedIframe
              authedIn={authedIn}
              targetUrlSet={targetUrlSet}
              linkLoading={linkLoading}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full">
      <div className="relative flex flex-col min-w-0 break-words bg-white rounded-lg mb-6 shadow-lg h-full">
        <div className="px-4 py-3 mb-0 bg-white rounded-t-lg flex flex-col justify-between items-center">
          <h4 className="text-xl font-semibold">Course Scraper</h4>
        </div>
        <div className="flex-auto p-4 h-full">
          <div className="h-full w-full overflow-hidden flex flex-row">
            <LeftComponent authedIn={isAuthed} targetUrlSet={!!targetUrl} />
            <div className="sm:w-1/4">
              <BookInfo disabled={!isAuthed} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(CourseScraper);

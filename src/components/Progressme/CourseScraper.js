import React, { memo, useEffect, useState } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
import { addError } from "../../variables/slices/errorSlice";
import { useDispatch } from "react-redux";
import { endpoints } from "@/config";
import { addToast } from "variables/slices/toastSlice";
import useAuth from "../../variables/hooks/useAuth";

const CourseScraper = () => {
  const [targetUrl, setTargetUrl] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [testUrl, setTestUrl] = useState(
    "https://progressme.ru/SharingMaterial/c172ca5c-2488-4a14-843f-8caf7c993c79",
  );
  const [currentPUID, setCurrentPUID] = useState("")
  const {getProgressmeUser} = useAuth();
  const sess = sessionStorage;
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if api-token exists in sessionStorage or a more robust check if needed
    if (sess.getItem("api-token")) {
      setIsAuthed(true);
    } else {
      setIsAuthed(false);
    }
  }, []);

  const handleAuthIn = async (event) =>{
    event?.preventDefault(); // Use optional chaining to handle both form submission and button click

    let apiToken;
    if (event && event.target && event.target.apiToken) {
      // Coming from form submission
      apiToken = event.target.apiToken.value;
    } else {
      // Coming from "I have an Access Token" button
      apiToken = sess.getItem("api-token");
    }

    if (!apiToken) {
      dispatch(addError("API token is missing. Please enter it or ensure it's in session storage."));
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
      const response = await axios.get(
        `${endpoints.paperDashApi.getBook.url}?url=${btoa(targetUrl ?? tUrl) || ""}`,
        {
          headers:{
            
            'Authorization': 'Bearer ' + sess.getItem('Auth-Token')
          },
          // withCredentials: true,
        }
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
        userId: currentPUID,
      },{
        headers: {
          "Authorization": "Bearer "+sess.getItem("Auth-Token"),
        },
        // withCredentials: true,
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
    setIsAuthed(false); // Reset authentication status
    sess.removeItem("api-token"); // Clear any stored API token
  };

  const handleClearTokenInput = (e) => {
    e.preventDefault();
    if(e.target.form?.['apiToken'] ){
      e.target.form['apiToken'].value = ""
    }else{
       document.getElementById('api-token-input').value = ""
    }

  }

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
          <p className="text-gray-700 text-sm mb-4">
            To use the scraper features, you need an API token.
            <br />
            Please obtain your API token by registering through our Telegram bot.
            <br />
            <a href="https://t.me/omni_lang_bot" target="_blank"  className="text-blue-500 hover:underline" onClick={() => alert("You will be redirected to the telegram bot")}>How to get an API token?</a>
          </p>
        </div>

        <form id="authForm" onSubmit={handleAuthIn} className="w-full">
          <label htmlFor="api-token-input" className="block text-gray-700 text-sm font-bold mb-2">Enter your API Token:</label>
          <div className=" flex justify-between items-center border rounded focus:outline-1 focus:ring-1 focus:shadow-outline">
            <input
              type="text"
              id="api-token-input"
              name="apiToken"
              placeholder="Enter API Token"
              className=" appearance-none  w-11/12 py-3 px-3 text-gray-700 leading-tight focus:border-0 focus:ring-0 focus:outline-0"
            />
            <button type="button" form="authForm" className="p-1 bg-inherit cursor-pointer" onClick={handleClearTokenInput}>
              <i className="w-auto fas fa-xmark text-red-500 text-3xl opacity-50"></i>
            </button>
          </div>

          <button
            type="submit"
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            Submit Token
          </button>
        </form>
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
          Log in to{" "} 
          <a
            href="https://progressme.ru/Account/Login"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline ml-1"
          >
            progressme.ru
            <i className="fas fa-external-link ml-1" aria-hidden="true"></i>
          </a>
          {" "}to see the book in your personal library
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
            disabled ? "book id" : sess.getItem("bookId") || "book id"
          }
        />
        <input
          className="my-1 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          id={disabled ? "disabled-book-name" : "book-name"}
          readOnly
          defaultValue={
            disabled ? "book name" : sess.getItem("bookName") || "book name"
          }
        />
        <input
          className="mt-1 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          id={disabled ? "disabled-user-id" : "user-id"}
          readOnly
          defaultValue={
            disabled ? "user name" : currentPUID || "user name"
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
      <div className="w-full flex flex-wrap gap-2 ">
        <div className="lg:w-10/12 w-full">
          <LoadLink setLinkLoading={setLinkLoading} />
        </div>
        <div className="lg:w-8/12 w-full h-full order-3 lg:order-none">
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
        <div className="lg:w-3/12 w-xs order-2 lg:order-none">
          <BookInfo disabled={!isAuthed} />
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
        <div className="flex-auto p-4 h-full overflow-scroll">
          <LeftComponent authedIn={isAuthed} targetUrlSet={!!targetUrl} />
        </div>
      </div>
    </div>
  );
};

 export default memo(CourseScraper);

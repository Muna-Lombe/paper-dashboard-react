import React, { useState, useEffect } from "react";
import { api } from "@/api";
import { addError } from "../../variables/slices/errorSlice";
import { useDispatch } from "react-redux";
import { endpoints } from "@/config";
import { addToast } from "variables/slices/toastSlice";
import { useNavigate } from "react-router-dom";
import useAuth from "variables/hooks/useAuth";

const CourseScraperV2 = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookDetails, setBookDetails] = useState({
    bookId: "",
    bookName: "",
    userId: "",
  });
  const sess = sessionStorage;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useAuth(); // Get isAuthenticated and userId from useAuth hook

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  // on page load, check if there is a bookId in session storage and remove it
  useEffect(() => {});

  const handleLoadLink = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post(
        endpoints.paperDashApi.validateUrl.url,
        {
          url: e.target?.[0]?.value.trim() || "",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Authorization": "Bearer " + sess.getItem("Auth-Token"),
          },
        }
      );

      if (response.data.url) {
        const bookResponse = await api.get(
          `${endpoints.paperDashApi.getBook.url}?url=${btoa(response.data.url)}`,
        );
        setUrl(response.data.url);
        setBookDetails({
          bookId: bookResponse.data?.bookId || "",
          bookName: bookResponse.data?.bookName || "",
          userId: userId || "", // Use userId from useAuth
        });
      } else {
        dispatch(addError("Invalid URL"));
      }
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Failed to load URL"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setBookDetails({ bookId: "", bookName: ""});
  };

  const handleResetId = () => {
    sess.removeItem("userId");
    // setIsAuthenticated(false); // No longer managing local auth state
    setBookDetails(ps=>({...ps, userId:""}));
  };

  const handleSave = async (e) => {
    console.log("Saving book details:", bookDetails);
    e.preventDefault();
    const { bookId, userId } = bookDetails;
    const token = sess.getItem("Auth-Token");

    if (!bookId || !userId || !token) {
      dispatch(addError("Missing required information"));
      return;
    }

    try {
      await api.post(
        endpoints.paperDashApi.copyCourse.url,
        {
          bookId,
          userId,
          token,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Authorization": "Bearer "+ sess.getItem("Auth-Token"),
          },
        }
      );
      dispatch(addToast("Book saved, go to your dashboard to see it"));
      setTimeout(() => {
        setUrl("https://progressme.ru/TeacherAccount/materials/personal");
      }, 10000);
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Failed to copy course"));
    }
  };

  const LoadingComponent = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <p className="mt-3 text-blue-500">Loading your content...</p>
    </div>
  );


  const BookDetails = () => {
    const Details = () => (
      <div className="flex flex-col justify-between items-baseline gap-4">
        <input
          value={bookDetails.bookId}
          readOnly
          placeholder="Book ID"
          className="m-2 p-2 border border-gray-300 rounded-md max-w-[200px]"
        />
        <input
          value={bookDetails.bookName}
          readOnly
          placeholder="Book Name"
          className="m-2 p-2 border border-gray-300 rounded-md max-w-[200px]"
        />
        <div className="relative w-auto">
          <input
            value={bookDetails.userId || userId}
            readOnly
            placeholder="User ID"
            className={`m-2 p-2 border rounded-md max-w-[200px] ${isAuthenticated ? "border-green-500" : "border-red-500"}`}
          />
          <span
            className={`${isAuthenticated ? "absolute top-1/2 right-2 -translate-y-1/2" : "hidden"} w-1/4 h-1/2 border border-red-500 text-sm flex items-center justify-center z-10 cursor-pointer`}
            onClick={handleResetId}
          >
            <i className="fas fa-times text-red-500 text-xl"></i>
          </span>
        </div>
      </div>
    );
    return(
      <>
        <div className="md:w-1/2 p-3 flex flex-col justify-between items-baseline gap-4 w-full max-w-[150px]">
          <div className="w-full flex flex-col justify-evenly">
            <Details/>
          </div>
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full max-w-[80px]"
            disabled={!isAuthenticated || !bookDetails.bookId || !bookDetails.userId}
          >
            Save
          </button>
        </div>
        <div className="md:w-1/2 p-3 w-full flex flex-wrap justify-end items-baseline gap-4 lg:hidden xl:hidden 2xl:hidden">
          <div className="w-full flex justify-end">
            <Details/>
          </div>
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full max-w-[200px]"
            disabled={!isAuthenticated || !bookDetails.bookId || !bookDetails.userId}
          >
            Save
          </button>
        </div>
      </>
    );
  };

  const BookContent = () => {
    // Link loaded but not authenticated
    useEffect(() => {
      const iframe = document.querySelector("iframe");
      const handleIframeLoad = () => {
        setIsLoading(false);
      };

      if (iframe) {
        iframe.addEventListener("load", handleIframeLoad);
      }

      return () => {
        if (iframe) {
          iframe.removeEventListener("load", handleIframeLoad);
        }
      };
    }, [url]);
    // Link loading state
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-3"></div>
          <p className="text-blue-500">Loading your content...</p>
        </div>
      );
    }

    // Link loaded and authenticated
    if (url && isAuthenticated) {
      return (
        <div className="w-full h-full">
          <iframe
            src={url}
            title="Course Content"
            className="w-full h-full border-none min-h-[500px]"
          />
        </div>
      );
    }

    if (url && !isAuthenticated) {
      return (
        <div className="relative w-full h-full min-w-[35rem] aspect-w-2 aspect-h-1">
          <div className="w-full h-full">
            <iframe src={url} title="Course Content" className="w-full h-full" />
          </div>
          <div
            className="w-full h-full absolute top-0 left-0 bg-black bg-opacity-70 flex flex-col justify-center items-center"
          >
            <h4 className="text-white mb-1 text-lg">
              Please authenticate to view the content
            </h4>
          </div>
        </div>
      );
    }

    // No link but authenticated
    if (!url && isAuthenticated) {
      return (
        <div className="text-center p-4 flex flex-col items-center">
          <i className="fas fa-arrow-alt-circle-up text-gray-400 text-5xl mb-3 transform -rotate-90"></i>
          <p className="text-lg font-semibold">Add your link above to get started</p>
        </div>
      );
    }

    // No link and not authenticated (initial state) - should redirect
    return (
      <div className="flex flex-col items-center p-4">
        <p className="text-center mb-4">
          Please log in to access course content.
        </p>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white rounded-lg mb-6 shadow-lg h-full">
      <div className="px-4 py-3 mb-0 bg-white rounded-t-lg flex flex-col justify-between items-center">
        <h4 className="text-xl font-semibold">Course Scraper</h4>
        <form
          id="load-link"
          className="w-3/4 flex justify-start items-baseline gap-3"
          onSubmit={(e) => handleLoadLink(e)}
        >
          <div className="w-full">
            <input
              type="text"
              placeholder="progressme link"
              defaultValue={url || ""}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
            />
            <div className="text-red-500 text-xs italic mb-2">
              Please check the link and make sure there are no spaces.
            </div>
            <div className="flex justify-end mt-2">
              <button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
                <i className="fas fa-link mr-1 md:hidden"></i>
                <span className="hidden md:inline">Connect</span>
              </button>
              <button type="button" onClick={handleReset} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                <i className="fas fa-undo mr-1 md:hidden"></i>
                <span className="hidden md:inline">Reset</span>
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className="flex-auto p-4 flex flex-col md:flex-row h-full">
        <div className="w-full p-3 order-2 md:order-1">
          {BookContent()}
        </div>
        <div className="p-3 order-1 md:order-2 bg-gray-100 border-l border-gray-200 w-auto">
          <BookDetails />
        </div>
      </div>
    </div>
  );
};

export default CourseScraperV2;

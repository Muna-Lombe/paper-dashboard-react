import { api } from '@/api';
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion';
import { usePositionReorder } from '../../variables/hooks/usePositionReorder';
import { useMeasurePosition } from '../../variables/hooks/useMeasurePosition';
import JsonStyleViewerV1 from './JsonStyleViewerV1';
import JsonStyleViewerV2 from './JsonStyleViewerV2';
// import useWebSocket, { ReadyState, useSocketIO } from 'react-use-websocket'
import SectionViewer1 from './SectionViewerV1';
import SectionViewerV2 from './SectionViewerV2';
import SectionViewerV3 from './SectionViewerV3';
import SectionViewerV4 from './SectionViewerV4';
import SectionViewerV5 from './SectionViewerV5';
import SectionViewerV6 from './SectionViewerV6';
import SectionViewerV7 from './SectionViewerV7';
import SectionViewerV8 from './SectionViewerV8';
import SectionViewerV9 from './SectionViewerV9';
// import useSocketWrapper from '../../variables/hooks/useSocketWrapper';
// import sampleBook from '../../variables/sampleBook.json'
// import { resetStateWithNewData } from 'variables/slices/pdfSlices';
import { flattenObject } from 'variables';
import { useDispatch, useSelector } from 'react-redux'
import { updateOrder, updateCorrection, updateData, addCorrection, resetStateWithNewData, removeCorrection, addData } from '../../variables/slices/pdfSlices'
import { endpoints } from '@/config';
import { addError} from "../../variables/slices/errorSlice";
import { addToast } from '../../variables/slices/toastSlice';
import PageHeader from '../admin/PageHeader';

// const response = sampleBook

const CourseBuilder = () => {
  const dispatch = useDispatch();
  const [courseId, setCourseId] = useState("sampleCourse123"); // Placeholder course ID
  const [courseData, setCourseData] = useState(null);
  const [pageRanges, setPageRanges] = useState(0)
  const [pages, setPages] = useState([]);//response.results[0].pages)
  const [currentPage, setCurrentpage] = useState({})
  const [updatedList, updatePosition, updateOrder, updateState] = usePositionReorder([]); // Initialize with empty array
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const text=""
  
  // useEffect to fetch course data
  useEffect(() => {
    if (courseId) {
      fetchCourseData(courseId);
    }
  }, [courseId]);

  const fetchCourseData = async (id) => {
    try {
      const response = await api.get(endpoints.courses.get(id).url);
      setCourseData(response.data); // Assuming response.data contains the full course object
      // Populate state based on fetched courseData
      setPageRanges(response.data.pages.length);
      setPages(response.data.pages.map((p, idx) => ({ ...p, id: idx, active: idx === 0 })));
      setCurrentpage({ id: 0, page: { ...response.data.pages[0], source: response.data.pages[0]?.page_image?.url || "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg" } });
      updateState(response.data.pages[0].blocks || []); // Assuming blocks are part of the page object

      // Reset Redux state with fetched data
      dispatch(resetStateWithNewData(flattenObject(response.data)));

      dispatch(addToast("Course data fetched successfully!"));
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to fetch course data."));
    }
  };

  const handleCreateCourse = async () => {
    try {
      const newCourse = { name: "New Course", description: "A newly created course." }; // Example new course data
      const response = await api.post(endpoints.courses.create.url, newCourse);
      setCourseId(response.data.courseId); // Set the new course ID
      dispatch(addToast(response.data.message || "Course created successfully!"));
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to create course."));
    }
  };

  const handleUpdateCourse = async () => {
    try {
      const response = await api.put(endpoints.courses.update(courseId).url, courseData);
      dispatch(addToast(response.data.message || "Course updated successfully!"));
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to update course."));
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await api.delete(endpoints.courses.delete(courseId).url);
      dispatch(addToast("Course deleted successfully!"));
      setCourseId(null); // Clear course ID and reset state
      setCourseData(null);
      setPageRanges(0);
      setPages([]);
      setCurrentpage({});
      updateState([]);
      dispatch(resetStateWithNewData([]));
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to delete course."));
    }
  };

  // Block Management Functions
  const handleAddBlock = async () => {
    try {
      // Assuming the new block should be added to the current page
      const currentPageId = currentPage.id; 
      const newBlock = { data: "New Block Content", order: updatedList.length }; // Example new block data
      const response = await api.post(endpoints.courses.blocks.add(courseId).url, { pageId: currentPageId, block: newBlock });
      // Assuming the backend returns the full updated page or the new block with an ID
      const addedBlock = response.data.block; // Adjust based on actual API response
      updateState([...updatedList, addedBlock]); // Add to local draggable state
      dispatch(addToast("Block added successfully!"));
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to add block."));
    }
  };

  const handleUpdateBlock = async (blockId, newData) => {
    try {
      const response = await api.put(endpoints.courses.blocks.update(courseId, blockId).url, { data: newData });
      dispatch(addToast(response.data.message || "Block updated successfully!"));
      // Re-fetch course data or update local state to reflect changes
      fetchCourseData(courseId);
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to update block."));
    }
  };

  const handleDeleteBlock = async (blockId) => {
    try {
      await api.delete(endpoints.courses.blocks.delete(courseId, blockId).url);
      dispatch(addToast("Block deleted successfully!"));
      // Re-fetch course data or update local state to reflect changes
      fetchCourseData(courseId);
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to delete block."));
    }
  };

  const toggleImageModal = () => setImageModalOpen(!imageModalOpen);
  // const dispatch = useDispatch()
  const data = useSelector(state => state.pdfData)

  // Removed WebSocket related functions
  // const handleOnMessage = (message, socket) => {
  //   console.log(message)
  //   try {
  //     const jsonData = JSON.parse(message.data)
  //     console.log(jsonData)
  //     if ( jsonData.event === 'fetch-processed-book'){
          
  //       // setData(jsonData["output"]);
  //       dispatch(resetStateWithNewData(flattenObject(jsonData.data)))
  //       socket.sendJsonMessage({ event: 'fetch-processed-book-page', page_number: 0 })
          
  //     }
  //     if (jsonData.event === 'fetch-processed-book-page-range') {
  //       const { bookId, range } = jsonData.data
  //       socket.sendJsonMessage({ event: "fetch-processed-book", 'opts': ['await-pages'] })
          
          

  //       setPageRanges(range)
  //     }
  //     if (jsonData.event === 'fetch-processed-book-page') {
  //       const { bookId, page_number, page } = jsonData.data
  //       setPages(ps=> {
  //         const prevActiveIdx = ps?.findIndex(p=> p.active) || -1
  //         if (prevActiveIdx !== -1 ) {
  //           (ps[prevActiveIdx].active = false) 
  //         }
  //         ps?.push({...page, active:true})
  //         return ps
  //       })
          
          
  //       // flattenObject({ page: currentPage.page }).forEach(pc=>{
  //         //   console.log("pc", pc);
  //         
  //         //   dispatch(addData(pc))
  //         // })
  //       // dispatch(updateData({ pathArray: ["pages"], update: flattenObject({pages:[{...page, page_image:{url:null}}]})}))
          
  //       const newState = data.filter(s => (!(s[0].includes("pages-0-"))))
  //       console.log("newState", newState)
  //       dispatch(resetStateWithNewData(
  //         [
  //           ...newState, 
  //           ...flattenObject({
  //             pages:[{ 
  //               ...page, 
  //               page_image: { url: null } 
  //             }]
  //           })
  //         ]
  //       ))
          
  //       setCurrentpage({ id:page_number, page: { ...page, source: page?.page_image?.url || "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg" } })
          
  //       // setPageRanges(range)
  //     }
  //     // setData(jsonData["output"]);
  //     // dispatch(resetStateWithNewData(flattenObject(jsonData.output.results)))
  //   } catch (error) {
  //     console.error('Error parsing JSON:', error)
  //   }
  // }
  // const handleOnOpen = (ws, socket) => {
  //   console.log('Connected', ws)
  //   socket.sendJsonMessage({ event: 'fetch-processed-book-page-range' })
    
  // }
  // const {
  //   sendMessage,
  //   sendJsonMessage,
  //   lastMessage,
  //   lastJsonMessage,
  //   readyState,
  //   socket
  // } = useSocketWrapper({
  //   url: endpoints.bot.socketUrl,
  //   onOpenCallback: (ev, socket) => handleOnOpen(ev, socket),
  //   onCloseCallback: (ev, socket) => console.log('Disconnected'),
  //   onMessageCallback: (ev, socket) => handleOnMessage(ev, socket),
  //   onErrorCallback: (ev, socket) => console.log('Rerror:', ev.error),

  // })


  const handleGetPage = async (e,id) =>{
    e.preventDefault()
    try {
      const response = await api.get(endpoints.courses.get(courseId).url); // Fetch full course data
      const page = response.data.pages[id]; // Get specific page from fetched data

      if (page) {
        setCurrentpage({ id: id, page: { ...page, source: page?.page_image?.url || "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg" } });
        updateState(page.blocks || []); // Update draggable blocks
        dispatch(resetStateWithNewData(flattenObject(response.data))); // Update Redux state with full course data
      } else {
        dispatch(addError("Page not found."));
      }
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to fetch page."));
    }
  }
  const handleInputValueChange = (e, itemIdx)=>{
    const list = [...updatedList]
    list[itemIdx].data = e.target.value
    console.log(list)
    updateState(list)
    // TODO: Implement API call to update block content
  }
  const handleDelete = (e,itemIdx)=>{
    const list = [...updatedList]
    list.splice(itemIdx, 1)
    updateState(list)
    // TODO: Implement API call to delete block
  }

  
  const SectionViewerWrapper = () => (
    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        {currentPage?.page?.sections?.map((section, idx) => (
          <div key={idx} className="pd-panel p-3">
            <h4 className="mb-2 text-sm font-semibold text-[var(--pd-muted)]">
              Section {idx + 1}
            </h4>
            <SectionViewerV9 section={section} />
          </div>
        ))}
      </div>
      <div className="pd-panel p-3">
        <button
          type="button"
          className="mb-2 w-full rounded-[10px] border border-[var(--pd-border)] px-3 py-2 text-sm font-semibold lg:pointer-events-none"
          onClick={toggleImageModal}
        >
          Source image
        </button>
        {currentPage?.page?.source ? (
          <img
            src={currentPage.page.source}
            className="hidden max-h-[70vh] w-full cursor-pointer rounded-[10px] object-contain lg:block"
            alt="Source"
            onClick={toggleImageModal}
          />
        ) : (
          <p className="py-8 text-center text-sm text-[var(--pd-muted)]">No source image</p>
        )}
        <div
          className={`fixed inset-0 z-50 items-center justify-center bg-[color-mix(in_srgb,var(--pd-ink)_50%,transparent)] p-4 ${
            imageModalOpen ? "flex" : "hidden"
          }`}
        >
          <div className="pd-panel max-h-[90vh] w-full max-w-4xl overflow-auto p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="pd-display text-lg font-bold">
                Image Viewer
              </h4>
              <button type="button" onClick={toggleImageModal} className="pd-btn pd-btn-ghost">
                Close
              </button>
            </div>
            <img
              src={currentPage?.page?.source}
              className="max-h-[75vh] w-full object-contain"
              alt="Source"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pd-page pd-page-wide">
      <PageHeader
        title="Course Builder"
        description="Edit course pages, reorder text blocks, and review source sections."
        actions={
          <>
            <button type="button" onClick={handleCreateCourse} className="pd-btn pd-btn-primary">
              New Course
            </button>
            <button type="button" onClick={handleUpdateCourse} className="pd-btn pd-btn-ghost">
              Save Course
            </button>
            <button type="button" onClick={handleDeleteCourse} className="pd-btn pd-btn-danger">
              Delete
            </button>
          </>
        }
      />

      <div className="pd-panel overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-[var(--pd-border)] px-3 py-3">
          <button
            type="button"
            onClick={(e) => handleGetPage(e, currentPage.id > 0 ? currentPage.id - 1 : 0)}
            className="pd-btn pd-btn-ghost shrink-0 px-2.5 py-2"
            aria-label="Previous page"
          >
            <i className="fas fa-angle-left" />
          </button>
          <div className="flex items-center gap-1">
            {Array(pageRanges)
              .fill("x")
              .map((_, x) => (
                <button
                  key={x}
                  type="button"
                  onClick={(e) => handleGetPage(e, x)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border text-xs font-semibold transition-colors ${
                    currentPage?.id === x
                      ? "border-[var(--pd-accent)] bg-[var(--pd-accent)] text-white"
                      : "border-[var(--pd-border)] bg-[var(--pd-surface)] text-[var(--pd-ink)]"
                  }`}
                >
                  {x + 1}
                </button>
              ))}
          </div>
          <button
            type="button"
            onClick={(e) => handleGetPage(e, currentPage.id + 1)}
            className="pd-btn pd-btn-ghost shrink-0 px-2.5 py-2"
            aria-label="Next page"
          >
            <i className="fas fa-angle-right" />
          </button>
        </div>

        <div className="p-4">
          <p className="mb-4 text-sm">
            <span className="font-semibold text-[var(--pd-muted)]">Page:</span>{" "}
            <span
              className={`font-semibold ${
                currentPage?.page?.page ? "text-[var(--pd-accent)]" : "text-[var(--pd-danger)]"
              }`}
            >
              {currentPage?.page?.page || "no page"}
            </span>
          </p>

          <form id="text-block-editable-form" className="space-y-3 overflow-hidden">
            {updatedList.map((block, idx) => (
              <FormItem
                key={"block-" + idx}
                ind={idx}
                updateOrder={updateOrder}
                updatePosition={updatePosition}
                block={block}
                handleUpdateBlock={handleUpdateBlock}
                handleDeleteBlock={handleDeleteBlock}
              />
            ))}
            <button type="button" onClick={handleAddBlock} className="pd-btn pd-btn-primary">
              Add New Block
            </button>
          </form>

          <SectionViewerWrapper />
        </div>
      </div>
    </div>
  );
}

export default CourseBuilder

const FormItem = ({ block, updateOrder, updatePosition, ind, handleUpdateBlock, handleDeleteBlock }) => {
  const [isdragging, setIsDragging] = React.useState(false);
  const itemRef = useMeasurePosition((pos) => updatePosition(ind, pos));

  return (
    <div className={`relative ${isdragging ? "z-30" : "z-10"}`}>
      <motion.div
        className="rounded-[10px] border border-[var(--pd-border)] bg-[var(--pd-surface)] p-3"
        style={{
          zIndex: isdragging ? 3 : 1,
          cursor: "grab",
        }}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={1}
        layout
        ref={itemRef}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(e, info) => {
          updateOrder(ind, info.offset.y);
          setIsDragging(false);
        }}
        animate={{ scale: isdragging ? 0.98 : 1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 1.02 }}
        onViewportBoxUpdate={(_viewportBox, delta) => {
          !isdragging && updateOrder(ind, delta.y.translate);
        }}
        drag="y"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <label
            htmlFor={"text-block-" + (ind + 1)}
            className="pd-label mb-0"
          >
            Text block {ind + 1}
          </label>
          <button
            type="button"
            onClick={() => handleDeleteBlock(block.id)}
            className="pd-btn pd-btn-danger px-2.5 py-1 text-xs"
          >
            Delete
          </button>
        </div>
        <input
          form="text-block-editable-form"
          type="text"
          name={"block-" + (ind + 1)}
          id={"text-block-" + (ind + 1)}
          placeholder="text"
          defaultValue={block.data}
          onChange={(e) => handleUpdateBlock(block.id, e.target.value)}
          className="pd-input"
        />
      </motion.div>
    </div>
  );
};
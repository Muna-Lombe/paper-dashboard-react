import axios from 'axios';
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
axios.defaults.withCredentials = true;

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
      const response = await axios.get(endpoints.courses.get(id).url);
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
      const response = await axios.post(endpoints.courses.create.url, newCourse);
      setCourseId(response.data.courseId); // Set the new course ID
      dispatch(addToast(response.data.message || "Course created successfully!"));
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to create course."));
    }
  };

  const handleUpdateCourse = async () => {
    try {
      const response = await axios.put(endpoints.courses.update(courseId).url, courseData);
      dispatch(addToast(response.data.message || "Course updated successfully!"));
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to update course."));
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await axios.delete(endpoints.courses.delete(courseId).url);
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
      const response = await axios.post(endpoints.courses.blocks.add(courseId).url, { pageId: currentPageId, block: newBlock });
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
      const response = await axios.put(endpoints.courses.blocks.update(courseId, blockId).url, { data: newData });
      dispatch(addToast(response.data.message || "Block updated successfully!"));
      // Re-fetch course data or update local state to reflect changes
      fetchCourseData(courseId);
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to update block."));
    }
  };

  const handleDeleteBlock = async (blockId) => {
    try {
      await axios.delete(endpoints.courses.blocks.delete(courseId, blockId).url);
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
      const response = await axios.get(endpoints.courses.get(courseId).url); // Fetch full course data
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

  
  const UploadPdf = ()=>{
    const handleUploadPdf = (e)=>{
      e.preventDefault()
      console.log('uploading pdf')
      const formData = new FormData()
      formData.append('pdf', e.target.files[0])
      axios.post('/upload-pdf', formData)
      .then(res=>{
        console.log(res)
      })
      .catch(err=>{
        console.log(err)
      })


    }
    return(
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Upload PDF</h1>
        <form onSubmit={handleUploadPdf}>
          <div className="mb-4">
            <label htmlFor="pdf-file" className="block text-gray-700 text-sm font-bold mb-2">Upload the pdf file</label>
            <input type="file" name="pdf" id="pdf-file" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit</button>
        </form>
      </div>
    )
  }
  

  const JsonStyleViewerWrapper = () =>(
    <div className="w-full flex flex-row h-[800px]">
      <div className="w-3/4 h-full lg:w-1/2 overflow-auto">

        {/* <JsonStyleViewerV2 page={currentPage.page} socket={socket} /> */}
        <JsonStyleViewerV2 page={currentPage.page} />
      </div>
      <div className='w-25 mh-50 lg-w-50'>
        <h3 className='d-none d-lg-flex justify-content-center w-50 pe-none border rounded' >Source image</h3>
        <h3 className='d-flex justify-content-center w-100 d-lg-none pe-auto border rounded' style={{ cursor: 'pointer' }} onClick={toggleImageModal}>Source image</h3>
        {/* <img src={currentPage.page.source_image} alt="source image" /> */}
        <img
          src={currentPage?.page?.source}
          className='w-auto d-none d-lg-block border rounded'
          style={{ cursor: 'pointer' }}
          onClick={toggleImageModal}
        />


        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${imageModalOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold">Image Viewer</h4>
              <button onClick={toggleImageModal} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <img
              src={currentPage?.page?.source}
              className="max-w-full h-auto"
              alt="Source"
            />
          </div>
        </div>

      </div>
      <div className="w-1/4 h-1/2 lg:w-1/2">
        <h3 className="hidden lg:flex justify-center w-1/2 pointer-events-none border rounded">Source image</h3>
        <h3 className="flex justify-center w-1/2 lg:hidden cursor-pointer border rounded" onClick={toggleImageModal}>Source image</h3>
        <img
          src={currentPage?.page?.source}
          className="w-auto hidden lg:block border rounded cursor-pointer"
          onClick={toggleImageModal}
          alt="Source"
        />
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${imageModalOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold">Image Viewer</h4>
              <button onClick={toggleImageModal} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <img
              src={currentPage?.page?.source}
              className="max-w-full h-auto"
              alt="Source"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const SectionViewerWrapper =() =>(
    <div className="flex flex-row">
      <div className="w-1/2">

        {
          currentPage?.page?.sections?.map((section,idx) => (
            <div key={idx}>
              <h4>Section {idx+1}</h4>
              <SectionViewerV9 section={section} />

            </div>
          ))
          
        }
      </div>
      <div className="w-1/2">
        <h3 className="hidden lg:flex justify-center w-1/2 pointer-events-none border rounded">Source image</h3>
        <h3 className="flex justify-center w-1/2 lg:hidden cursor-pointer border rounded" onClick={toggleImageModal}>Source image</h3>
        <img
          src={currentPage?.page?.source}
          className="hidden lg:block"
          alt="Source"
        />
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${imageModalOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold">Image Viewer</h4>
              <button onClick={toggleImageModal} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <img
              src={currentPage?.page?.source}
              className="max-w-full h-auto"
              alt="Source"
            />
          </div>
        </div>
      </div>
    </div>
  )
  return (
    <div className="w-full">
      <div className="relative flex flex-col min-w-0 break-words bg-white rounded-lg mb-6 shadow-lg h-auto px-2">
        <div className="px-4 py-3 mb-0 bg-white rounded-t-lg flex justify-between items-center">
          <h3 className="text-xl font-semibold">Course Builder</h3>
          <div className="space-x-2">
            <button onClick={handleCreateCourse} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">New Course</button>
            <button onClick={handleUpdateCourse} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save Course</button>
            <button onClick={handleDeleteCourse} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete Course</button>
          </div>
        </div>
        <nav className="px-3 flex justify-center" aria-label="Page navigation example">
          <ul className="flex list-none rounded pl-0">
            <li>
              <button onClick={(e)=> handleGetPage(e,(currentPage.id > 0 ?  currentPage.id-1 : 0))} className="first:ml-0 text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid border-blue-500 bg-white text-blue-500">
                <i className="fas fa-angle-left"></i>
              </button>
            </li>
            {Array(pageRanges).fill("x").map((p,x) => (
              <li key={x}>
                <button active={p?.active} onClick={(e) => handleGetPage(e,x)} className={`first:ml-0 text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid border-blue-500 ${p?.active ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}>
                  {x+1}
                </button>
              </li>
            ))}
            <li>
              <button onClick={(e) => handleGetPage(e,currentPage.id + 1)} className="first:ml-0 text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid border-blue-500 bg-white text-blue-500">
                <i className="fas fa-angle-right"></i>
              </button>
            </li>
          </ul>
        </nav>
        <div className="flex-auto p-4" style={{ height: 'auto', minHeight:'200px', maxHeight: '800px' }}>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-full">
              <h3 className="flex items-center">
                <p className="mr-2">Page:</p> 
                <p className={`p-2 ${currentPage?.page?.page ? 'text-blue-500':'text-red-500'} font-medium w-fit h-fit`}>{currentPage?.page?.page || 'no page'}</p>
                </h3>
              </div>
            </div>
            
            <form id="text-block-editable-form" className="overflow-hidden">
            {
              updatedList.map((block, idx) => (
                  <FormItem
                    key={"block-"+idx}
                    ind={idx}
                    updateOrder={updateOrder}
                    updatePosition={updatePosition}
                    block={block}
                    handleUpdateBlock={handleUpdateBlock}
                    handleDeleteBlock={handleDeleteBlock}
                  />
                
              ))
            }
            
            <button type="button" onClick={handleAddBlock} className="mt-2 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Add New Block</button>
          </form>
            {/* <JsonStyleViewerWrapper/> */}
            <SectionViewerWrapper/>
            {/* <SectionViewerV9 section={section} /> */}
          </div>
           
      </div>
    </div>
  )
}

export default CourseBuilder

const FormItem = ({ block, updateOrder, updatePosition, ind, handleUpdateBlock, handleDeleteBlock })=>{
  const [isdragging, setIsDragging] = React.useState(false);

  const itemRef = useMeasurePosition(pos => updatePosition(ind, pos));

  return ( 
    <div className={`p-0 h-20 ${isdragging ? 'z-30 bg-white' : 'z-10 bg-auto'}`}>
      <motion.div
        style={{
          zIndex: isdragging ? 3 : 1,
          background: isdragging ? "white" : "auto",
          height: "80px",
          cursor:'grab'
          }}
        dragConstraints={{
          top: 0,
          bottom: 0
        }}
        dragElastic={1}
        layout
        ref={itemRef}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(e, info) =>{
          console.log("info:", info);
          updateOrder(ind, info.offset.y)
          setIsDragging(false)
        }}
        animate={{
          scale: isdragging ? 0.9 : 1
        }}
        whileHover={{
          scale: 1.03,
          boxShadow: "0px 3px 3px rgba(0,0,0,0.15)"
        }}
        whileTap={{
          scale: 1.04,
          boxShadow: "0px 5px 5px rgba(0,0,0,0.1)"
        }}
        onViewportBoxUpdate={(_viewportBox, delta) => {
          // updatePosition(ind, _viewportBox);
          console.log("change")
          !isdragging && updateOrder(ind, delta.y.translate);
        }}
        drag="y">
        <label htmlFor={"text-block-" + ind + 1} className={`block text-gray-700 text-sm font-bold mb-2 ${isdragging ? 'z-30' : 'z-10'}`}>Text block {ind+ 1}:</label>
          <input 
            form="text-block-editable-form" 
            type="text" 
            name={"block-" + ind+ 1} 
            id={"text-block-" + ind+ 1} 
            placeholder="text" 
            defaultValue={block.data} 
            onChange={(e) => handleUpdateBlock(block.id, e.target.value)} // Updated to call API
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${isdragging ? 'z-30' : 'z-10'}`}
          />

          {/* delete item */}
          <button type="button" onClick={(e)=>handleDeleteBlock(block.id)} className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete</button>
        </motion.div>
      </div>
      
    
  );
}
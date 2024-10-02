import { Axios } from 'axios'
import React, { useState } from 'react'
import { motion } from 'framer-motion';
import { usePositionReorder } from '../../variables/hooks/usePositionReorder';
import { useMeasurePosition } from '../../variables/hooks/useMeasurePosition';
import {
  Card,
  CardImg,
  CardHeader,
  CardBody,
  CardText,
  CardFooter,
  CardTitle,
  Row,
  Col,
  Table,
  Button,
  FormGroup,
  Form,
  Input,
  Label,
  Pagination,
  PaginationLink,
  PaginationItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap'
import JsonStyleViewerV1 from './JsonStyleViewerV1';
import JsonStyleViewerV2 from './JsonStyleViewerV2';
import useWebSocket, { ReadyState, useSocketIO } from 'react-use-websocket'
import SectionViewer1 from './SectionViewerV1';
import SectionViewerV2 from './SectionViewerV2';
import SectionViewerV3 from './SectionViewerV3';
import SectionViewerV4 from './SectionViewerV4';
import SectionViewerV5 from './SectionViewerV5';
import SectionViewerV6 from './SectionViewerV6';
import SectionViewerV7 from './SectionViewerV7';
import SectionViewerV8 from './SectionViewerV8';
import SectionViewerV9 from './SectionViewerV9';
import useSocketWrapper from '../../variables/hooks/useSocketWrapper';
import sampleBook from '../../variables/sampleBook.json'
// import { resetStateWithNewData } from 'variables/slices/pdfSlices';
import { flattenObject } from 'variables';
import { useDispatch, useSelector } from 'react-redux'
import { updateOrder, updateCorrection, updateData, addCorrection, add, resetStateWithNewData, removeCorrection, addData } from '../../variables/slices/pdfSlices'

const response = sampleBook



const CourseBuilder = () => {
  const textBlocks = ([
    {
      'top': 82, 'left': 102, 'width': 330, 'height': 17, 'font': 2, 'data': 'Complete the sentences with him/her/them.'
    }, 
    {
      'top': 108, 'left': 122, 'width': 271, 'height': 17, 'font': 7, 'data': "I don't know those girls. Do you know"
    },  
    {
      'top': 107, 'left': 407, 'width': 44, 'height': 20, 'font': 11, 'data': 'Jb.m .'
    },  
    {
      'top': 130, 'left': 101, 'width': 286, 'height': 17, 'font': 13, 'data': "2 I don't know that man. Do you know"
    },   
    {
      'top': 140, 'left': 398, 'width': 18, 'height': 4, 'font': 18, 'data': '.... ..'
    }, 
    {
      'top': 140, 'left': 419, 'width': 8, 'height': 4, 'font': 21, 'data': '.. .'
    },   
    {
      'top': 140, 'left': 440, 'width': 57, 'height': 4, 'font': 18, 'data': '........ ............ .'
    },   
    {
      'top': 151, 'left': 129, 'width': 287, 'height': 17, 'font': 25, 'data': "don't know those people. Do you know"
    },             
    {
      'top': 162, 'left': 501, 'width': 30, 'height': 4, 'font': 26, 'data': '..... .....'
    }, 
    {
      'top': 173, 'left': 102, 'width': 314, 'height': 17, 'font': 31, 'data': "4 I don't know David's wife. Do you know ..."
    },  
    {
      'top': 184, 'left': 425, 'width': 16, 'height': 4, 'font': 35, 'data': '. .'
    },             
    {
      'top': 195, 'left': 102, 'width': 427, 'height': 17, 'font': 39, 'data': "5 I don't know Mr. Stevens. Do you know ........................ ................... ?"
    }])
  
  const [pageRanges, setPageRanges] = useState(0)
  const [pages, setPages] = useState([]);//response.results[0].pages)
  // { id: 0, page: { ...pages[0], source: "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg" } }
  const [currentPage, setCurrentpage] = useState({})
  const [updatedList, updatePosition, updateOrder, updateState] = usePositionReorder(textBlocks);
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const text=""
  const axios = new Axios()
  const toggleImageModal = () => setImageModalOpen(!imageModalOpen);
  const dispatch = useDispatch()
  const data = useSelector(state => state.pdfData)

  const handleOnMessage = (message, socket) => {
    console.log(message)
    try {
      const jsonData = JSON.parse(message.data)
      console.log(jsonData)
      if ( jsonData.event === 'fetch-processed-book'){
          
        // setData(jsonData["output"]);
        dispatch(resetStateWithNewData(flattenObject(jsonData.data)))
        socket.sendJsonMessage({ event: 'fetch-processed-book-page', page_number: 0 })
        
      }
      if (jsonData.event === 'fetch-processed-book-page-range') {
        const { bookId, range } = jsonData.data
        socket.sendJsonMessage({ event: "fetch-processed-book", 'opts': ['await-pages'] })
        
        

        setPageRanges(range)
      }
      if (jsonData.event === 'fetch-processed-book-page') {
        const { bookId, page_number, page } = jsonData.data
        setPages(ps=> {
          const prevActiveIdx = ps?.findIndex(p=> p.active) || -1
          if (prevActiveIdx !== -1 ) {
            (ps[prevActiveIdx].active = false) 
          }
          ps?.push({...page, active:true})
          return ps
        })
        
        
        // flattenObject({ page: currentPage.page }).forEach(pc=>{
          //   console.log("pc", pc);
          
          //   dispatch(addData(pc))
          // })
        // dispatch(updateData({ pathArray: ["pages"], update: flattenObject({pages:[{...page, page_image:{url:null}}]})}))
        
        const newState = data.filter(s => (!(s[0].includes("pages-0-"))))
        console.log("newState", newState)
        dispatch(resetStateWithNewData(
          [
            ...newState, 
            ...flattenObject({
              pages:[{ 
                ...page, 
                page_image: { url: null } 
              }]
            })
          ]
        ))
          
        setCurrentpage({ id:page_number, page: { ...page, source: page?.page_image?.url || "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg" } })
        
        // setPageRanges(range)
      }
      // setData(jsonData["output"]);
      // dispatch(resetStateWithNewData(flattenObject(jsonData.output.results)))
    } catch (error) {
      console.error('Error parsing JSON:', error)
    }
  }
  const handleOnOpen = (ws, socket) => {
    console.log('Connected', ws)
    socket.sendJsonMessage({ event: 'fetch-processed-book-page-range' })
    
  }
  const {
    sendMessage,
    sendJsonMessage,
    lastMessage,
    lastJsonMessage,
    readyState,
    socket
  } = useSocketWrapper({
    url: 'ws://localhost:8000/ws',
    onOpenCallback: (ev, socket) => handleOnOpen(ev, socket),
    onCloseCallback: (ev, socket) => console.log('Disconnected'),
    onMessageCallback: (ev, socket) => handleOnMessage(ev, socket),
    onErrorCallback: (ev, socket) => console.log('Rerror:', ev.error),

  })
  const handleGetPage = (e,id) =>{
    e.preventDefault()
    // let page;
    // if(id > pages?.length-1){

    //   // axios.get(`https://api.example.com/processed_book/${id}`)
    //   // .then(response => {
    //   //   console.log(response.data)
    //   //   setPages(ps=> ps.push(response.data.page))
    //   // })
    //   // .catch(error => {console.log("error:", error)}
    //   // page=response.data.page
    //   page = pages?.at(-1)
    //   id = pages?.length - 1
    // }else{
    //   page = pages?.[id]

    // }
    // setCurrentpage({ id, page: { ...page, source:"https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg"}})
    let page;
    if(id > pageRanges){

      page = pages?.at(-1)
      id = pages?.length - 1
    }else{
      sendJsonMessage({
        event:'fetch-processed-book-page',
        book_id:1, 
        page_number:id
      })
      // page=response.data.page
      // page = pages?.[id]

    }
    // setCurrentpage({ id, page: { ...page, source:"https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg"}})
  }
  const handleInputValueChange = (e, itemIdx)=>{
    const list = [...updatedList]
    list[itemIdx].data = e.target.value
    console.log(list)
    updateState(list)
    
  }
  const handleDelete = (e,itemIdx)=>{
    const list = [...updatedList]
    list.splice(itemIdx, 1)
    updateState(list)
  }

  
  const FormItem = ({ block, updateOrder, updatePosition, ind })=>{
    const [isdragging, setIsDragging] = React.useState(false);

    const itemRef = useMeasurePosition(pos => updatePosition(ind, pos));

    return ( 
      <FormGroup style={{
        padding: 0,
        height:"80",
        // background:"white",
        // If we're dragging, we want to set the zIndex of that item to be on top of the other items.
        zIndex: isdragging ? 3 : 1,
        background: isdragging ? "white" : "auto"
      }}>
        <motion.div
          style={{
            zIndex: isdragging ? 3 : 1,
            background: isdragging ? "white" : "auto",
            height: "80",
            cursor:'-webkit-grab'
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
          <Label for={"text-block-" + ind + 1} style={{ zIndex: isdragging ? 3 : 1 }}>Text block {ind+ 1}:</Label>
            <Input 
              form="text-block-editable-form" 
              type="text" 
              name={"block-" + ind+ 1} 
              id={"text-block-" + ind+ 1} 
              placeholder="text" 
              defaultValue={block.data} 
              style={{ 
                zIndex: isdragging ? 3 : 1 
              }} 
            />

            {/* delete item */}
            <Button onClick={(e)=>handleDelete(e, ind)}>Delete</Button>
          </motion.div>
        </FormGroup>
        
      
    );
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
      <div>
        <h1>Upload PDF</h1>
        <Form onSubmit={handleUploadPdf}>
          <FormGroup>
            <Label for="pdf-file">Upload the pdf file</Label>
            <Input type="file" name="email" id="pdf-file" placeholder="Course Name" />
          </FormGroup>
          <Button>Submit</Button>
        </Form>
      </div>
    )
  }
  

  const JsonStyleViewerWrapper = () =>(
    <Row className='w-100 d-flex flex-row'>
      <div className='w-75 lg-w-50 '>

        <JsonStyleViewerV2 page={currentPage.page} socket={socket} />
      </div>
      <div className='w-25 lg-w-50'>
        <h3 className='d-none d-lg-flex justify-content-center w-50 pe-none border rounded' >Source image</h3>
        <h3 className='d-flex justify-content-center w-100 d-lg-none pe-auto border rounded' style={{ cursor: 'pointer' }} onClick={toggleImageModal}>Source image</h3>
        {/* <img src={currentPage.page.source_image} alt="source image" /> */}
        <CardImg
          src={currentPage?.page?.source}
          sizes='sm'
          className='w-auto d-none d-lg-block border rounded'
          style={{ cursor: 'pointer' }}
          onClick={toggleImageModal}
        />


        <Modal isOpen={imageModalOpen} toggle={toggleImageModal} size="lg" modalClassName='image-modal d-block'>
          <ModalHeader toggle={toggleImageModal}>close</ModalHeader>
          <ModalBody>
            <CardImg
              src={currentPage?.page?.source}
              sizes='sm'

            />
          </ModalBody>
        </Modal>

      </div>
    </Row>
  )

  const SectionViewerWrapper =() =>(
    <Row className='d-flex flex-row'>
      <Col className='w-50'>

        {
          currentPage?.page?.sections?.map((section,idx) => (
            <div >
              <h4>Section {idx+1}</h4>
              <SectionViewerV9 section={section} />

            </div>
          ))
          
        }
      </Col>
      <Col>
        <h3 className='d-none d-lg-flex justify-content-center w-50 pe-none border rounded' >Source image</h3>
        <h3 className='d-flex justify-content-center w-50 d-lg-none pe-auto border rounded' style={{ cursor: 'pointer' }} onClick={toggleImageModal}>Source image</h3>
        {/* <img src={currentPage.page.source_image} alt="source image" /> */}
        <CardImg
          src={currentPage?.page?.source}
          sizes='sm'
          className='d-none d-lg-block'
        />


        <Modal isOpen={imageModalOpen} toggle={toggleImageModal} size="lg" modalClassName='image-modal d-block d-lg-none'>
          <ModalHeader toggle={toggleImageModal}>close</ModalHeader>
          <ModalBody>
            <CardImg
              src={currentPage?.page?.source}
              sizes='sm'

            />
          </ModalBody>
        </Modal>

      </Col>
    </Row>
  )
  return (
    <Col lg="12 " className='h-100'>
      <Card className='h-100'>
        <CardHeader>
          <h3>Course Builder</h3>
        </CardHeader>
        {/* <CardBody className='h-25'> */}
          
          {/* <Form id="text-block-editable-form overflow-hidden">
            {
              updatedList.map((block, idx) => (
                  <FormItem
                    key={"block-"+idx}
                    ind={idx}
                    updateOrder={updateOrder}
                    updatePosition={updatePosition}
                    block={block}
                  />
                
              ))
            }
            
            <Button>Submit</Button>
          </Form> */}
          {/* <SectionViewerV7 /> */}
          {/* {
            response.results[0].pages[0].sections.map(section=>(
              
              <SectionViewerV9 section={section}/>
              ))
              } */}
        {/* </CardBody> */}
        <Pagination aria-label="Page navigation example">
          <PaginationItem key="page-prev" onClick={(e)=> handleGetPage(e,(currentPage.id > 1 ?  currentPage.id-1 : 0))}>
            <PaginationLink previous href="#" />
          </PaginationItem>
          {
            Array(pageRanges).fill("x").map((p,x) => (
              <PaginationItem active={p?.active} key={x} onClick={(e) => handleGetPage(e,x)}>
                <PaginationLink href="#">
                  {x+1}
                </PaginationLink>
              </PaginationItem>
            ))
          }
          <PaginationItem key="page-next" onClick={(e) => handleGetPage(e,currentPage.id + 1)}>
            <PaginationLink next href="#" />
          </PaginationItem>
        </Pagination>
          <CardBody className='h-25'>
            <Row>
              <Col lg="12">
              <h3>Page {currentPage?.page?.page}</h3>
              </Col>
            </Row>
            
            <JsonStyleViewerWrapper/>
            {/* <SectionViewerV9 section={section} /> */}
          </CardBody>
           
      </Card>

    </Col>
  )
}

export default CourseBuilder
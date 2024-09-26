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
  Label
} from 'reactstrap'
import JsonStyleViewer from './JsonStyleViewer';
import useWebSocket, { ReadyState, useSocketIO } from 'react-use-websocket'

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
  const [updatedList, updatePosition, updateOrder, updateState] = usePositionReorder(textBlocks);
  const pages = []
  const text=""
  const axios = new Axios()

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

  return (
    <Col lg="12 " className='h-100'>
      <Card className='h-100'>
        <CardHeader>
          <h3>Course Builder</h3>
        </CardHeader>
        <CardBody className='h-25'>
          
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
          <JsonStyleViewer/>
        </CardBody>
      </Card>

    </Col>
  )
}

export default CourseBuilder
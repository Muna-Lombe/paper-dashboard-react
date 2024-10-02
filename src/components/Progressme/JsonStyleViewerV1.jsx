
import React from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useState } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateOrder, updateCorrection, updateData, addCorrection, add, resetStateWithNewData, removeCorrection} from '../../variables/slices/pdfSlices'
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardBody,
  CardTitle
} from 'reactstrap'
import { unflattenArray } from 'variables'
import { flattenObject } from 'variables'
import useWebSocket, { ReadyState, useSocketIO } from 'react-use-websocket'

const JsonStyleViewer = () => {
  const [isEdited, setIsEdited] = useState(false)
  // const [corrections, setCorrections] = useState([{property: '', correction: '' }]);
  const [socketUrl, setSocketUrl] = useState('ws://localhost:8000/ws');
  const socket = useWebSocket(socketUrl, {
    onOpen: () => { socket.sendJsonMessage({ event: "fetch-processed-book", 'opts':['await-pages'] }) },
    onClose: () => console.log('closed'),

    onMessage: (event) => {
      try {
        const jsonData = JSON.parse(event.data);
        console.log(jsonData);

        // setData(jsonData["output"]);
        dispatch(resetStateWithNewData(flattenObject(jsonData.data)))
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    },

    onError: (error) => {
      console.error('WebSocket error:', error);
    },
    
    shouldReconnect: (closeEvent) => true,
    reconnectAttempts: 10

  });
  const { sendMessage, sendJsonMessage, lastMessage, lastJsonMessage, readyState } = socket;
  // const [useWebSocket, setUseWebSocket] = useState(false)

  const dispatch = useDispatch()
  const data = useSelector(state => state.pdfData)
  const corrections = useSelector(state => state.pdfCorrections)
  // Utility functions
  const isObject = value => {
    return value !== null && typeof value === 'object' //&& !Array.isArray(value);
  }

  // Components
  const Item = ({ id, name, value, path, index, onEdit, depth, moveItem, section_id }) => {
    const y = useMotionValue(0);
    const boxShadow = useTransform(
      y,
      [-10, 0, 10],
      ['0px 0px 0px rgba(0,0,0,0.1)', '0px 0px 0px rgba(0,0,0,0.1)', '0px 5px 10px rgba(0,0,0,0.1)']
    );

    const handleDragEnd = (event, info) => {
      const offset = info.offset.y
      const velocity = info.velocity.y

      if (offset < -50 || (offset < 0 && velocity < -500)) {
        moveItem(index, index - 1)
      } else if (offset > 50 || (offset > 0 && velocity > 500)) {
        moveItem(index, index + 1)
      }
    }

    const handleChange = newValue => {
      onEdit(path, newValue)
    }

    if (isObject(value)) {
      return (
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={1}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{ y, boxShadow }}
        >
          <Container
            data={value}
            path={path}
            onEdit={onEdit}
            depth={depth}
            isHash={isObject(value) && !value.find}
            section_id={section_id}
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ y, boxShadow }}
        className={`ml-${depth >=5 ? 4 : depth * 2} p-2 bg-white rounded`}
      >
        <div
          className="d-flex flex-row gap-2"
        >
          <Label size="lg" for={`${section_id ? (section_id+"-") : ""}item-${name}`} className="text-primary">"{name}":</Label>
          <Input
            // bsSize='lg'
            id={`${section_id ? (section_id+"-") : ""}item-${name}`}
            name={`${section_id ? (section_id+"-") : ""}item-${name}`}
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="ml-4 mw-75 bg-transparent border-bottom"
          />
        </div>
      </motion.div>
    );
  };

  const Container = ({ data, path, onEdit, depth, isHash, section_id }) => {
    
    const keys = Object.keys(data)
    const [order, setOrder] = useState(keys)
    const [isExpanded, setIsExpanded] = useState(true)

    const moveItem = (fromIndex, toIndex) => {
      if (toIndex < 0 || toIndex >= order.length) return

      const newOrder = [...order]
      const [reorderedItem] = newOrder.splice(fromIndex, 1)
      newOrder.splice(toIndex, 0, reorderedItem)

      setOrder(newOrder)
      // dispatch(updateOrder({path, newOrder}));
    }

    const isRoot = depth === 0
    const prefix = isHash ? '{' : '['
    const suffix = isHash ? '}' : ']'

    return (
      <div className={`ml-${depth >= 5 ? 4 : depth }`}>
        <div className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          {!isRoot ? (isExpanded ? '▼' : '▶') : ""} {path.split('.').pop() + " " + prefix}
        </div>
        {isExpanded && (
          <Form id={`field-${path.split('.').pop()}`} name={`field-${path.split('.').pop()}`}>
            {order.map((key, index) => {
              const value = data[key];
              const currentPath = path ? `${path}.${key}` : key;

              return (
                <Item
                  key={key}
                  id={key}
                  name={key}
                  value={value}
                  path={currentPath}
                  index={index}
                  onEdit={onEdit}
                  depth={depth + 1}
                  moveItem={moveItem}
                  section_id={key === "section_id"? value : section_id}
                />
              );
            })}
          </Form>
        )}
        {suffix}
      </div>
    );
  };

const JsonDisplay = ({ data, onEdit }) => {
  const objData = unflattenArray(data)
  return (
    <Container data={objData} path='' onEdit={onEdit} depth={0} isHash={true} />
  )
}


  const Corrections = ({ corrections, onAddCorrection, onCorrectionChange, onRemoveCorrection }) => {
    const CorrectionField = ({ correction, index }) => {
      const [correctionState, setCorrectionState] = useState({ ...correction, attributeChanged: "" });

      useEffect(() => {
        const { attributeChanged, ...rest } = correctionState;
        if (rest !== correction) {
          onCorrectionChange(index, correctionState.attributeChanged, correctionState[correctionState.attributeChanged]);
        }
      }, [correctionState]);

      return (
        <Row className="mb-2">
          <Col>
            <FormGroup>
              <Input
                id={`property-${index}`}
                type="text"
                defaultValue={correctionState.property}
                onKeyUp={(e) => setTimeout(() => {
                  if (e.target.value.length) {
                    setCorrectionState(ps => ({ ...ps, property: e.target.value, attributeChanged: "property" }));
                  }
                }, 1000)}
                placeholder="Property"
                className="mb-2"
              />
              <Input
                id={`correction-${index}`}
                type="textarea"
                defaultValue={correctionState.correction}
                onKeyUp={(e) => setTimeout(() => {
                  setCorrectionState(ps => ({ ...ps, correction: e.target.value, attributeChanged: "correction" }));
                }, 4000)}
                placeholder="Correction"
              />
            </FormGroup>
          </Col>
          <Col xs="auto">
            <Button
              color="danger"
              onClick={() => onRemoveCorrection(index)}
            >
              X
            </Button>
          </Col>
        </Row>
      );
    };

    return (
      <div className='mt-4'>
        <h2 className='text-xl font-bold mb-2'>Corrections</h2>
        {corrections.map((correction, index) => (
          <CorrectionField correction={correction} index={index} />
        ))}
        <button
          onClick={onAddCorrection}
          className='bg-info hover:bg-primary text-white font-bold py-2 px-4 rounded'
        >
          Add Correction
        </button>
      </div>
    )
  }
     
 

  const handleEdit = (path, value) => {
    const newData = { ...data }
    const pathArray = path.split('.')
    // let current = newData;
    // for (let i = 0; i < pathArray.length - 1; i++) {
    //   current = current[pathArray[i]];
    // }

    const convertToType = (type, value) => {
      switch (type) {
        case 'string':
          return value
        case 'number':
          return Number(value)
        case 'boolean':
          return value === 'true'
        default:
          return value
      }
    }

    // current = Object.fromEntries(Object.keys(current).map((o,i)=>{
    //   return [o, value[o]]
    // }))
    // current[pathArray[pathArray.length - 1]] = value;
    // console.log("value:", value);
    // current = {
    //   ...current,
    //   [pathArray[pathArray.length - 1]]: convertToType(typeof current[pathArray[pathArray.length - 1]], value)
    // }

    dispatch(updateData({ pathArray, update: value }))
    setIsEdited(true)
  }

  const handleAddCorrection = () => {
    dispatch(addCorrection())
  }

  const handleCorrectionChange = (index, field, value) => {
    // e.preventDefault()
    //   const newCorrections = [...corrections];
    // newCorrections[index][field] = value;
    if (field && value) {
      dispatch(updateCorrection({ index, field, value }))
    }
  }

  const handleRemoveCorrection = index => {
    dispatch(removeCorrection(index))
  }

  const handleSubmit = e => {
    // Handle submit logic
    e.preventDefault()
    console.log('Submitting changes:', {
      data: unflattenArray(data),
      corrections: corrections.filter(cor => cor.property && cor.correction)
    })
    socket.send(
      JSON.stringify({
        event: 'feedback',
        feedback: {
          ideal_output: unflattenArray(data),
          corrections: corrections.filter(cor => cor.property && cor.correction)
        }
      })
    )
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>JSON Content Dashboard</h1>
      <div className='mb-4'>
        <label className='mr-2'>
          <input
            type='checkbox'
            // checked={useWebSocket}
            // onChange={() => setUseWebSocket(!useWebSocket)}
            className='mr-1'
          />
          Use WebSocket
        </label>
      </div>
      <form
        id='json-content'
        name='json-content'
        action=''
        onSubmit={handleSubmit}
        className='flex flex-col'
      >
        <div className='font-mono text-sm d-flex flex-row gap-4'>
          <JsonDisplay data={data} onEdit={handleEdit} />
          <Corrections
            corrections={corrections}
            onAddCorrection={handleAddCorrection}
            onCorrectionChange={handleCorrectionChange}
            onRemoveCorrection={handleRemoveCorrection}
          />
        </div>
        <button
          className='mt-4 w-fit bg-info hover:bg-primary text-white  font-bold py-2 px-4 rounded'
          type='submit'
        >
          Submit
        </button>
      </form>
    </div>
  )
}

export default JsonStyleViewer;

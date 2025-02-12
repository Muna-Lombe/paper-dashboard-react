import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Collapse,
  Button,
  ListGroup,
  ListGroupItem,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
  
} from 'reactstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Helper function to reorder items in drag-and-drop
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Subcomponents for each exercise
const Instructions = () => (
  <ListGroupItem>
    <h5 className="mb-2">1.1 Some Instructions</h5>
    <p>Hello <Input type="text" name="blank1" placeholder="(someone)" /></p>
  </ListGroupItem>
);

const Carousel = () => (
  <ListGroupItem>
    <h5 className="mb-2">1.2 This is a carousel of pictures</h5>
    <img src="/path/to/table.jpg" alt="Table" className="img-fluid mb-2" />
    <p className="text-center">A table</p>
  </ListGroupItem>
);

const GifExercise = () => (
  <ListGroupItem>
    <h5 className="mb-2">1.3 A GIF about something funny</h5>
    <img src="/path/to/cat-gif.gif" alt="A funny GIF" className="img-fluid" />
  </ListGroupItem>
);

const VideoExercise = () => (
  <ListGroupItem>
    <h5 className="mb-2">1.4 A video about trees</h5>
    <div className="video-wrapper">
      <iframe
        width="100%"
        height="315"
        src="https://www.youtube.com/embed/samplevideo"
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <p className="text-center">Trees</p>
    </div>
  </ListGroupItem>
);

const GapFillExercise = ({items}) => (
  <ListGroupItem>
    <h5 className="mb-2">1.5 Gap Fill Exercise</h5>
    {
      items.map((i,x)=>{
        
        const wordBlocks = i.sentence.split(" ")
        const [partBefore, partAfter] = [wordBlocks.slice(0, i.sliceIndex).join(" "), wordBlocks.slice(i.sliceIndex+1).join(" ")]

        
        return(
          <p key={x} className='d-flex flex-row align-items-baseline flex-wrap'>{x+1}. {partBefore} {' '} <Input type="text" name="blank1" placeholder={i.placeholder} className="mx-2 w-25" /> {partAfter}</p>
        )
      })
    }
  </ListGroupItem>
);

const TestExercise = () => (
  <ListGroupItem>
    <h5 className="mb-2">1.6 A Test</h5>
    <p>Which is a fruit?</p>
    <div className='px-4'>
      <Input type="radio" name="test" className="me-2" /> Chair
      <br />
      <Input type="radio" name="test" className="me-2" /> Car
      <br />
      <Input type="radio" name="test" className="me-2" /> Cherry
    </div>
  </ListGroupItem>
);

const ArticleExercise = () => (
  <ListGroupItem>
    <h5 className="mb-2">1.7 An article about robots</h5>
    <img src="https://th.bing.com/th/id/R.ee9e4f728bb1d88f72dbb08c8df0e114?rik=cUxMkcgIWpbYiw&pid=ImgRaw&r=0" alt="Robots" className="img-fluid mb-2" />
    <p>In the bustling city of Neotropolis...</p>
  </ListGroupItem>
);

const TextExercise = () => (
  <ListGroupItem>
    <h5 className="mb-2">1.8 Text about robots</h5>
    <p>Robots are machines designed to perform tasks autonomously or with minimal human intervention...</p>
  </ListGroupItem>
);

const WritingExercise = () => (
  <ListGroupItem>
    <h5 className="mb-2">1.9 Writing Exercise about Robots</h5>
    <Input type="textarea" placeholder="Write something about robots" />
  </ListGroupItem>
);

const AudioExercise = () => (
  <ListGroupItem>
    <h5 className="mb-2">1.10 Audio Exercise</h5>
    <audio controls className="w-100">
      <source src="/path/to/robot-audio.mp3" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  </ListGroupItem>
);

const GapFillNoBox = () => (
  <ListGroupItem>
    <h5 className="mb-2">1.11 Gap Fill (No Box)</h5>
    <div className="d-flex flex-wrap">
      <p className="d-flex flex-row align-items-baseline flex-wrap">
        Robots{' '} <Input type="text" className="mx-2 w-25" placeholder=" be" /> machines. In{' '} <Input type="text" className="mx-2 w-25" placeholder=" preposition(place)" />the bustling city of Neotropolis, a quirky household robot named Z3N loved to tell stories and help the Johnson children, Mia and Leo. When they{' '} <Input type="text" className="mx-2 w-25" placeholder=" pronoun" /> grew anxious about their upcoming school talent show—Mia too shy to sing solo and Leo lacking confidence for his magic act—Z3N had an idea.
      </p>
    </div>
  </ListGroupItem>
);

const PictureLabel = () => (
  <ListGroupItem>
    <h5 className="mb-2">1.12 Picture Label</h5>
    <Input type="text" placeholder="Label" className="w-25" disabled defaultValue="robots" />
    <div className="d-flex flex-column justify-content-start align-items-center">
      <img src="https://www.bing.com/th?id=OIP.l89mVn4MiRsQuptE_ePPdwHaK-&w=146&h=217&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2" alt="Robot" className="img-thumbnail me-3" />
    </div>
  </ListGroupItem>
);

const SortingExercise = ({ items, handleOnDragEnd }) => (
  <ListGroupItem>
    <h5 className="mb-2">1.13 Words Order (Sorting)</h5>
    <DragComponent
      id={"sortingItems"}
      items={items}
      direction={'horizontal'}
      layout={({ innerRef, draggableProps, dragHandleProps, item }) => {
        if(!innerRef||!dragHandleProps||!draggableProps){
          return(
            <p>
              Nothing here
            </p>
            
          )
        }
        return (
          <div ref={innerRef} {...draggableProps} {...dragHandleProps} className="w-25 mx-1 p-2 bg-light rounded border">
            <div className=" w-auto d-flex align-items-center justify-content-between">
              <span className='w-auto'>{item.content}</span>
              <i className="bi bi-arrows-move text-secondary"></i>
            </div>
          </div>
        )
      }}
    />
  </ListGroupItem>
);

const SelectOption = ({dropDownItems=['Edit', 'Delete']})=>{
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [dropValue, setDropValue] = useState("")
  const toggleDropdown = (id) => setDropdownOpen(prevState => (prevState === id ? null : id));
  return (
    <Dropdown size='md' drop="down" isOpen={dropdownOpen === 'section'} toggle={() => toggleDropdown('section')}>
      <DropdownToggle variant="success"  className="text-secondary me-2" hover="" style={{ cursor: 'pointer', lineHeight:'10px', backgroundColor:'transparent', }}>
        {dropValue.toLowerCase() || '___'}
      </DropdownToggle>
      <DropdownMenu  positionFixed={false} right className='w-25'>
        {
          dropDownItems.map((item, index)=>(
            <DropdownItem onClick={() => setDropValue(item)}  key={index}>{item}</DropdownItem>
          ))
        }
      </DropdownMenu>
    </Dropdown>
  )
}
const OptionChoose = () => (
  <ListGroupItem>
    <h5 className="mb-2">1.14 Option Choose</h5>
    <p className='d-flex flex-row align-items-baseline flex-wrap'>Robots {' '} <SelectOption dropDownItems={['are', 'is', 'am']}/> designed to do some interesting things</p>
  </ListGroupItem>
);

const TrueFalse = () => (
  <ListGroupItem>
    <h5 className="mb-2">1.15 True/False</h5>
    <p>Robots are machines designed to perform tasks autonomously.</p>
    <div className='d-flex flex-column'>
      <p>
        <Input type="radio" name="truefalse" className="me-2" /> True

      </p>
      <p>
        <Input type="radio" name="truefalse" className="me-2" /> False

      </p>
    </div>
  </ListGroupItem>
);

const MatchingExercise = ({ leftItems, rightItems }) => (
  <ListGroupItem>
    <h5 className="mb-2">1.16 Matching</h5>
    <Row className="d-flex flex-row justify-content-between gap-2">
      <Col  className="left-match w-50 ">
        <DragComponent
          id={"left-match-items"}
          items={leftItems}
          layout={({ innerRef, draggableProps, dragHandleProps, item }) => {
            if (!innerRef || !dragHandleProps || !draggableProps) {
              return (
                <p>
                  Nothing here
                </p>

              )
            }
            return (
              <div ref={innerRef} {...draggableProps} {...dragHandleProps} key={item.id} className="p-2 bg-light rounded mb-2">{item.content}</div>
            )}}/>
       
      </Col>
      <Col className="right-match w-50 ms-3">
        
        <DragComponent
          id={"right-match-items"}
          items={rightItems}
          layout={({ innerRef, draggableProps, dragHandleProps, item }) => {
            if (!innerRef || !dragHandleProps || !draggableProps) {
              return (
                <p>
                  Nothing here
                </p>

              )
            }
            return (
              <div ref={innerRef} {...draggableProps} {...dragHandleProps} key={item.id} className="p-2 bg-light rounded mb-2">{item.content}</div>
            )
          }} />
      </Col>
    </Row>
  </ListGroupItem>
);

const DragComponent =({id, items, layout, direction})=>{

  const [dragItems, setDragItems] = useState(items);
  const handleOnDragEnd = result => {
    if (!result.destination) return;
    const items = reorder(dragItems, result.source.index, result.destination.index);
    setDragItems(items);
  };
  return(
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable direction={direction} droppableId={id}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className={" d-flex "+ (direction && direction == "horizontal" ? " flex-row " : " flex-column") + " "}>
            {dragItems.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  
                    layout({innerRef:provided.innerRef, draggableProps: provided.draggableProps, dragHandleProps: provided.dragHandleProps, item, idx:index })
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
const UnscrambleExercise = ({ items, handleOnDragEnd }) => (
  <ListGroupItem>
    <h5 className="mb-2">1.17 Unscramble</h5>
    <div className="mb-2 p-2 bg-light rounded border">
        {
          items.map((item, index) => (
            
            <DragComponent
              id={"unscrambleItems-"+item.id}
              items={item.content.split("").map((i,x)=>({id: (x+1).toString(), content:i}))}
              direction={"horizontal"}
              layout={({ innerRef, draggableProps, dragHandleProps, item }) => {
                if (!innerRef || !dragHandleProps || !draggableProps) {
                  return (
                    <p>
                      Nothing here
                    </p>

                  )
                }
                return (

                  <div ref={innerRef} {...draggableProps} {...dragHandleProps} className="mx-2 mb-2 p-2 bg-light rounded border d-flex align-items-center justify-content-between">
                    <span>{item.content}</span>
                    <i className="bi bi-arrows-move text-secondary"></i>
                  </div>
                )
              }}
            />
          ))
        }
      </div>
  </ListGroupItem>
);

const SortExercise = ({items}) => (
  <ListGroupItem>
    <h5 className="mb-2">1.18 Sort Exercise</h5>
    <p>Sort the following sentences in order:</p>
    <div>Drag words here: <Input type="text" className="mx-2" /></div>
    <DragComponent
      id={"unscrambleItems-"}
      items={items}
      layout={({ innerRef, draggableProps, dragHandleProps, item, idx }) => {
        if (!innerRef || !dragHandleProps || !draggableProps) {
          return (
            <p>
              Nothing here
            </p>

          )
        }
        return (

          <div ref={innerRef} {...draggableProps} {...dragHandleProps} className="mx-2 mb-2 p-2 bg-light rounded border d-flex align-items-center justify-content-between">
            <span>{idx+1}.{item.content}</span>
            <i className="bi bi-arrows-move text-secondary"></i>
          </div>
        )
      }}
    />
  </ListGroupItem>
);

const ExternalLink = ({ link = "https://www.example.com" }) => (
  <ListGroupItem>
    <h5 className="mb-2">1.19 External Link</h5>
    <a href={link} target="_blank" rel="noopener noreferrer" className="btn btn-link">
      Follow the link
    </a>
  </ListGroupItem>
);

const NewWords = ({items}) => (
  <ListGroupItem>
    <h5 className="mb-2">1.20 New Words</h5>
    <Button color="primary" className="mb-2">Add all words</Button>
    <div>
      {
        items.map((i,x)=>(
          <p key={x} className='mb-2 p-2 bg-light rounded border border-light'>
            - {i.content} : {i.definition}
          </p>
        ))
      }
    </div>
  </ListGroupItem>
);

const RecordExercise = () => (
  <ListGroupItem>
    <h5 className="mb-2">1.21 Record Yourself Saying Robots</h5>
    <Button color="secondary" size='sm'>Start recording</Button>
    <audio controls className="w-100">
      <source src="/path/to/robot-audio.mp3" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  </ListGroupItem>
);

const TimedTest = () => (
  <ListGroupItem>
    <h5 className="mb-2">2.1 Take the Test</h5>
    <p>Time-limited test with 1 question.</p>
  </ListGroupItem>
);

const SectionViewerV7 = () => {
  const [isOpen, setIsOpen] = useState(true);
  // const [dropdownOpen, setDropdownOpen] = useState(null);

  // Sorting, Matching, and Unscramble Items
  const [sortingItems, setSortingItems] = useState([
    { id: '1', content: 'Robots' },
    { id: '2', content: 'are machines' },
    { id: '3', content: 'designed to' },
    { id: '4', content: 'perform tasks' },
    { id: '5', content: 'autonomously.' }
  ]);

  const [matchingItemsLeft, setMatchingItemsLeft] = useState([
    { id: '1', content: 'Robots are machines' },
    { id: '2', content: 'They come in various forms' },
    { id: '3', content: 'With advancements in AI' }
  ]);

  const [matchingItemsRight, setMatchingItemsRight] = useState([
    { id: '4', content: 'designed to perform tasks autonomously' },
    { id: '5', content: 'from industrial robots to smart speakers' },
    { id: '6', content: 'robots are increasingly capable of learning' }
  ]);

  const [unscrambleItems, setUnscrambleItems] = useState([
    { id: '1', content: 'autonomously' },
    { id: '2', content: 'tasks' },
    { id: '3', content: 'robots' },
    { id: '4', content: 'designed' }
  ]);

  const newWords = [
    { content: "Robot", definition:"A walking machine" },
    { content: "Human", definition:"A walking meatsuit" },
    { content: "Machine", definition:"A non-walking meatsuit" },
    { content: "AI", definition:"A thinking computer"},
    { content: "Learning", definition:"A process of gaining knowledge"}
  ]

  const toggleSection = () => setIsOpen(!isOpen);
  // const toggleDropdown = (id) => setDropdownOpen(prevState => (prevState === id ? null : id));

  // Drag End Handlers for Sorting, Unscramble
  const handleOnDragEnd = result => {
    if (!result.destination) return;
    const items = reorder(sortingItems, result.source.index, result.destination.index);
    setSortingItems(items);
  };

  const handleUnscrambleDragEnd = result => {
    if (!result.destination) return;
    const items = reorder(unscrambleItems, result.source.index, result.destination.index);
    setUnscrambleItems(items);
  };

  return (
    <div id="content" className="container my-4" style={{ minHeight: 'calc(-97px + 100vh)' }}>
      <Card className="mb-4 shadow-sm">
        <CardBody className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div
              className="rounded-circle d-flex justify-content-center align-items-center bg-light"
              style={{ height: '80px', width: '80px' }}
            >
              <span className="display-6 text-muted">S</span>
            </div>
            <div className="ms-3">
              <CardTitle tag="h4" className="mb-0">Section 1</CardTitle>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <SelectOption />
            <Button color="link" className="text-decoration-none text-secondary" onClick={toggleSection}>
              {isOpen ? <i className="bi bi-chevron-up"></i> : <i className="bi bi-chevron-down"></i>}
            </Button>
          </div>
        </CardBody>

        <Collapse isOpen={isOpen}>
          <CardBody>
            <ListGroup flush>
              <Instructions />
              <Carousel />
              <GifExercise />
              <VideoExercise />
              <GapFillExercise items={matchingItemsRight.map((i, x) => ({ sliceIndex: x + 2, sentence: matchingItemsLeft[x].content.concat(" " + matchingItemsRight[x].content + "."), placeholder: (matchingItemsLeft[x].content.concat(" " + matchingItemsRight[x].content + ".")).split(" ")[x+2] }))} />
              <TestExercise />
              <ArticleExercise />
              <TextExercise />
              <WritingExercise />
              <AudioExercise />
              <GapFillNoBox />
              <PictureLabel />
              <SortingExercise items={sortingItems} handleOnDragEnd={handleOnDragEnd} />
              <OptionChoose />
              <TrueFalse />
              <MatchingExercise leftItems={matchingItemsLeft} rightItems={matchingItemsRight} />
              <UnscrambleExercise items={unscrambleItems} handleOnDragEnd={handleUnscrambleDragEnd} />
              <SortExercise items={matchingItemsLeft.concat(matchingItemsRight)} />
              <ExternalLink link={""} />
              <NewWords items={newWords} />
              <RecordExercise />
              <TimedTest />
            </ListGroup>
          </CardBody>
        </Collapse>
      </Card>
    </div>
  );
};

export default SectionViewerV7;

import React, { useState } from 'react';
import {
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
  Input
} from 'reactstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Helper function to reorder the items after drag and drop
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const SectionViewerV6 = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null);

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

  const toggleSection = () => setIsOpen(!isOpen);
  const toggleDropdown = (id) => setDropdownOpen(prevState => (prevState === id ? null : id));

  // Drag End Handlers for Sorting, Matching, Unscramble
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
            <Dropdown isOpen={dropdownOpen === 'section'} toggle={() => toggleDropdown('section')}>
              <DropdownToggle tag="span" className="text-secondary me-2" style={{ cursor: 'pointer' }}>
                <i className="bi bi-three-dots-vertical"></i>
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem>Edit</DropdownItem>
                <DropdownItem>Delete</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button color="link" className="text-decoration-none text-secondary" onClick={toggleSection}>
              {isOpen ? <i className="bi bi-chevron-up"></i> : <i className="bi bi-chevron-down"></i>}
            </Button>
          </div>
        </CardBody>

        <Collapse isOpen={isOpen}>
          <CardBody>
            <ListGroup flush>
              {/* Exercise 1.1: Instructions */}
              <ListGroupItem>
                <h5 className="mb-2">1.1 Some Instructions</h5>
                <p>Hello <Input type="text" name="blank1" placeholder="(someone)" /></p>
              </ListGroupItem>

              {/* Exercise 1.2: Carousel */}
              <ListGroupItem>
                <h5 className="mb-2">1.2 This is a carousel of pictures</h5>
                <img src="/path/to/table.jpg" alt="Table" className="img-fluid mb-2" />
                <p className="text-center">A table</p>
              </ListGroupItem>

              {/* Exercise 1.3: GIF */}
              <ListGroupItem>
                <h5 className="mb-2">1.3 A GIF about something funny</h5>
                <img src="/path/to/cat-gif.gif" alt="A funny GIF" className="img-fluid" />
              </ListGroupItem>

              {/* Exercise 1.4: Video */}
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

              {/* Exercise 1.5: Gap Fill */}
              <ListGroupItem>
                <h5 className="mb-2">1.5 Gap Fill Exercise</h5>
                
                <p className='d-flex align-items-baseline'>There <Input type="text" name="blank1" placeholder="are" className=" mx-2 w-25" /> a chair in the room. </p>
                <p className='d-flex align-items-baseline'>There <Input type="text" name="blank2" placeholder="are" className=" mx-2 w-25" /> some people on the street.</p>
              </ListGroupItem>

              {/* Exercise 1.6: Test */}
              <ListGroupItem>
                <h5 className="mb-2">1.6 A Test</h5>
                <p>Which is a fruit?</p>
                <div>
                  <Input type="radio" name="test" className="me-2" /> Chair
                  <br />
                  <Input type="radio" name="test" className="me-2" /> Car
                  <br />
                  <Input type="radio" name="test" className="me-2" /> Cherry
                </div>
              </ListGroupItem>

              {/* Exercise 1.7: Article */}
              <ListGroupItem>
                <h5 className="mb-2">1.7 An article about robots</h5>
                <img src="https://th.bing.com/th/id/R.ee9e4f728bb1d88f72dbb08c8df0e114?rik=cUxMkcgIWpbYiw&pid=ImgRaw&r=0" alt="Robots" className="img-fluid mb-2" />
                <p>In the bustling city of Neotropolis, a quirky household robot named Z3N loved to tell stories and help the Johnson children, Mia and Leo. When they....</p>
              </ListGroupItem>

              {/* Exercise 1.8: Text */}
              <ListGroupItem>
                <h5 className="mb-2">1.8 Text about robots</h5>
                <p>Robots are machines designed to perform tasks autonomously or with minimal human intervention...</p>
              </ListGroupItem>

              {/* Exercise 1.9: Writing */}
              <ListGroupItem>
                <h5 className="mb-2">1.9 Writing Exercise about Robots</h5>
                <Input type="textarea" placeholder=" Write something about robots" />
              </ListGroupItem>

              {/* Exercise 1.10: Audio */}
              <ListGroupItem>
                <h5 className="mb-2">1.10 Audio Exercise</h5>
                <audio controls className="w-100">
                  <source src="/path/to/robot-audio.mp3" type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </ListGroupItem>

              {/* Exercise 1.11: Gap Fill No Box */}
              <ListGroupItem>
                <h5 className="mb-2">1.11 Gap Fill (No Box)</h5>
                <div className='d-flex flex-wrap'>

                  <p className="d-flex flex-row align-items-baseline flex-wrap">
                    Robots{' '}
                    <Input type="text" className="mx-2 w-25" placeholder=" be" />
                    machines. In{' '}
                    <Input type="text" className="mx-2 w-25" placeholder=" preposition(place)" />
                    the bustling city of Neotropolis, a quirky household robot named Z3N loved to tell stories and help the Johnson children, Mia and Leo. When they{' '}
                    <Input type="text" className="mx-2 w-25" placeholder=" pronoun" />
                    grew anxious about their upcoming school talent show—Mia too shy to sing solo and Leo lacking confidence for his magic act—Z3N had an idea.
                  </p>
                </div>
              </ListGroupItem>

              {/* Exercise 1.12: Picture Label */}
              <ListGroupItem>
                <h5 className="mb-2">1.12 Picture Label</h5>
                <Input type="text" placeholder="Label" className='w-25' disabled defaultValue="robots" />
                <div className="d-flex flex-column justify-content-start align-items-center">
                  <img src="https://www.bing.com/th?id=OIP.l89mVn4MiRsQuptE_ePPdwHaK-&w=146&h=217&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2" alt="Robot" className="img-thumbnail me-3" />
                  <Input type="text" className='w-25' disabled/>
                </div>
                
              </ListGroupItem>

              {/* Exercise 1.13: Sorting (Words Order) */}
              <ListGroupItem>
                <h5 className="mb-2">1.13 Words Order (Sorting)</h5>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                  <Droppable droppableId="sortingItems">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {sortingItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="mb-2 p-2 bg-light rounded border">
                                <div className="d-flex align-items-center justify-content-between">
                                  <span>{item.content}</span>
                                  <i className="bi bi-arrows-move text-secondary"></i>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </ListGroupItem>

              {/* Exercise 1.14: Option Choose */}
              <ListGroupItem>
                <h5 className="mb-2">1.14 Option Choose</h5>
                <p>Robots <Input type="text" className="mx-2" /> designed to...</p>
              </ListGroupItem>

              {/* Exercise 1.15: True/False */}
              <ListGroupItem>
                <h5 className="mb-2">1.15 True/False</h5>
                <p>Robots are machines designed to perform tasks autonomously.</p>
                <div>
                  <Input type="radio" name="truefalse" className="me-2" /> True
                  <Input type="radio" name="truefalse" className="me-2" /> False
                </div>
              </ListGroupItem>

              {/* Exercise 1.16: Matching */}
              <ListGroupItem>
                <h5 className="mb-2">1.16 Matching</h5>
                <div className="d-flex justify-content-between">
                  <div className="w-50">
                    {matchingItemsLeft.map((item) => (
                      <div key={item.id} className="p-2 bg-light rounded mb-2">{item.content}</div>
                    ))}
                  </div>
                  <div className="w-50 ms-3">
                    {matchingItemsRight.map((item) => (
                      <div key={item.id} className="p-2 bg-light rounded mb-2">{item.content}</div>
                    ))}
                  </div>
                </div>
              </ListGroupItem>

              {/* Exercise 1.17: Unscramble */}
              <ListGroupItem>
                <h5 className="mb-2">1.17 Unscramble</h5>
                <DragDropContext onDragEnd={handleUnscrambleDragEnd}>
                  <Droppable droppableId="unscrambleItems">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {unscrambleItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="mb-2 p-2 bg-light rounded border">
                                <div className="d-flex align-items-center justify-content-between">
                                  <span>{item.content}</span>
                                  <i className="bi bi-arrows-move text-secondary"></i>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </ListGroupItem>

              {/* Exercise 1.18: Sort Exercise */}
              <ListGroupItem>
                <h5 className="mb-2">1.18 Sort Exercise</h5>
                <p>Sort the following sentences in order:</p>
                <div>Drag words here: <Input type="text" className="mx-2" /></div>
              </ListGroupItem>

              {/* Exercise 1.19: External Link */}
              <ListGroupItem>
                <h5 className="mb-2">1.19 External Link</h5>
                <a href="https://www.example.com" target="_blank" rel="noopener noreferrer" className="btn btn-link">
                  Follow the link
                </a>
              </ListGroupItem>

              {/* Exercise 1.20: New Words */}
              <ListGroupItem>
                <h5 className="mb-2">1.20 New Words</h5>
                <Button color="primary" className="mb-2">Add all words</Button>
                <div>Robot - A walking machine</div>
              </ListGroupItem>

              {/* Exercise 1.21: Record Yourself */}
              <ListGroupItem>
                <h5 className="mb-2">1.21 Record Yourself Saying Robots</h5>
                <Button color="primary">Start recording</Button>
              </ListGroupItem>

              {/* Exercise 2.1: Time-limited Test */}
              <ListGroupItem>
                <h5 className="mb-2">2.1 Take the Test</h5>
                <p>Time-limited test with 1 question.</p>
              </ListGroupItem>
            </ListGroup>
          </CardBody>
        </Collapse>
      </Card>
    </div>
  );
};

export default SectionViewerV6;

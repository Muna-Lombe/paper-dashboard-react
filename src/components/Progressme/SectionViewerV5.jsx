import React, { useState } from 'react';
import { Card, CardBody, CardTitle, Collapse, Button, ListGroup, ListGroupItem, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Input } from 'reactstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Helper function to reorder the items after drag and drop
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const SectionViewerV5 = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Sorting Items for Drag and Drop
  const [sortingItems, setSortingItems] = useState([
    { id: '1', content: 'Robots' },
    { id: '2', content: 'are machines' },
    { id: '3', content: 'designed to' },
    { id: '4', content: 'perform tasks' },
    { id: '5', content: 'autonomously.' }
  ]);

  // Matching Pairs
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

  // Unscramble Words
  const [unscrambleItems, setUnscrambleItems] = useState([
    { id: '1', content: 'autonomously' },
    { id: '2', content: 'tasks' },
    { id: '3', content: 'robots' },
    { id: '4', content: 'designed' }
  ]);

  const toggleSection = () => setIsOpen(!isOpen);
  const toggleDropdown = (id) => setDropdownOpen(prevState => (prevState === id ? null : id));

  // Drag End Handler for Sorting Exercise
  const handleOnDragEnd = result => {
    if (!result.destination) return;
    const items = reorder(sortingItems, result.source.index, result.destination.index);
    setSortingItems(items);
  };

  // Drag End Handler for Unscramble
  const handleUnscrambleDragEnd = result => {
    if (!result.destination) return;
    const items = reorder(unscrambleItems, result.source.index, result.destination.index);
    setUnscrambleItems(items);
  };

  return (
    <div id="content" className="content" style={{ minHeight: 'calc(-97px + 100vh)' }}>
      <div className="data_wrapper">
        <Card className="mb-3">
          <CardBody className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="user_photo_wrapper course-image me-3" style={{ backgroundColor: 'rgb(255, 217, 255)', height: '80px', width: '80px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="user_inits" style={{ color: 'rgb(230, 149, 230)', fontSize: '2rem' }}>S</span>
              </div>
              <div>
                <CardTitle tag="h5">Section 1</CardTitle>
              </div>
            </div>
            <div className="d-flex align-items-center">
              <Dropdown isOpen={dropdownOpen === 'section'} toggle={() => toggleDropdown('section')}>
                <DropdownToggle tag="span" data-toggle="dropdown" aria-expanded={dropdownOpen === 'section'}>
                  <Button color="link" className="text-decoration-none text-secondary">
                    <i className="bi bi-three-dots-vertical"></i>
                  </Button>
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
            <CardBody className="pt-0">
              <ListGroup flush>

                {/* Other exercises (1.1 to 1.17) here... */}
              
                {/* Exercise 1.1: Instructions */}
                <ListGroupItem>
                  <h5 className="mb-2">1.1 Some Instructions</h5>
                  <p>Hello <Input type="text" name="blank1" placeholder="(someone)" /></p>
                </ListGroupItem>

                {/* Exercise 1.2: Carousel */}
                <ListGroupItem>
                  <h5 className="mb-2">1.2 This is a carousel of pictures</h5>
                  <img src="/path/to/table.jpg" alt="Table" />
                  <p className="text-center">A table</p>
                </ListGroupItem>

                {/* Exercise 1.3: GIF */}
                <ListGroupItem>
                  <h5 className="mb-2">1.3 A GIF about something funny</h5>
                  <img src="/path/to/cat-gif.gif" alt="A funny GIF" />
                </ListGroupItem>

                {/* Exercise 1.4: Video */}
                <ListGroupItem>
                  <h5 className="mb-2">1.4 A video about trees</h5>
                  <div className="video-wrapper">
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/samplevideo" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    <p className="text-center">Trees</p>
                  </div>
                </ListGroupItem>

                {/* Exercise 1.5: Gap Fill */}
                <ListGroupItem>
                  <h5 className="mb-2">1.5 Gap Fill Exercise</h5>
                  <p>There <Input type="text" name="blank1" placeholder="are" /> a chair in the room. There <Input type="text" name="blank2" placeholder="are" /> some people on the street.</p>
                </ListGroupItem>

                {/* Exercise 1.6: Test */}
                <ListGroupItem>
                  <h5 className="mb-2">1.6 A Test</h5>
                  <p>Which is a fruit?</p>
                  <div>
                    <Input type="radio" name="test" /> Chair
                    <Input type="radio" name="test" /> Car
                    <Input type="radio" name="test" /> Cherry
                  </div>
                </ListGroupItem>

                {/* Exercise 1.7: Article */}
                <ListGroupItem>
                  <h5 className="mb-2">1.7 An article about robots</h5>
                  <div className="article">
                    <img src="/path/to/robot-poster.jpg" alt="Robots" />
                    <p>In the bustling city of Neotropolis...</p>
                  </div>
                </ListGroupItem>

                {/* Exercise 1.8: Text */}
                <ListGroupItem>
                  <h5 className="mb-2">1.8 Text about robots</h5>
                  <p>Robots are machines designed to perform tasks autonomously or with minimal human intervention...</p>
                </ListGroupItem>

                {/* Exercise 1.9: Writing */}
                <ListGroupItem>
                  <h5 className="mb-2">1.9 Writing Exercise about Robots</h5>
                  <Input type="textarea" placeholder="Write something about robots" />
                </ListGroupItem>

                {/* Exercise 1.10: Audio */}
                <ListGroupItem>
                  <h5 className="mb-2">1.10 Audio Exercise</h5>
                  <audio controls>
                    <source src="/path/to/robot-audio.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </ListGroupItem>

                {/* Exercise 1.11: Gap Fill No Box */}
                <ListGroupItem>
                  <h5 className="mb-2">1.11 Gap Fill (No Box)</h5>
                  <p>Robots <Input type="text" /> machines...</p>
                </ListGroupItem>

                {/* Exercise 1.12: Picture Label */}
                <ListGroupItem>
                  <h5 className="mb-2">1.12 Picture Label</h5>
                  <div>
                    <img src="/path/to/robot.jpg" alt="Robot" />
                    <Input type="text" placeholder="Label" />
                  </div>
                </ListGroupItem>
                {/* Exercise 1.13: Words Order */}
                <ListGroupItem>
                  <h5 className="mb-2">1.13 Words Order (Sorting)</h5>
                  <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="sortingItems">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          {sortingItems.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="mb-2">
                                  <div className="d-flex align-items-center">
                                    <span className="me-auto">{item.content}</span>
                                    <Button color="link" className="text-secondary">
                                      <i className="bi bi-arrows-move"></i>
                                    </Button>
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
                  <p>Robots <Input type="text" /> designed to...</p>
                </ListGroupItem>

                {/* Exercise 1.15: True/False */}
                <ListGroupItem>
                  <h5 className="mb-2">1.15 True/False</h5>
                  <p>Robots are machines designed to perform tasks autonomously.</p>
                  <div>
                    <Input type="radio" name="truefalse" /> True
                    <Input type="radio" name="truefalse" /> False
                  </div>
                </ListGroupItem>

                {/* Exercise 1.16: Matching */}
                <ListGroupItem>
                  <h5 className="mb-2">1.16 Matching</h5>
                  <div className="d-flex justify-content-between">
                    <div>
                      {matchingItemsLeft.map((item) => (
                        <div key={item.id} className="mb-2">
                          {item.content}
                        </div>
                      ))}
                    </div>
                    <div>
                      {matchingItemsRight.map((item) => (
                        <div key={item.id} className="mb-2">
                          {item.content}
                        </div>
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
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="mb-2">
                                  <div className="d-flex align-items-center">
                                    <span className="me-auto">{item.content}</span>
                                    <Button color="link" className="text-secondary">
                                      <i className="bi bi-arrows-move"></i>
                                    </Button>
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

                {/* Additional exercises... */}
                {/* Exercise 1.18: Sort Exercise */}
                <ListGroupItem>
                  <h5 className="mb-2">1.18 Sort Exercise</h5>
                  <div>
                    <div>Drag words here: <Input type="text" /></div>
                  </div>
                </ListGroupItem>

                {/* Exercise 1.19: External Link */}
                <ListGroupItem>
                  <h5 className="mb-2">1.19 External Link</h5>
                  <a href="https://www.example.com" target="_blank" rel="noopener noreferrer">Follow the link</a>
                </ListGroupItem>

                {/* Exercise 1.20: Vocabulary */}
                <ListGroupItem>
                  <h5 className="mb-2">1.20 New Words</h5>
                  <Button color="primary">Add all words</Button>
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
                  <div>Time-limited test with 1 question.</div>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Collapse>
        </Card>
      </div>
    </div>
  );
};

export default SectionViewerV5;

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  Collapse,
  Button,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
  Tooltip
} from 'reactstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const SectionViewerV2 = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [gapFillAnswers, setGapFillAnswers] = useState({
    blank1: '',
    blank2: '',
  });
  const [vocabularyWords, setVocabularyWords] = useState([
    { id: '1', word: 'Robots', definition: 'a walking machine', added: false },
    { id: '2', word: 'Human', definition: 'a walking meatsuit', added: false }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [sortingItems, setSortingItems] = useState([
    { id: '1', content: 'Robots' },
    { id: '2', content: 'are machines' },
    { id: '3', content: 'designed to' },
    { id: '4', content: 'perform tasks' },
    { id: '5', content: 'autonomously.' },
  ]);

  const toggleSection = () => setIsOpen(!isOpen);
  const toggleLessonModal = () => setIsLessonOpen(!isLessonOpen);
  const toggleDropdown = (id) => {
    setDropdownOpen(prevState => (prevState === id ? null : id));
  };

  const handleGapFillChange = (e) => {
    setGapFillAnswers({
      ...gapFillAnswers,
      [e.target.name]: e.target.value
    });
  };

  const handleAddAllWords = () => {
    setVocabularyWords(prevWords =>
      prevWords.map(word => ({ ...word, added: true }))
    );
  };

  const handleAddWord = id => {
    setVocabularyWords(prevWords =>
      prevWords.map(word => (word.id === id ? { ...word, added: true } : word))
    );
  };

  const handleOnDragEnd = result => {
    if (!result.destination) return;
    const items = Array.from(sortingItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSortingItems(items);
  };

  return (
    <div id="content" className="content" style={{ minHeight: 'calc(-97px + 100vh)' }}>
      <div className="data_wrapper">
        {/* Section Card */}
        <Card className="mb-3">
          <CardBody className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div
                className="user_photo_wrapper course-image me-3"
                style={{
                  backgroundColor: 'rgb(255, 217, 255)',
                  height: '80px',
                  width: '80px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span className="user_inits" style={{ color: 'rgb(230, 149, 230)', fontSize: '2rem' }}>
                  S
                </span>
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

          {/* Lessons List */}
          <Collapse isOpen={isOpen}>
            <CardBody className="pt-0">
              <ListGroup flush>
                <ListGroupItem className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div
                      className="user_photo_wrapper lesson-image me-3"
                      style={{
                        backgroundColor: 'rgb(255, 217, 255)',
                        height: '40px',
                        width: '40px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span className="user_inits" style={{ color: 'rgb(230, 149, 230)', fontSize: '1.5rem' }}>
                        U
                      </span>
                    </div>
                    <div>
                      <CardSubtitle tag="h6" className="mb-0">
                        Unit 1
                      </CardSubtitle>
                    </div>
                  </div>
                  <Button color="primary" size="sm" onClick={toggleLessonModal}>
                    Open Unit
                  </Button>
                </ListGroupItem>

                <ListGroupItem className="d-flex align-items-center justify-content-start hover-item" style={{ cursor: 'pointer' }}>
                  <Button color="secondary" className="me-3" size="sm">
                    <i className="bi bi-plus-lg"></i>
                  </Button>
                  <div>New Unit</div>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Collapse>
        </Card>

        {/* Lesson Modal */}
        <Modal isOpen={isLessonOpen} toggle={toggleLessonModal} size="lg">
          <ModalHeader toggle={toggleLessonModal}>Unit 1</ModalHeader>
          <ModalBody>
            {/* Lesson Content */}
            <div className="lesson-content">
              {/* Exercise 1.23 Vocabulary Exercise */}
              <div className="exercise_wrapper mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <div className="icon_wrapper me-3" style={{
                      backgroundColor: 'rgb(240, 251, 255)', borderRadius: '50%', height: '40px', width: '40px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                      <span style={{ color: 'rgb(51, 204, 255)', fontWeight: 'bold' }}>1.23</span>
                    </div>
                    <h5 className="mb-0">Vocabulary Exercise</h5>
                  </div>
                </div>
                <Button color="primary" onClick={handleAddAllWords} className="mb-3">Add all words</Button>
                {vocabularyWords.map(word => (
                  <div key={word.id} className="d-flex align-items-center mb-2">
                    <Button color={word.added ? "success" : "secondary"} onClick={() => handleAddWord(word.id)} disabled={word.added} className="me-2">
                      {
                        word.added ? 
                        <i className="bi bi-check-lg"></i> 
                        : <i className="bi bi-plus-lg"></i>
                      } 
                    </Button> 
                    <div className="me-auto"> 
                      <strong>{word.word}</strong> - {word.definition} 
                    </div> 
                    <Button color="link" className="text-secondary"> 
                      <i className="bi bi-volume-up-fill"></i> 
                    </Button> </div> 
                  ))} 
                </div>
                {/* Exercise 1.20 Sorting Exercise */}
              <div className="exercise_wrapper mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <div className="icon_wrapper me-3" style={{
                      backgroundColor: 'rgb(240, 251, 255)', borderRadius: '50%', height: '40px', width: '40px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                      <span style={{ color: 'rgb(51, 204, 255)', fontWeight: 'bold' }}>1.20</span>
                    </div>
                    <h5 className="mb-0">Sorting Exercise</h5>
                  </div>
                </div>
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
              </div>

              {/* New Exercise Button */}
              <div className="d-flex align-items-center justify-content-start hover-item" style={{ cursor: 'pointer' }}>
                <Button color="secondary" className="me-3" size="sm">
                  <i className="bi bi-plus-lg"></i>
                </Button>
                <div>New Exercise</div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleLessonModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
); };

export default SectionViewerV2;
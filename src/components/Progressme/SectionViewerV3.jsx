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
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
  Tooltip
} from 'reactstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const SectionViewerV3 = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [gapFillAnswers, setGapFillAnswers] = useState({
    blank1: '',
    blank2: '',
  });
  const [vocabularyWords, setVocabularyWords] = useState([
    { id: '1', word: 'Robots', definition: 'a walking machine', added: false },
    { id: '2', word: 'Human', definition: 'a walking meatsuit', added: false }
  ]);
  const [sortingItems, setSortingItems] = useState([
    { id: '1', content: 'Robots' },
    { id: '2', content: 'are machines' },
    { id: '3', content: 'designed to' },
    { id: '4', content: 'perform tasks' },
    { id: '5', content: 'autonomously.' },
  ]);

  const toggleSection = () => setIsOpen(!isOpen);
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
        <Card className="mb-3 d-flex flex-row align-items-start">
          <CardBody className="d-flex flex-row align-items-center justify-content-between">
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
                {/* Unit 1 */}
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
                </ListGroupItem>

                {/* Exercises */}
                <ListGroupItem>
                  <h5 className="mb-2">1.4 A video about trees</h5>
                  <div className="video-wrapper">
                    <iframe
                      width="560"
                      height="315"
                      src="https://www.youtube.com/embed/samplevideo"
                      title="YouTube video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    <p className="text-center">trees</p>
                  </div>
                </ListGroupItem>

                <ListGroupItem>
                  <h5 className="mb-2">1.5 Gap Fill Exercise</h5>
                  <p>
                    There <Input type="text" name="blank1" placeholder="are" /> a chair in the room. There{' '}
                    <Input type="text" name="blank2" placeholder="are" /> some people on the street.
                  </p>
                </ListGroupItem>

                <ListGroupItem>
                  <h5 className="mb-2">1.6 A Test</h5>
                  <p>Which is a fruit?</p>
                  <div>
                    <Input type="radio" name="test" /> Chair
                    <br />
                    <Input type="radio" name="test" /> Car
                    <br />
                    <Input type="radio" name="test" /> Cherry
                  </div>
                </ListGroupItem>

                <ListGroupItem>
                  <h5 className="mb-2">1.7 An article about robots</h5>
                  <div className="article">
                    <img src="/path/to/robot-poster.jpg" alt="something about robots" className="article-image" />
                    <p>In the bustling city of Neotropolis...</p>
                  </div>
                </ListGroupItem>

                <ListGroupItem>
                  <h5 className="mb-2">1.8 Text about robots</h5>
                  <p>Robots are machines designed to perform tasks autonomously or with minimal human intervention...</p>
                </ListGroupItem>

                <ListGroupItem>
                  <h5 className="mb-2">1.9 Writing Exercise about Robots</h5>
                  <Input type="textarea" placeholder="Write something about robots" />
                </ListGroupItem>

                <ListGroupItem>
                  <h5 className="mb-2">1.10 Audio Exercise</h5>
                  <audio controls>
                    <source src="/path/to/robot-audio.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </ListGroupItem>

                {/* Continue adding more exercises as shown in the screenshots... */}
                <ListGroupItem>
                  <h5 className="mb-2">1.17 Unscramble</h5>
                  <div className="unscramble-block">
                    <p>Autonomously</p>
                    <Input type="text" placeholder="Type the word" />
                    <Button color="primary" className="mt-2">Test</Button>
                  </div>
                </ListGroupItem>

                {/* External Link */}
                <ListGroupItem>
                  <h5 className="mb-2">1.19 External Link</h5>
                  <a href="https://www.example.com" target="_blank" rel="noopener noreferrer">
                    Follow the link
                  </a>
                </ListGroupItem>

              </ListGroup>
            </CardBody>
          </Collapse>
        </Card>
      </div>
    </div>
  );
};

export default SectionViewerV3;

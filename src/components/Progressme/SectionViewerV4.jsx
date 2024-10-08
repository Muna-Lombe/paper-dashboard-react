import React, { useState } from 'react';
import { Card, CardBody, CardTitle, CardSubtitle, Collapse, Button, ListGroup, ListGroupItem, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Input } from 'reactstrap';

const SectionViewerV4 = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [gapFillAnswers, setGapFillAnswers] = useState({
    blank1: '',
    blank2: ''
  });

  const toggleSection = () => setIsOpen(!isOpen);
  const toggleDropdown = (id) => setDropdownOpen(prevState => (prevState === id ? null : id));

  return (
    <div id="content" className="content" style={{ minHeight: 'calc(-97px + 100vh)' }}>
      <div className="data_wrapper">
        {/* Section Card */}
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

          {/* Lessons List */}
          <Collapse isOpen={isOpen}>
            <CardBody className="pt-0">
              <ListGroup flush>
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
                  <h5 className="mb-2">1.13 Words Order</h5>
                  <div>Robots are machines <Input type="text" /> autonomously...</div>
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
                  <div className="matching">
                    <div>Robots are machines <Input type="text" />...</div>
                  </div>
                </ListGroupItem>

                {/* Exercise 1.17: Unscramble */}
                <ListGroupItem>
                  <h5 className="mb-2">1.17 Unscramble</h5>
                  <div className="unscramble-block">
                    <p>Autonomously</p>
                    <Input type="text" placeholder="Type the word" />
                  </div>
                </ListGroupItem>

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

export default SectionViewerV4;

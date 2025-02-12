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
  FormGroup,
  Label
} from 'reactstrap';

const SectionViewerV1 = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [gapFillAnswers, setGapFillAnswers] = useState({
    blank1: '',
    blank2: ''
  });

  const toggleSection = () => setIsOpen(!isOpen);
  const toggleLessonModal = () => setIsLessonOpen(!isLessonOpen);
  const toggleDropdown = (id) => {
    setDropdownOpen(prevState => (prevState === id ? null : id));
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleGapFillChange = (e) => {
    setGapFillAnswers({
      ...gapFillAnswers,
      [e.target.name]: e.target.value
    });
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
                {/* Existing Lessons */}
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

                {/* New Unit Button */}
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
              <div className="lesson-section">
                <h4 className="lesson_section_header_text d-flex align-items-center">
                  Section 1
                  <Button color="link" className="p-0 ms-2">
                    <i className="bi bi-pencil"></i>
                  </Button>
                </h4>

                {/* Exercises List */}
                <div className="exercises-list mt-4">
                  {/* Exercise Item 1.1 */}
                  <div className="exercise_wrapper mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <div
                          className="icon_wrapper me-3"
                          style={{
                            backgroundColor: 'rgb(240, 251, 255)',
                            borderRadius: '50%',
                            height: '40px',
                            width: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <span style={{ color: 'rgb(51, 204, 255)', fontWeight: 'bold' }}>1.1</span>
                        </div>
                        <h5 className="mb-0">Some Instructions</h5>
                      </div>
                      <ExerciseActions />
                    </div>
                    <div className="exercise-content">
                      <p>
                        <span>Hello </span>
                        <span className="text-primary">[drag word here]</span>
                        <span>(someone).</span>
                      </p>
                    </div>
                  </div>

                  {/* Additional exercises (1.2 - 1.11) would follow the same structure */}
                </div>
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
  );
};

const ExerciseActions = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <div className="exercise-common-ui-components-actions" style={{ zIndex: 15 }}>
      <div className="icon_more_wrapper">
        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
          <DropdownToggle tag="span" data-toggle="dropdown">
            <img
              src="/path/to/icon-more.svg"
              alt="Icon-More"
              className="exercise-common-ui-components-actions-icon"
            />
          </DropdownToggle>
          <DropdownMenu end className="box-dropdown animation-up">
            <DropdownItem className="exercise-common-ui-components-actions-menu-item">
              <div className="icon-reset">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="rgb(82, 82, 102)">
                  <g id="Icon_Reset" data-name="Icon Reset">
                    <path id="Icon" d="M17.65 6.35A8 8 0 1 0 19.73 14h-2.08A6 6 0 1 1 12 6a5.915 5.915 0 0 1 4.22 1.78L13 11h7V4z"></path>
                  </g>
                </svg>
              </div>
              <span>Reset the answers</span>
            </DropdownItem>
            <DropdownItem className="exercise-common-ui-components-actions-menu-item">
              <img src="/path/to/icon-position.svg" alt="Change position" />
              <span>Change position</span>
            </DropdownItem>
            <DropdownItem className="exercise-common-ui-components-actions-menu-item">
              <img src="/path/to/icon-edit.svg" alt="Edit exercise" />
              <span>Edit exercise</span>
            </DropdownItem>
            <DropdownItem className="exercise-common-ui-components-actions-menu-item">
              <img src="/path/to/icon-delete.svg" alt="Delete exercise" />
              <span>Delete exercise</span>
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem className="exercise-common-ui-components-actions-menu-item">
              <img src="/path/to/icon-copy.svg" alt="Copy exercise(s)" />
              <span>Copy exercise(s) to...</span>
            </DropdownItem>
            <DropdownItem className="exercise-common-ui-components-actions-menu-item">
              <img src="/path/to/icon-reply.svg" alt="Move exercise(s)" />
              <span>Move exercise(s) to...</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default SectionViewerV1;

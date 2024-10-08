










part 1:
import React, { useState } from 'react'
import {
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  Collapse,
  Button,
  ListGroup,
  ListGroupItem
} from 'reactstrap'

const Section = () => {
  const [isOpen, setIsOpen] = useState(true)

  const toggleSection = () => setIsOpen(!isOpen)

  return (
    <div
      id='content'
      className='content'
      style={{ minHeight: 'calc(-97px + 100vh)' }}
    >
      <div className='data_wrapper'>
        {/* Section Card */}
        <Card className='mb-3'>
          <CardBody className='d-flex align-items-center justify-content-between'>
            {/* Section Image */}
            <div className='d-flex align-items-center'>
              <div
                className='user_photo_wrapper course-image me-3'
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
                <span
                  className='user_inits'
                  style={{ color: 'rgb(230, 149, 230)', fontSize: '2rem' }}
                >
                  S
                </span>
              </div>
              {/* Section Title */}
              <div>
                <CardTitle tag='h5'>Section 1</CardTitle>
              </div>
            </div>
            {/* Actions */}
            <div className='d-flex align-items-center'>
              {/* More Options */}
              <div className='me-3'>
                <Button
                  color='link'
                  className='text-decoration-none text-secondary'
                >
                  <i className='bi bi-three-dots-vertical'></i>
                </Button>
                {/* Dropdown Menu Placeholder */}
              </div>
              {/* Toggle Collapse */}
              <Button
                color='link'
                className='text-decoration-none text-secondary'
                onClick={toggleSection}
              >
                {isOpen ? (
                  <i className='bi bi-chevron-up'></i>
                ) : (
                  <i className='bi bi-chevron-down'></i>
                )}
              </Button>
            </div>
          </CardBody>
          {/* Lessons List */}
          <Collapse isOpen={isOpen}>
            <CardBody className='pt-0'>
              <ListGroup flush>
                <ListGroupItem className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    {/* Lesson Image */}
                    <div
                      className='user_photo_wrapper lesson-image me-3'
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
                      <span
                        className='user_inits'
                        style={{
                          color: 'rgb(230, 149, 230)',
                          fontSize: '1.5rem'
                        }}
                      >
                        U
                      </span>
                    </div>
                    {/* Lesson Title */}
                    <div>
                      <CardSubtitle tag='h6' className='mb-0'>
                        Unit 1
                      </CardSubtitle>
                    </div>
                  </div>
                  {/* Open Lesson Button */}
                  <Button color='primary' size='sm'>
                    Open Unit
                  </Button>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Collapse>
        </Card>
      </div>
    </div>
  )
}

export default Section


part 2:
import React, { useState } from 'react'
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
  ModalFooter
} from 'reactstrap'

const Section = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isLessonOpen, setIsLessonOpen] = useState(false)

  const toggleSection = () => setIsOpen(!isOpen)
  const toggleLessonModal = () => setIsLessonOpen(!isLessonOpen)

  return (
    <div
      id='content'
      className='content'
      style={{ minHeight: 'calc(-97px + 100vh)' }}
    >
      <div className='data_wrapper'>
        {/* Section Card */}
        <Card className='mb-3'>
          <CardBody className='d-flex align-items-center justify-content-between'>
            {/* Section Image */}
            <div className='d-flex align-items-center'>
              <div
                className='user_photo_wrapper course-image me-3'
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
                <span
                  className='user_inits'
                  style={{ color: 'rgb(230, 149, 230)', fontSize: '2rem' }}
                >
                  S
                </span>
              </div>
              {/* Section Title */}
              <div>
                <CardTitle tag='h5'>Section 1</CardTitle>
              </div>
            </div>
            {/* Actions */}
            <div className='d-flex align-items-center'>
              {/* More Options */}
              <div className='me-3'>
                <Button
                  color='link'
                  className='text-decoration-none text-secondary'
                >
                  <i className='bi bi-three-dots-vertical'></i>
                </Button>
                {/* Dropdown Menu Placeholder */}
              </div>
              {/* Toggle Collapse */}
              <Button
                color='link'
                className='text-decoration-none text-secondary'
                onClick={toggleSection}
              >
                {isOpen ? (
                  <i className='bi bi-chevron-up'></i>
                ) : (
                  <i className='bi bi-chevron-down'></i>
                )}
              </Button>
            </div>
          </CardBody>
          {/* Lessons List */}
          <Collapse isOpen={isOpen}>
            <CardBody className='pt-0'>
              <ListGroup flush>
                {/* Existing Lesson Item */}
                <ListGroupItem className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    {/* Lesson Image */}
                    <div
                      className='user_photo_wrapper lesson-image me-3'
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
                      <span
                        className='user_inits'
                        style={{
                          color: 'rgb(230, 149, 230)',
                          fontSize: '1.5rem'
                        }}
                      >
                        U
                      </span>
                    </div>
                    {/* Lesson Title */}
                    <div>
                      <CardSubtitle tag='h6' className='mb-0'>
                        Unit 1
                      </CardSubtitle>
                    </div>
                  </div>
                  {/* Open Lesson Button */}
                  <Button color='primary' size='sm' onClick={toggleLessonModal}>
                    Open Unit
                  </Button>
                </ListGroupItem>

                {/* New Unit Button */}
                <ListGroupItem
                  className='d-flex align-items-center justify-content-start hover-item'
                  style={{ cursor: 'pointer' }}
                >
                  <div className='d-flex align-items-center'>
                    <Button color='secondary' className='me-3' size='sm'>
                      <i className='bi bi-plus-lg'></i>
                    </Button>
                    <div>New Unit</div>
                  </div>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Collapse>
        </Card>

        {/* Lesson Modal */}
        <Modal isOpen={isLessonOpen} toggle={toggleLessonModal} size='lg'>
          <ModalHeader toggle={toggleLessonModal}>Unit 1</ModalHeader>
          <ModalBody>
            {/* Lesson Content */}
            <div className='lesson-content'>
              {/* Section Header */}
              <div className='lesson-section'>
                <h4 className='lesson_section_header_text d-flex align-items-center'>
                  Section 1
                  <Button color='link' className='p-0 ms-2'>
                    <i className='bi bi-pencil'></i>
                  </Button>
                </h4>

                {/* Exercises List */}
                <div className='exercises-list mt-4'>
                  {/* Exercise Item */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.1
                          </span>
                        </div>
                        <h5 className='mb-0'>Some Instructions</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Button
                        color='link'
                        className='text-decoration-none text-secondary'
                      >
                        <i className='bi bi-three-dots-vertical'></i>
                      </Button>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      {/* Example draggable exercise content */}
                      <p>
                        <span>Hello </span>
                        <span className='text-primary'>[drag word here]</span>
                        <span>(someone).</span>
                      </p>
                    </div>
                  </div>

                  {/* Another Exercise Item */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.2
                          </span>
                        </div>
                        <h5 className='mb-0'>Carousel of Pictures</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Button
                        color='link'
                        className='text-decoration-none text-secondary'
                      >
                        <i className='bi bi-three-dots-vertical'></i>
                      </Button>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      {/* Placeholder for carousel */}
                      <div className='carousel-placeholder bg-light p-5 text-center'>
                        Carousel of pictures about something
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={toggleLessonModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

export default Section


part 3:
import React, { useState } from 'react'
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
  DropdownItem
} from 'reactstrap'

const Section = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isLessonOpen, setIsLessonOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggleSection = () => setIsOpen(!isOpen)
  const toggleLessonModal = () => setIsLessonOpen(!isLessonOpen)
  const toggleDropdown = () => setDropdownOpen(prevState => !prevState)

  return (
    <div
      id='content'
      className='content'
      style={{ minHeight: 'calc(-97px + 100vh)' }}
    >
      <div className='data_wrapper'>
        {/* Section Card */}
        <Card className='mb-3'>
          <CardBody className='d-flex align-items-center justify-content-between'>
            {/* Section Image */}
            <div className='d-flex align-items-center'>
              <div
                className='user_photo_wrapper course-image me-3'
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
                <span
                  className='user_inits'
                  style={{ color: 'rgb(230, 149, 230)', fontSize: '2rem' }}
                >
                  S
                </span>
              </div>
              {/* Section Title */}
              <div>
                <CardTitle tag='h5'>Section 1</CardTitle>
              </div>
            </div>
            {/* Actions */}
            <div className='d-flex align-items-center'>
              {/* More Options */}
              <div className='me-3'>
                <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                  <DropdownToggle
                    tag='span'
                    data-toggle='dropdown'
                    aria-expanded={dropdownOpen}
                  >
                    <Button
                      color='link'
                      className='text-decoration-none text-secondary'
                    >
                      <i className='bi bi-three-dots-vertical'></i>
                    </Button>
                  </DropdownToggle>
                  <DropdownMenu end>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              {/* Toggle Collapse */}
              <Button
                color='link'
                className='text-decoration-none text-secondary'
                onClick={toggleSection}
              >
                {isOpen ? (
                  <i className='bi bi-chevron-up'></i>
                ) : (
                  <i className='bi bi-chevron-down'></i>
                )}
              </Button>
            </div>
          </CardBody>
          {/* Lessons List */}
          <Collapse isOpen={isOpen}>
            <CardBody className='pt-0'>
              <ListGroup flush>
                {/* Existing Lesson Item */}
                <ListGroupItem className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    {/* Lesson Image */}
                    <div
                      className='user_photo_wrapper lesson-image me-3'
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
                      <span
                        className='user_inits'
                        style={{
                          color: 'rgb(230, 149, 230)',
                          fontSize: '1.5rem'
                        }}
                      >
                        U
                      </span>
                    </div>
                    {/* Lesson Title */}
                    <div>
                      <CardSubtitle tag='h6' className='mb-0'>
                        Unit 1
                      </CardSubtitle>
                    </div>
                  </div>
                  {/* Open Lesson Button */}
                  <Button color='primary' size='sm' onClick={toggleLessonModal}>
                    Open Unit
                  </Button>
                </ListGroupItem>

                {/* New Unit Button */}
                <ListGroupItem
                  className='d-flex align-items-center justify-content-start hover-item'
                  style={{ cursor: 'pointer' }}
                >
                  <div className='d-flex align-items-center'>
                    <Button color='secondary' className='me-3' size='sm'>
                      <i className='bi bi-plus-lg'></i>
                    </Button>
                    <div>New Unit</div>
                  </div>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Collapse>
        </Card>

        {/* Lesson Modal */}
        <Modal isOpen={isLessonOpen} toggle={toggleLessonModal} size='lg'>
          <ModalHeader toggle={toggleLessonModal}>Unit 1</ModalHeader>
          <ModalBody>
            {/* Lesson Content */}
            <div className='lesson-content'>
              {/* Section Header */}
              <div className='lesson-section'>
                <h4 className='lesson_section_header_text d-flex align-items-center'>
                  Section 1
                  <Button color='link' className='p-0 ms-2'>
                    <i className='bi bi-pencil'></i>
                  </Button>
                </h4>

                {/* Exercises List */}
                <div className='exercises-list mt-4'>
                  {/* Exercise Item 1.1 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.1
                          </span>
                        </div>
                        <h5 className='mb-0'>Some Instructions</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem>Reset the answers</DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      {/* Example draggable exercise content */}
                      <p>
                        <span>Hello </span>
                        <span className='text-primary'>[friend]</span>
                        <span>(someone).</span>
                      </p>
                    </div>
                  </div>

                  {/* Exercise Item 1.2 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.2
                          </span>
                        </div>
                        <h5 className='mb-0'>Carousel of Pictures</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem disabled>
                            Reset the answers
                          </DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      {/* Carousel */}
                      <div
                        id='carouselExampleIndicators'
                        className='carousel slide'
                        data-bs-ride='carousel'
                      >
                        <div className='carousel-indicators'>
                          <button
                            type='button'
                            data-bs-target='#carouselExampleIndicators'
                            data-bs-slide-to='0'
                            className='active'
                            aria-current='true'
                            aria-label='Slide 1'
                          ></button>
                          <button
                            type='button'
                            data-bs-target='#carouselExampleIndicators'
                            data-bs-slide-to='1'
                            aria-label='Slide 2'
                          ></button>
                        </div>
                        <div className='carousel-inner'>
                          <div className='carousel-item active'>
                            <img
                              src='https://s3.eu-central-1.amazonaws.com/progressme.ru/files/LessonExerciseImages/14f11261-16ad-4730-a7ce-8ae0286ff914.jpg'
                              className='d-block w-100'
                              alt='First Slide'
                            />
                          </div>
                          <div className='carousel-item'>
                            <img
                              src='https://s3.eu-central-1.amazonaws.com/progressme.ru/files/LessonExerciseImages/39980998-20cf-49d9-bd11-63a5daf0b6d3.jpg'
                              className='d-block w-100'
                              alt='Second Slide'
                            />
                          </div>
                        </div>
                        <button
                          className='carousel-control-prev'
                          type='button'
                          data-bs-target='#carouselExampleIndicators'
                          data-bs-slide='prev'
                        >
                          <span
                            className='carousel-control-prev-icon'
                            aria-hidden='true'
                          ></span>
                          <span className='visually-hidden'>Previous</span>
                        </button>
                        <button
                          className='carousel-control-next'
                          type='button'
                          data-bs-target='#carouselExampleIndicators'
                          data-bs-slide='next'
                        >
                          <span
                            className='carousel-control-next-icon'
                            aria-hidden='true'
                          ></span>
                          <span className='visually-hidden'>Next</span>
                        </button>
                      </div>
                      <p className='mt-2'>A table</p>
                    </div>
                  </div>

                  {/* Exercise Item 1.3 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.3
                          </span>
                        </div>
                        <h5 className='mb-0'>A GIF about Something Funny</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem disabled>
                            Reset the answers
                          </DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      {/* GIF */}
                      <div className='text-center'>
                        <img
                          src='https://media4.giphy.com/media/142Y941q45XPdm/giphy.gif'
                          alt='Funny GIF'
                          className='img-fluid mb-2'
                        />
                        <p>Some cats</p>
                      </div>
                    </div>
                  </div>

                  {/* Exercise Item 1.4 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.4
                          </span>
                        </div>
                        <h5 className='mb-0'>A Video about Trees</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem disabled>
                            Reset the answers
                          </DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      {/* Video */}
                      <div className='ratio ratio-16x9'>
                        <iframe
                          src='https://www.youtube.com/embed/VIDEO_ID'
                          title='Video about Trees'
                          allowFullScreen
                        ></iframe>
                      </div>
                      <p className='mt-2'>A video about trees.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={toggleLessonModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

export default Section

part 4:
import React, { useState } from 'react'
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
  DropdownItem
} from 'reactstrap'

const Section = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isLessonOpen, setIsLessonOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)

  const toggleSection = () => setIsOpen(!isOpen)
  const toggleLessonModal = () => setIsLessonOpen(!isLessonOpen)

  const toggleDropdown = id => {
    setDropdownOpen(prevState => (prevState === id ? null : id))
  }

  return (
    <div
      id='content'
      className='content'
      style={{ minHeight: 'calc(-97px + 100vh)' }}
    >
      <div className='data_wrapper'>
        {/* Section Card */}
        <Card className='mb-3'>
          <CardBody className='d-flex align-items-center justify-content-between'>
            {/* Section Image */}
            <div className='d-flex align-items-center'>
              <div
                className='user_photo_wrapper course-image me-3'
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
                <span
                  className='user_inits'
                  style={{ color: 'rgb(230, 149, 230)', fontSize: '2rem' }}
                >
                  S
                </span>
              </div>
              {/* Section Title */}
              <div>
                <CardTitle tag='h5'>Section 1</CardTitle>
              </div>
            </div>
            {/* Actions */}
            <div className='d-flex align-items-center'>
              {/* More Options */}
              <div className='me-3'>
                <Dropdown
                  isOpen={dropdownOpen === 'section'}
                  toggle={() => toggleDropdown('section')}
                >
                  <DropdownToggle
                    tag='span'
                    data-toggle='dropdown'
                    aria-expanded={dropdownOpen === 'section'}
                  >
                    <Button
                      color='link'
                      className='text-decoration-none text-secondary'
                    >
                      <i className='bi bi-three-dots-vertical'></i>
                    </Button>
                  </DropdownToggle>
                  <DropdownMenu end>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              {/* Toggle Collapse */}
              <Button
                color='link'
                className='text-decoration-none text-secondary'
                onClick={toggleSection}
              >
                {isOpen ? (
                  <i className='bi bi-chevron-up'></i>
                ) : (
                  <i className='bi bi-chevron-down'></i>
                )}
              </Button>
            </div>
          </CardBody>
          {/* Lessons List */}
          <Collapse isOpen={isOpen}>
            <CardBody className='pt-0'>
              <ListGroup flush>
                {/* Existing Lesson Item */}
                <ListGroupItem className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    {/* Lesson Image */}
                    <div
                      className='user_photo_wrapper lesson-image me-3'
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
                      <span
                        className='user_inits'
                        style={{
                          color: 'rgb(230, 149, 230)',
                          fontSize: '1.5rem'
                        }}
                      >
                        U
                      </span>
                    </div>
                    {/* Lesson Title */}
                    <div>
                      <CardSubtitle tag='h6' className='mb-0'>
                        Unit 1
                      </CardSubtitle>
                    </div>
                  </div>
                  {/* Open Lesson Button */}
                  <Button color='primary' size='sm' onClick={toggleLessonModal}>
                    Open Unit
                  </Button>
                </ListGroupItem>

                {/* New Unit Button */}
                <ListGroupItem
                  className='d-flex align-items-center justify-content-start hover-item'
                  style={{ cursor: 'pointer' }}
                >
                  <div className='d-flex align-items-center'>
                    <Button color='secondary' className='me-3' size='sm'>
                      <i className='bi bi-plus-lg'></i>
                    </Button>
                    <div>New Unit</div>
                  </div>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Collapse>
        </Card>

        {/* Lesson Modal */}
        <Modal isOpen={isLessonOpen} toggle={toggleLessonModal} size='lg'>
          <ModalHeader toggle={toggleLessonModal}>Unit 1</ModalHeader>
          <ModalBody>
            {/* Lesson Content */}
            <div className='lesson-content'>
              {/* Section Header */}
              <div className='lesson-section'>
                <h4 className='lesson_section_header_text d-flex align-items-center'>
                  Section 1
                  <Button color='link' className='p-0 ms-2'>
                    <i className='bi bi-pencil'></i>
                  </Button>
                </h4>

                {/* Exercises List */}
                <div className='exercises-list mt-4'>
                  {/* Previous exercises (1.1 to 1.4) */}
                  {/* ... [Keep existing exercises here] ... */}

                  {/* Exercise Item 1.5 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.5
                          </span>
                        </div>
                        <h5 className='mb-0'>Fill in the Blanks</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown
                        isOpen={dropdownOpen === 'exercise1.5'}
                        toggle={() => toggleDropdown('exercise1.5')}
                      >
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen === 'exercise1.5'}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem>Reset the answers</DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      {/* Draggable Words */}
                      <div className='mb-3'>
                        <span className='me-2'>
                          Drag the correct word into the sentence:
                        </span>
                        <div className='d-inline-flex'>
                          <Button color='light' className='me-2'>
                            are
                          </Button>
                          <Button color='light'>is</Button>
                        </div>
                      </div>
                      {/* Sentence with Placeholders */}
                      <p>
                        There{' '}
                        <span className='border-bottom border-dark px-2'>
                          {/* Placeholder for 'is' */}
                        </span>{' '}
                        a chair in the room. There{' '}
                        <span className='border-bottom border-dark px-2'>
                          {/* Placeholder for 'are' */}
                        </span>{' '}
                        some books on the table.
                      </p>
                      {/* Note: Implement drag-and-drop functionality as needed */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={toggleLessonModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

export default Section


part 5:
import React, { useState } from 'react'
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
  FormGroup,
  Label,
  Input
} from 'reactstrap'

const Section = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isLessonOpen, setIsLessonOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [selectedOption, setSelectedOption] = useState('')

  const toggleSection = () => setIsOpen(!isOpen)
  const toggleLessonModal = () => setIsLessonOpen(!isLessonOpen)

  const toggleDropdown = id => {
    setDropdownOpen(prevState => (prevState === id ? null : id))
  }

  const handleOptionChange = e => {
    setSelectedOption(e.target.value)
  }

  return (
    <div
      id='content'
      className='content'
      style={{ minHeight: 'calc(-97px + 100vh)' }}
    >
      <div className='data_wrapper'>
        {/* Section Card */}
        <Card className='mb-3'>
          <CardBody className='d-flex align-items-center justify-content-between'>
            {/* Section Image */}
            <div className='d-flex align-items-center'>
              <div
                className='user_photo_wrapper course-image me-3'
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
                <span
                  className='user_inits'
                  style={{ color: 'rgb(230, 149, 230)', fontSize: '2rem' }}
                >
                  S
                </span>
              </div>
              {/* Section Title */}
              <div>
                <CardTitle tag='h5'>Section 1</CardTitle>
              </div>
            </div>
            {/* Actions */}
            <div className='d-flex align-items-center'>
              {/* More Options */}
              <div className='me-3'>
                <Dropdown
                  isOpen={dropdownOpen === 'section'}
                  toggle={() => toggleDropdown('section')}
                >
                  <DropdownToggle
                    tag='span'
                    data-toggle='dropdown'
                    aria-expanded={dropdownOpen === 'section'}
                  >
                    <Button
                      color='link'
                      className='text-decoration-none text-secondary'
                    >
                      <i className='bi bi-three-dots-vertical'></i>
                    </Button>
                  </DropdownToggle>
                  <DropdownMenu end>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              {/* Toggle Collapse */}
              <Button
                color='link'
                className='text-decoration-none text-secondary'
                onClick={toggleSection}
              >
                {isOpen ? (
                  <i className='bi bi-chevron-up'></i>
                ) : (
                  <i className='bi bi-chevron-down'></i>
                )}
              </Button>
            </div>
          </CardBody>
          {/* Lessons List */}
          <Collapse isOpen={isOpen}>
            <CardBody className='pt-0'>
              <ListGroup flush>
                {/* Existing Lesson Item */}
                <ListGroupItem className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    {/* Lesson Image */}
                    <div
                      className='user_photo_wrapper lesson-image me-3'
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
                      <span
                        className='user_inits'
                        style={{
                          color: 'rgb(230, 149, 230)',
                          fontSize: '1.5rem'
                        }}
                      >
                        U
                      </span>
                    </div>
                    {/* Lesson Title */}
                    <div>
                      <CardSubtitle tag='h6' className='mb-0'>
                        Unit 1
                      </CardSubtitle>
                    </div>
                  </div>
                  {/* Open Lesson Button */}
                  <Button color='primary' size='sm' onClick={toggleLessonModal}>
                    Open Unit
                  </Button>
                </ListGroupItem>

                {/* New Unit Button */}
                <ListGroupItem
                  className='d-flex align-items-center justify-content-start hover-item'
                  style={{ cursor: 'pointer' }}
                >
                  <div className='d-flex align-items-center'>
                    <Button color='secondary' className='me-3' size='sm'>
                      <i className='bi bi-plus-lg'></i>
                    </Button>
                    <div>New Unit</div>
                  </div>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Collapse>
        </Card>

        {/* Lesson Modal */}
        <Modal isOpen={isLessonOpen} toggle={toggleLessonModal} size='lg'>
          <ModalHeader toggle={toggleLessonModal}>Unit 1</ModalHeader>
          <ModalBody>
            {/* Lesson Content */}
            <div className='lesson-content'>
              {/* Section Header */}
              <div className='lesson-section'>
                <h4 className='lesson_section_header_text d-flex align-items-center'>
                  Section 1
                  <Button color='link' className='p-0 ms-2'>
                    <i className='bi bi-pencil'></i>
                  </Button>
                </h4>

                {/* Exercises List */}
                <div className='exercises-list mt-4'>
                  {/* Previous exercises (1.1 to 1.5) */}
                  {/* ... [Keep existing exercises here] ... */}

                  {/* Exercise Item 1.6 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.6
                          </span>
                        </div>
                        <h5 className='mb-0'>A Test</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown
                        isOpen={dropdownOpen === 'exercise1.6'}
                        toggle={() => toggleDropdown('exercise1.6')}
                      >
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen === 'exercise1.6'}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem>Reset the answers</DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      {/* Multiple-choice Question */}
                      <p>
                        <strong>Which is a fruit?</strong>
                      </p>
                      <FormGroup check>
                        <Input
                          type='radio'
                          name='fruitQuestion'
                          value='chair'
                          id='optionChair'
                          checked={selectedOption === 'chair'}
                          onChange={handleOptionChange}
                        />
                        <Label for='optionChair' check>
                          Chair
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Input
                          type='radio'
                          name='fruitQuestion'
                          value='car'
                          id='optionCar'
                          checked={selectedOption === 'car'}
                          onChange={handleOptionChange}
                        />
                        <Label for='optionCar' check>
                          Car
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Input
                          type='radio'
                          name='fruitQuestion'
                          value='cherry'
                          id='optionCherry'
                          checked={selectedOption === 'cherry'}
                          onChange={handleOptionChange}
                        />
                        <Label for='optionCherry' check>
                          Cherry
                        </Label>
                      </FormGroup>
                    </div>
                  </div>

                  {/* Exercise Item 1.7 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.7
                          </span>
                        </div>
                        <h5 className='mb-0'>An Article about Something</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown
                        isOpen={dropdownOpen === 'exercise1.7'}
                        toggle={() => toggleDropdown('exercise1.7')}
                      >
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen === 'exercise1.7'}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem disabled>
                            Reset the answers
                          </DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      {/* Placeholder for Article */}
                      <p>
                        This is an article about something interesting. It
                        covers various topics and provides insights into the
                        subject matter.
                      </p>
                    </div>
                  </div>

                  {/* ... Additional exercises can be added here ... */}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={toggleLessonModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

export default Section


part 6:
import React, { useState } from 'react'
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
  DropdownItem
} from 'reactstrap'

const Section = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isLessonOpen, setIsLessonOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)

  const toggleSection = () => setIsOpen(!isOpen)
  const toggleLessonModal = () => setIsLessonOpen(!isLessonOpen)

  const toggleDropdown = id => {
    setDropdownOpen(prevState => (prevState === id ? null : id))
  }

  return (
    <div
      id='content'
      className='content'
      style={{ minHeight: 'calc(-97px + 100vh)' }}
    >
      <div className='data_wrapper'>
        {/* Section Card */}
        <Card className='mb-3'>
          <CardBody className='d-flex align-items-center justify-content-between'>
            {/* Section Image */}
            <div className='d-flex align-items-center'>
              <div
                className='user_photo_wrapper course-image me-3'
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
                <span
                  className='user_inits'
                  style={{ color: 'rgb(230, 149, 230)', fontSize: '2rem' }}
                >
                  S
                </span>
              </div>
              {/* Section Title */}
              <div>
                <CardTitle tag='h5'>Section 1</CardTitle>
              </div>
            </div>
            {/* Actions */}
            <div className='d-flex align-items-center'>
              {/* More Options */}
              <div className='me-3'>
                <Dropdown
                  isOpen={dropdownOpen === 'section'}
                  toggle={() => toggleDropdown('section')}
                >
                  <DropdownToggle
                    tag='span'
                    data-toggle='dropdown'
                    aria-expanded={dropdownOpen === 'section'}
                  >
                    <Button
                      color='link'
                      className='text-decoration-none text-secondary'
                    >
                      <i className='bi bi-three-dots-vertical'></i>
                    </Button>
                  </DropdownToggle>
                  <DropdownMenu end>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              {/* Toggle Collapse */}
              <Button
                color='link'
                className='text-decoration-none text-secondary'
                onClick={toggleSection}
              >
                {isOpen ? (
                  <i className='bi bi-chevron-up'></i>
                ) : (
                  <i className='bi bi-chevron-down'></i>
                )}
              </Button>
            </div>
          </CardBody>
          {/* Lessons List */}
          <Collapse isOpen={isOpen}>
            <CardBody className='pt-0'>
              <ListGroup flush>
                {/* Existing Lesson Item */}
                <ListGroupItem className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    {/* Lesson Image */}
                    <div
                      className='user_photo_wrapper lesson-image me-3'
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
                      <span
                        className='user_inits'
                        style={{
                          color: 'rgb(230, 149, 230)',
                          fontSize: '1.5rem'
                        }}
                      >
                        U
                      </span>
                    </div>
                    {/* Lesson Title */}
                    <div>
                      <CardSubtitle tag='h6' className='mb-0'>
                        Unit 1
                      </CardSubtitle>
                    </div>
                  </div>
                  {/* Open Lesson Button */}
                  <Button color='primary' size='sm' onClick={toggleLessonModal}>
                    Open Unit
                  </Button>
                </ListGroupItem>

                {/* New Unit Button */}
                <ListGroupItem
                  className='d-flex align-items-center justify-content-start hover-item'
                  style={{ cursor: 'pointer' }}
                >
                  <div className='d-flex align-items-center'>
                    <Button color='secondary' className='me-3' size='sm'>
                      <i className='bi bi-plus-lg'></i>
                    </Button>
                    <div>New Unit</div>
                  </div>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Collapse>
        </Card>

        {/* Lesson Modal */}
        <Modal isOpen={isLessonOpen} toggle={toggleLessonModal} size='lg'>
          <ModalHeader toggle={toggleLessonModal}>Unit 1</ModalHeader>
          <ModalBody>
            {/* Lesson Content */}
            <div className='lesson-content'>
              {/* Section Header */}
              <div className='lesson-section'>
                <h4 className='lesson_section_header_text d-flex align-items-center'>
                  Section 1
                  <Button color='link' className='p-0 ms-2'>
                    <i className='bi bi-pencil'></i>
                  </Button>
                </h4>

                {/* Exercises List */}
                <div className='exercises-list mt-4'>
                  {/* Previous exercises (1.1 to 1.7) */}
                  {/* ... [Keep existing exercises here] ... */}

                  {/* Exercise Item 1.8 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.8
                          </span>
                        </div>
                        <h5 className='mb-0'>Something About Robots</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown
                        isOpen={dropdownOpen === 'exercise1.8'}
                        toggle={() => toggleDropdown('exercise1.8')}
                      >
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen === 'exercise1.8'}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem disabled>
                            Reset the answers
                          </DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      {/* Image */}
                      <div className='mb-3'>
                        <img
                          src='https://s3.eu-central-1.amazonaws.com/progressme.ru/files/LessonExerciseImages/a0ac64ae-93a6-45b4-8046-3dffaff481cb.jpg'
                          alt='Robots'
                          className='img-fluid rounded'
                        />
                      </div>
                      {/* Story */}
                      <div>
                        <p>
                          In the bustling city of Neotropolis, a quirky
                          household robot named Z3N loved to tell stories and
                          help the Johnson children, Mia and Leo. When they grew
                          anxious about their upcoming school talent show—Mia
                          too shy to sing solo and Leo lacking confidence for
                          his magic act—Z3N had an idea.
                        </p>
                        <p>
                          “Why not perform together?” he suggested. Over the
                          next few days, Z3N transformed their living room into
                          a mini stage, helping them practice and build their
                          confidence. He taught Mia to project her voice and
                          helped Leo perfect his tricks, all while sharing tales
                          of famous performers who overcame their fears.
                        </p>
                        <p>
                          On the night of the show, Mia and Leo stood backstage,
                          nerves bubbling. “What if we mess up?” Mia whispered.
                          Z3N reassured them, “It’s about sharing joy, not
                          perfection. I’ll be right here!”
                        </p>
                        <p>
                          When they took the stage, the audience was captivated.
                          Mia’s voice soared, and Leo’s magic amazed everyone.
                          As the crowd erupted in applause, the children beamed
                          with pride.
                        </p>
                        <p>
                          After the performance, they rushed to Z3N, gratitude
                          shining in their eyes. “Thank you, Z3N! We couldn’t
                          have done it without you!”
                        </p>
                        <p>
                          Z3N smiled, his LED eyes sparkling. “You found your
                          courage. I just helped you see it.” From that day on,
                          the little robot remained a cherished friend, proving
                          that even the smallest of helpers can make a big
                          difference.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Exercise Item 1.9 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.9
                          </span>
                        </div>
                        <h5 className='mb-0'>A Text About Robots</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown
                        isOpen={dropdownOpen === 'exercise1.9'}
                        toggle={() => toggleDropdown('exercise1.9')}
                      >
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen === 'exercise1.9'}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem disabled>
                            Reset the answers
                          </DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      <p>
                        Robots are machines designed to perform tasks
                        autonomously or with minimal human intervention. They
                        come in various forms, from industrial robots that
                        assemble cars to personal assistants like smart
                        speakers. With advancements in artificial intelligence,
                        robots are becoming increasingly capable of learning and
                        adapting to their environments, making them valuable in
                        fields such as healthcare, manufacturing, and
                        exploration. As technology evolves, the role of robots
                        in our daily lives continues to expand, promising a
                        future where they enhance productivity and improve
                        quality of life.
                      </p>
                    </div>
                  </div>

                  {/* ... Additional exercises can be added here ... */}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={toggleLessonModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

export default Section


part 7:
import React, { useState } from 'react'
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
  Input
} from 'reactstrap'

const Section = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isLessonOpen, setIsLessonOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [gapFillAnswers, setGapFillAnswers] = useState({
    blank1: '',
    blank2: ''
  })

  const toggleSection = () => setIsOpen(!isOpen)
  const toggleLessonModal = () => setIsLessonOpen(!isLessonOpen)

  const toggleDropdown = id => {
    setDropdownOpen(prevState => (prevState === id ? null : id))
  }

  const handleGapFillChange = e => {
    setGapFillAnswers({
      ...gapFillAnswers,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div
      id='content'
      className='content'
      style={{ minHeight: 'calc(-97px + 100vh)' }}
    >
      <div className='data_wrapper'>
        {/* Section Card */}
        <Card className='mb-3'>
          <CardBody className='d-flex align-items-center justify-content-between'>
            {/* Section Image */}
            <div className='d-flex align-items-center'>
              <div
                className='user_photo_wrapper course-image me-3'
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
                <span
                  className='user_inits'
                  style={{ color: 'rgb(230, 149, 230)', fontSize: '2rem' }}
                >
                  S
                </span>
              </div>
              {/* Section Title */}
              <div>
                <CardTitle tag='h5'>Section 1</CardTitle>
              </div>
            </div>
            {/* Actions */}
            <div className='d-flex align-items-center'>
              {/* More Options */}
              <div className='me-3'>
                <Dropdown
                  isOpen={dropdownOpen === 'section'}
                  toggle={() => toggleDropdown('section')}
                >
                  <DropdownToggle
                    tag='span'
                    data-toggle='dropdown'
                    aria-expanded={dropdownOpen === 'section'}
                  >
                    <Button
                      color='link'
                      className='text-decoration-none text-secondary'
                    >
                      <i className='bi bi-three-dots-vertical'></i>
                    </Button>
                  </DropdownToggle>
                  <DropdownMenu end>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              {/* Toggle Collapse */}
              <Button
                color='link'
                className='text-decoration-none text-secondary'
                onClick={toggleSection}
              >
                {isOpen ? (
                  <i className='bi bi-chevron-up'></i>
                ) : (
                  <i className='bi bi-chevron-down'></i>
                )}
              </Button>
            </div>
          </CardBody>
          {/* Lessons List */}
          <Collapse isOpen={isOpen}>
            <CardBody className='pt-0'>
              <ListGroup flush>
                {/* Existing Lesson Item */}
                <ListGroupItem className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    {/* Lesson Image */}
                    <div
                      className='user_photo_wrapper lesson-image me-3'
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
                      <span
                        className='user_inits'
                        style={{
                          color: 'rgb(230, 149, 230)',
                          fontSize: '1.5rem'
                        }}
                      >
                        U
                      </span>
                    </div>
                    {/* Lesson Title */}
                    <div>
                      <CardSubtitle tag='h6' className='mb-0'>
                        Unit 1
                      </CardSubtitle>
                    </div>
                  </div>
                  {/* Open Lesson Button */}
                  <Button color='primary' size='sm' onClick={toggleLessonModal}>
                    Open Unit
                  </Button>
                </ListGroupItem>

                {/* New Unit Button */}
                <ListGroupItem
                  className='d-flex align-items-center justify-content-start hover-item'
                  style={{ cursor: 'pointer' }}
                >
                  <div className='d-flex align-items-center'>
                    <Button color='secondary' className='me-3' size='sm'>
                      <i className='bi bi-plus-lg'></i>
                    </Button>
                    <div>New Unit</div>
                  </div>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Collapse>
        </Card>

        {/* Lesson Modal */}
        <Modal isOpen={isLessonOpen} toggle={toggleLessonModal} size='lg'>
          <ModalHeader toggle={toggleLessonModal}>Unit 1</ModalHeader>
          <ModalBody>
            {/* Lesson Content */}
            <div className='lesson-content'>
              {/* Section Header */}
              <div className='lesson-section'>
                <h4 className='lesson_section_header_text d-flex align-items-center'>
                  Section 1
                  <Button color='link' className='p-0 ms-2'>
                    <i className='bi bi-pencil'></i>
                  </Button>
                </h4>

                {/* Exercises List */}
                <div className='exercises-list mt-4'>
                  {/* Previous exercises (1.1 to 1.9) */}
                  {/* ... [Keep existing exercises here] ... */}

                  {/* Exercise Item 1.10 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.10
                          </span>
                        </div>
                        <h5 className='mb-0'>An Audio</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown
                        isOpen={dropdownOpen === 'exercise1.10'}
                        toggle={() => toggleDropdown('exercise1.10')}
                      >
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen === 'exercise1.10'}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem disabled>
                            Reset the answers
                          </DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      {/* Audio Player */}
                      <div className='mb-3'>
                        <audio controls className='w-100'>
                          <source
                            src='https://s3.eu-central-1.amazonaws.com/progressme.ru/files/GenerationAudio/bf0164a5-b507-4dbf-b974-e72a537f5110.mp3'
                            type='audio/mpeg'
                          />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                      {/* Audio Script */}
                      <div className='mt-3'>
                        <h6>Script</h6>
                        <p>
                          Robots are machines designed to perform tasks
                          autonomously or with minimal human intervention. They
                          come in various forms, from industrial robots that
                          assemble cars to personal assistants like smart
                          speakers. With advancements in artificial
                          intelligence, robots are becoming increasingly capable
                          of learning and adapting to their environments, making
                          them valuable in fields such as healthcare,
                          manufacturing, and exploration. As technology evolves,
                          the role of robots in our daily lives continues to
                          expand, promising a future where they enhance
                          productivity and improve quality of life.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Exercise Item 1.11 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.11
                          </span>
                        </div>
                        <h5 className='mb-0'>Gap Fill No Box</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown
                        isOpen={dropdownOpen === 'exercise1.11'}
                        toggle={() => toggleDropdown('exercise1.11')}
                      >
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen === 'exercise1.11'}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem>Reset the answers</DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      <p>
                        Robots are machines designed to{' '}
                        <Input
                          type='text'
                          name='blank1'
                          value={gapFillAnswers.blank1}
                          onChange={handleGapFillChange}
                          placeholder='fill in the blank'
                          className='d-inline-block mx-2'
                          style={{ width: '150px', display: 'inline' }}
                        />{' '}
                        tasks autonomously or with minimal human intervention.
                        They come in various forms, from industrial robots that
                        assemble cars to personal assistants like smart
                        speakers.
                      </p>
                      {/* Add more text with blanks as needed */}
                    </div>
                  </div>

                  {/* ... Additional exercises can be added here ... */}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={toggleLessonModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

export default Section


part 8:
import React, { useState } from 'react'
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
  Input
} from 'reactstrap'

const Section = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isLessonOpen, setIsLessonOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [gapFillAnswers, setGapFillAnswers] = useState({
    blank1: '',
    blank2: '',
    blank3: '',
    blank4: '',
    blank5: '',
    blank6: ''
  })

  const toggleSection = () => setIsOpen(!isOpen)
  const toggleLessonModal = () => setIsLessonOpen(!isLessonOpen)

  const toggleDropdown = id => {
    setDropdownOpen(prevState => (prevState === id ? null : id))
  }

  const handleGapFillChange = e => {
    setGapFillAnswers({
      ...gapFillAnswers,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div
      id='content'
      className='content'
      style={{ minHeight: 'calc(-97px + 100vh)' }}
    >
      <div className='data_wrapper'>
        {/* Section Card */}
        <Card className='mb-3'>
          <CardBody className='d-flex align-items-center justify-content-between'>
            {/* Section Image */}
            <div className='d-flex align-items-center'>
              <div
                className='user_photo_wrapper course-image me-3'
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
                <span
                  className='user_inits'
                  style={{ color: 'rgb(230, 149, 230)', fontSize: '2rem' }}
                >
                  S
                </span>
              </div>
              {/* Section Title */}
              <div>
                <CardTitle tag='h5'>Section 1</CardTitle>
              </div>
            </div>
            {/* Actions */}
            <div className='d-flex align-items-center'>
              {/* More Options */}
              <div className='me-3'>
                <Dropdown
                  isOpen={dropdownOpen === 'section'}
                  toggle={() => toggleDropdown('section')}
                >
                  <DropdownToggle
                    tag='span'
                    data-toggle='dropdown'
                    aria-expanded={dropdownOpen === 'section'}
                  >
                    <Button
                      color='link'
                      className='text-decoration-none text-secondary'
                    >
                      <i className='bi bi-three-dots-vertical'></i>
                    </Button>
                  </DropdownToggle>
                  <DropdownMenu end>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              {/* Toggle Collapse */}
              <Button
                color='link'
                className='text-decoration-none text-secondary'
                onClick={toggleSection}
              >
                {isOpen ? (
                  <i className='bi bi-chevron-up'></i>
                ) : (
                  <i className='bi bi-chevron-down'></i>
                )}
              </Button>
            </div>
          </CardBody>
          {/* Lessons List */}
          <Collapse isOpen={isOpen}>
            <CardBody className='pt-0'>
              <ListGroup flush>
                {/* Existing Lesson Item */}
                <ListGroupItem className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    {/* Lesson Image */}
                    <div
                      className='user_photo_wrapper lesson-image me-3'
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
                      <span
                        className='user_inits'
                        style={{
                          color: 'rgb(230, 149, 230)',
                          fontSize: '1.5rem'
                        }}
                      >
                        U
                      </span>
                    </div>
                    {/* Lesson Title */}
                    <div>
                      <CardSubtitle tag='h6' className='mb-0'>
                        Unit 1
                      </CardSubtitle>
                    </div>
                  </div>
                  {/* Open Lesson Button */}
                  <Button color='primary' size='sm' onClick={toggleLessonModal}>
                    Open Unit
                  </Button>
                </ListGroupItem>

                {/* New Unit Button */}
                <ListGroupItem
                  className='d-flex align-items-center justify-content-start hover-item'
                  style={{ cursor: 'pointer' }}
                >
                  <div className='d-flex align-items-center'>
                    <Button color='secondary' className='me-3' size='sm'>
                      <i className='bi bi-plus-lg'></i>
                    </Button>
                    <div>New Unit</div>
                  </div>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Collapse>
        </Card>

        {/* Lesson Modal */}
        <Modal isOpen={isLessonOpen} toggle={toggleLessonModal} size='lg'>
          <ModalHeader toggle={toggleLessonModal}>Unit 1</ModalHeader>
          <ModalBody>
            {/* Lesson Content */}
            <div className='lesson-content'>
              {/* Section Header */}
              <div className='lesson-section'>
                <h4 className='lesson_section_header_text d-flex align-items-center'>
                  Section 1
                  <Button color='link' className='p-0 ms-2'>
                    <i className='bi bi-pencil'></i>
                  </Button>
                </h4>

                {/* Exercises List */}
                <div className='exercises-list mt-4'>
                  {/* Previous exercises (1.1 to 1.10) */}
                  {/* ... [Keep existing exercises here] ... */}

                  {/* Exercise Item 1.11 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.11
                          </span>
                        </div>
                        <h5 className='mb-0'>Gap Fill No Box</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown
                        isOpen={dropdownOpen === 'exercise1.11'}
                        toggle={() => toggleDropdown('exercise1.11')}
                      >
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen === 'exercise1.11'}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem>Reset the answers</DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      <p>
                        Robots{' '}
                        <Input
                          type='text'
                          name='blank1'
                          value={gapFillAnswers.blank1}
                          onChange={handleGapFillChange}
                          placeholder=''
                          className='d-inline-block mx-2'
                          style={{ width: '60px', display: 'inline' }}
                        />{' '}
                        machines designed to perform tasks autonomously or with
                        minimal human intervention. They come{' '}
                        <Input
                          type='text'
                          name='blank2'
                          value={gapFillAnswers.blank2}
                          onChange={handleGapFillChange}
                          placeholder=''
                          className='d-inline-block mx-2'
                          style={{ width: '60px', display: 'inline' }}
                        />{' '}
                        various forms, from industrial robots that assemble cars
                        to personal assistants like smart speakers. With
                        advancements in artificial intelligence, robots{' '}
                        <Input
                          type='text'
                          name='blank3'
                          value={gapFillAnswers.blank3}
                          onChange={handleGapFillChange}
                          placeholder=''
                          className='d-inline-block mx-2'
                          style={{ width: '60px', display: 'inline' }}
                        />{' '}
                        becoming increasingly capable of learning and adapting{' '}
                        <Input
                          type='text'
                          name='blank4'
                          value={gapFillAnswers.blank4}
                          onChange={handleGapFillChange}
                          placeholder=''
                          className='d-inline-block mx-2'
                          style={{ width: '60px', display: 'inline' }}
                        />{' '}
                        their environments, making{' '}
                        <Input
                          type='text'
                          name='blank5'
                          value={gapFillAnswers.blank5}
                          onChange={handleGapFillChange}
                          placeholder=''
                          className='d-inline-block mx-2'
                          style={{ width: '60px', display: 'inline' }}
                        />{' '}
                        valuable in fields such as healthcare, manufacturing,
                        and exploration. As technology evolves, the role{' '}
                        <Input
                          type='text'
                          name='blank6'
                          value={gapFillAnswers.blank6}
                          onChange={handleGapFillChange}
                          placeholder=''
                          className='d-inline-block mx-2'
                          style={{ width: '60px', display: 'inline' }}
                        />{' '}
                        robots in our daily lives continues to expand, promising
                        a future where they enhance productivity and improve
                        quality of life.
                      </p>
                    </div>
                  </div>

                  {/* Exercise Item 1.12 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.12
                          </span>
                        </div>
                        <h5 className='mb-0'>Picture Label</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown
                        isOpen={dropdownOpen === 'exercise1.12'}
                        toggle={() => toggleDropdown('exercise1.12')}
                      >
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen === 'exercise1.12'}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem>Reset the answers</DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      {/* Placeholder for Picture Label Exercise */}
                      <p>
                        Below is an image of a robot. Label the different parts
                        of the robot by filling in the blanks.
                      </p>
                      <div className='mb-3'>
                        <img
                          src='https://example.com/robot-image.jpg'
                          alt='Robot Diagram'
                          className='img-fluid'
                        />
                      </div>
                      {/* Labels */}
                      <div>
                        <p>
                          1.{' '}
                          <Input
                            type='text'
                            name='label1'
                            placeholder='Label 1'
                            className='d-inline-block mx-2'
                            style={{ width: '150px', display: 'inline' }}
                          />
                        </p>
                        <p>
                          2.{' '}
                          <Input
                            type='text'
                            name='label2'
                            placeholder='Label 2'
                            className='d-inline-block mx-2'
                            style={{ width: '150px', display: 'inline' }}
                          />
                        </p>
                        {/* Add more labels as needed */}
                      </div>
                    </div>
                  </div>

                  {/* ... Additional exercises can be added here ... */}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={toggleLessonModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

export default Section


part 9:
import React, { useState } from 'react'
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
  DropdownItem
} from 'reactstrap'

const Section = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isLessonOpen, setIsLessonOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [draggedWord, setDraggedWord] = useState(null)
  const [imageLabels, setImageLabels] = useState({
    image1: '',
    image2: ''
  })
  const [wordOrder, setWordOrder] = useState([])

  const toggleSection = () => setIsOpen(!isOpen)
  const toggleLessonModal = () => setIsLessonOpen(!isLessonOpen)

  const toggleDropdown = id => {
    setDropdownOpen(prevState => (prevState === id ? null : id))
  }

  // Drag and Drop Handlers for Exercise 1.12
  const onDragStart = (e, word) => {
    setDraggedWord(word)
  }

  const onDrop = (e, imageId) => {
    e.preventDefault()
    setImageLabels(prev => ({
      ...prev,
      [imageId]: draggedWord
    }))
    setDraggedWord(null)
  }

  const onDragOver = e => {
    e.preventDefault()
  }

  // Word Order Handlers for Exercise 1.13
  const words = ['Robots', 'are', 'becoming', 'increasingly', 'capable']
  const [availableWords, setAvailableWords] = useState(words)
  const [orderedWords, setOrderedWords] = useState([])

  const addWordToOrder = word => {
    setOrderedWords([...orderedWords, word])
    setAvailableWords(availableWords.filter(w => w !== word))
  }

  const removeWordFromOrder = word => {
    setAvailableWords([...availableWords, word])
    setOrderedWords(orderedWords.filter(w => w !== word))
  }

  return (
    <div
      id='content'
      className='content'
      style={{ minHeight: 'calc(-97px + 100vh)' }}
    >
      <div className='data_wrapper'>
        {/* Section Card */}
        <Card className='mb-3'>
          <CardBody className='d-flex align-items-center justify-content-between'>
            {/* Section Image */}
            <div className='d-flex align-items-center'>
              <div
                className='user_photo_wrapper course-image me-3'
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
                <span
                  className='user_inits'
                  style={{ color: 'rgb(230, 149, 230)', fontSize: '2rem' }}
                >
                  S
                </span>
              </div>
              {/* Section Title */}
              <div>
                <CardTitle tag='h5'>Section 1</CardTitle>
              </div>
            </div>
            {/* Actions */}
            <div className='d-flex align-items-center'>
              {/* More Options */}
              <div className='me-3'>
                <Dropdown
                  isOpen={dropdownOpen === 'section'}
                  toggle={() => toggleDropdown('section')}
                >
                  <DropdownToggle
                    tag='span'
                    data-toggle='dropdown'
                    aria-expanded={dropdownOpen === 'section'}
                  >
                    <Button
                      color='link'
                      className='text-decoration-none text-secondary'
                    >
                      <i className='bi bi-three-dots-vertical'></i>
                    </Button>
                  </DropdownToggle>
                  <DropdownMenu end>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              {/* Toggle Collapse */}
              <Button
                color='link'
                className='text-decoration-none text-secondary'
                onClick={toggleSection}
              >
                {isOpen ? (
                  <i className='bi bi-chevron-up'></i>
                ) : (
                  <i className='bi bi-chevron-down'></i>
                )}
              </Button>
            </div>
          </CardBody>
          {/* Lessons List */}
          <Collapse isOpen={isOpen}>
            <CardBody className='pt-0'>
              <ListGroup flush>
                {/* Existing Lesson Item */}
                <ListGroupItem className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    {/* Lesson Image */}
                    <div
                      className='user_photo_wrapper lesson-image me-3'
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
                      <span
                        className='user_inits'
                        style={{
                          color: 'rgb(230, 149, 230)',
                          fontSize: '1.5rem'
                        }}
                      >
                        U
                      </span>
                    </div>
                    {/* Lesson Title */}
                    <div>
                      <CardSubtitle tag='h6' className='mb-0'>
                        Unit 1
                      </CardSubtitle>
                    </div>
                  </div>
                  {/* Open Lesson Button */}
                  <Button color='primary' size='sm' onClick={toggleLessonModal}>
                    Open Unit
                  </Button>
                </ListGroupItem>

                {/* New Unit Button */}
                <ListGroupItem
                  className='d-flex align-items-center justify-content-start hover-item'
                  style={{ cursor: 'pointer' }}
                >
                  <div className='d-flex align-items-center'>
                    <Button color='secondary' className='me-3' size='sm'>
                      <i className='bi bi-plus-lg'></i>
                    </Button>
                    <div>New Unit</div>
                  </div>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Collapse>
        </Card>

        {/* Lesson Modal */}
        <Modal isOpen={isLessonOpen} toggle={toggleLessonModal} size='lg'>
          <ModalHeader toggle={toggleLessonModal}>Unit 1</ModalHeader>
          <ModalBody>
            {/* Lesson Content */}
            <div className='lesson-content'>
              {/* Section Header */}
              <div className='lesson-section'>
                <h4 className='lesson_section_header_text d-flex align-items-center'>
                  Section 1
                  <Button color='link' className='p-0 ms-2'>
                    <i className='bi bi-pencil'></i>
                  </Button>
                </h4>

                {/* Exercises List */}
                <div className='exercises-list mt-4'>
                  {/* Previous exercises (1.1 to 1.12) */}
                  {/* ... [Keep existing exercises here] ... */}

                  {/* Exercise Item 1.12 (Updated) */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.12
                          </span>
                        </div>
                        <h5 className='mb-0'>Picture Label</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown
                        isOpen={dropdownOpen === 'exercise1.12'}
                        toggle={() => toggleDropdown('exercise1.12')}
                      >
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen === 'exercise1.12'}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem>Reset the answers</DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      <p>Drag the words to the correct images.</p>
                      {/* Words to Drag */}
                      <div className='d-flex mb-3'>
                        {['robot', 'chair'].map(word => (
                          <div
                            key={word}
                            draggable
                            onDragStart={e => onDragStart(e, word)}
                            className='border rounded p-2 me-2'
                            style={{ cursor: 'grab' }}
                          >
                            {word}
                          </div>
                        ))}
                      </div>
                      {/* Images */}
                      <div className='d-flex'>
                        {/* Image 1 */}
                        <div
                          onDragOver={onDragOver}
                          onDrop={e => onDrop(e, 'image1')}
                          className='me-3 text-center'
                          style={{ border: '1px solid #ccc', padding: '10px' }}
                        >
                          <img
                            src='https://s3.eu-central-1.amazonaws.com/progressme.ru/files/LessonExerciseImages/cb9c7603-d035-43dd-a387-599691c7b556.jpg'
                            alt='Image 1'
                            className='img-fluid mb-2'
                            style={{ maxWidth: '150px' }}
                          />
                          <div>
                            {imageLabels.image1 ? (
                              <span className='badge bg-primary'>
                                {imageLabels.image1}
                              </span>
                            ) : (
                              'Drop word here'
                            )}
                          </div>
                        </div>
                        {/* Image 2 */}
                        <div
                          onDragOver={onDragOver}
                          onDrop={e => onDrop(e, 'image2')}
                          className='text-center'
                          style={{ border: '1px solid #ccc', padding: '10px' }}
                        >
                          <img
                            src='https://s3.eu-central-1.amazonaws.com/progressme.ru/files/LessonExerciseImages/fc64e392-29c9-4019-8848-837e32ceda8b.jpg'
                            alt='Image 2'
                            className='img-fluid mb-2'
                            style={{ maxWidth: '150px' }}
                          />
                          <div>
                            {imageLabels.image2 ? (
                              <span className='badge bg-primary'>
                                {imageLabels.image2}
                              </span>
                            ) : (
                              'Drop word here'
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Exercise Item 1.13 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.13
                          </span>
                        </div>
                        <h5 className='mb-0'>Words Order</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown
                        isOpen={dropdownOpen === 'exercise1.13'}
                        toggle={() => toggleDropdown('exercise1.13')}
                      >
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen === 'exercise1.13'}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem>Reset the answers</DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      <p>Arrange the words to form a meaningful sentence.</p>
                      {/* Available Words */}
                      <div className='d-flex flex-wrap mb-3'>
                        {availableWords.map(word => (
                          <Button
                            key={word}
                            color='secondary'
                            outline
                            className='me-2 mb-2'
                            onClick={() => addWordToOrder(word)}
                          >
                            {word}
                          </Button>
                        ))}
                      </div>
                      {/* Ordered Words */}
                      <div className='border p-3'>
                        {orderedWords.length > 0 ? (
                          orderedWords.map(word => (
                            <Button
                              key={word}
                              color='primary'
                              className='me-2 mb-2'
                              onClick={() => removeWordFromOrder(word)}
                            >
                              {word}
                            </Button>
                          ))
                        ) : (
                          <p className='text-muted'>
                            Click words above to build the sentence.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ... Additional exercises can be added here ... */}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={toggleLessonModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

export default Section


part 10:
import React, { useState } from 'react'
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
  DropdownItem
} from 'reactstrap'

const Section = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isLessonOpen, setIsLessonOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)

  const toggleSection = () => setIsOpen(!isOpen)
  const toggleLessonModal = () => setIsLessonOpen(!isLessonOpen)

  const toggleDropdown = id => {
    setDropdownOpen(prevState => (prevState === id ? null : id))
  }

  // State for Exercise 1.13
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const tasks = [
    {
      id: 1,
      phrases: [
        'Robots are machines',
        'designed to perform tasks',
        'autonomously or with',
        'minimal human intervention.'
      ],
      correctOrder: [
        'Robots are machines',
        'designed to perform tasks',
        'autonomously or with',
        'minimal human intervention.'
      ]
    },
    {
      id: 2,
      phrases: [
        'They come in',
        ', from industrial robots',
        'that assemble cars to personal assistants',
        'like smart speakers.',
        'various forms'
      ],
      correctOrder: [
        'They come in',
        'various forms',
        ', from industrial robots',
        'that assemble cars to personal assistants',
        'like smart speakers.'
      ]
    },
    {
      id: 3,
      phrases: [
        'With advancements in artificial intelligence,',
        'robots are becoming increasingly capable of learning',
        'and adapting to their environments,',
        'making them valuable in fields such as healthcare,',
        'manufacturing, and exploration.'
      ],
      correctOrder: [
        'With advancements in artificial intelligence,',
        'robots are becoming increasingly capable of learning',
        'and adapting to their environments,',
        'making them valuable in fields such as healthcare,',
        'manufacturing, and exploration.'
      ]
    }
  ]

  const [userOrder, setUserOrder] = useState([])
  const [availablePhrases, setAvailablePhrases] = useState(
    tasks[currentTaskIndex].phrases
  )

  const addPhraseToOrder = phrase => {
    setUserOrder([...userOrder, phrase])
    setAvailablePhrases(availablePhrases.filter(p => p !== phrase))
  }

  const removePhraseFromOrder = phrase => {
    setAvailablePhrases([...availablePhrases, phrase])
    setUserOrder(userOrder.filter(p => p !== phrase))
  }

  const resetExercise = () => {
    setUserOrder([])
    setAvailablePhrases(tasks[currentTaskIndex].phrases)
  }

  const nextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1)
      setUserOrder([])
      setAvailablePhrases(tasks[currentTaskIndex + 1].phrases)
    }
  }

  const prevTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1)
      setUserOrder([])
      setAvailablePhrases(tasks[currentTaskIndex - 1].phrases)
    }
  }

  const checkAnswer = () => {
    const isCorrect =
      userOrder.join(' ') === tasks[currentTaskIndex].correctOrder.join(' ')
    alert(isCorrect ? 'Correct!' : 'Incorrect. Please try again.')
  }

  return (
    <div
      id='content'
      className='content'
      style={{ minHeight: 'calc(-97px + 100vh)' }}
    >
      <div className='data_wrapper'>
        {/* Section Card */}
        <Card className='mb-3'>
          <CardBody className='d-flex align-items-center justify-content-between'>
            {/* Section Image */}
            <div className='d-flex align-items-center'>
              <div
                className='user_photo_wrapper course-image me-3'
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
                <span
                  className='user_inits'
                  style={{ color: 'rgb(230, 149, 230)', fontSize: '2rem' }}
                >
                  S
                </span>
              </div>
              {/* Section Title */}
              <div>
                <CardTitle tag='h5'>Section 1</CardTitle>
              </div>
            </div>
            {/* Actions */}
            <div className='d-flex align-items-center'>
              {/* More Options */}
              <div className='me-3'>
                <Dropdown
                  isOpen={dropdownOpen === 'section'}
                  toggle={() => toggleDropdown('section')}
                >
                  <DropdownToggle
                    tag='span'
                    data-toggle='dropdown'
                    aria-expanded={dropdownOpen === 'section'}
                  >
                    <Button
                      color='link'
                      className='text-decoration-none text-secondary'
                    >
                      <i className='bi bi-three-dots-vertical'></i>
                    </Button>
                  </DropdownToggle>
                  <DropdownMenu end>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              {/* Toggle Collapse */}
              <Button
                color='link'
                className='text-decoration-none text-secondary'
                onClick={toggleSection}
              >
                {isOpen ? (
                  <i className='bi bi-chevron-up'></i>
                ) : (
                  <i className='bi bi-chevron-down'></i>
                )}
              </Button>
            </div>
          </CardBody>
          {/* Lessons List */}
          <Collapse isOpen={isOpen}>
            <CardBody className='pt-0'>
              <ListGroup flush>
                {/* Existing Lesson Item */}
                <ListGroupItem className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    {/* Lesson Image */}
                    <div
                      className='user_photo_wrapper lesson-image me-3'
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
                      <span
                        className='user_inits'
                        style={{
                          color: 'rgb(230, 149, 230)',
                          fontSize: '1.5rem'
                        }}
                      >
                        U
                      </span>
                    </div>
                    {/* Lesson Title */}
                    <div>
                      <CardSubtitle tag='h6' className='mb-0'>
                        Unit 1
                      </CardSubtitle>
                    </div>
                  </div>
                  {/* Open Lesson Button */}
                  <Button color='primary' size='sm' onClick={toggleLessonModal}>
                    Open Unit
                  </Button>
                </ListGroupItem>

                {/* New Unit Button */}
                <ListGroupItem
                  className='d-flex align-items-center justify-content-start hover-item'
                  style={{ cursor: 'pointer' }}
                >
                  <div className='d-flex align-items-center'>
                    <Button color='secondary' className='me-3' size='sm'>
                      <i className='bi bi-plus-lg'></i>
                    </Button>
                    <div>New Unit</div>
                  </div>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Collapse>
        </Card>

        {/* Lesson Modal */}
        <Modal isOpen={isLessonOpen} toggle={toggleLessonModal} size='lg'>
          <ModalHeader toggle={toggleLessonModal}>Unit 1</ModalHeader>
          <ModalBody>
            {/* Lesson Content */}
            <div className='lesson-content'>
              {/* Section Header */}
              <div className='lesson-section'>
                <h4 className='lesson_section_header_text d-flex align-items-center'>
                  Section 1
                  <Button color='link' className='p-0 ms-2'>
                    <i className='bi bi-pencil'></i>
                  </Button>
                </h4>

                {/* Exercises List */}
                <div className='exercises-list mt-4'>
                  {/* Previous exercises (1.1 to 1.12) */}
                  {/* ... [Keep existing exercises here] ... */}

                  {/* Exercise Item 1.13 (Updated) */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.13
                          </span>
                        </div>
                        <h5 className='mb-0'>Words Order</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown
                        isOpen={dropdownOpen === 'exercise1.13'}
                        toggle={() => toggleDropdown('exercise1.13')}
                      >
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen === 'exercise1.13'}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem onClick={resetExercise}>
                            Reset the answers
                          </DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      <p>Arrange the phrases to form the correct sentence.</p>
                      {/* Available Phrases */}
                      <div className='d-flex flex-wrap mb-3'>
                        {availablePhrases.map((phrase, index) => (
                          <Button
                            key={index}
                            color='secondary'
                            outline
                            className='me-2 mb-2'
                            onClick={() => addPhraseToOrder(phrase)}
                          >
                            {phrase}
                          </Button>
                        ))}
                      </div>
                      {/* User's Ordered Phrases */}
                      <div className='border p-3 mb-3'>
                        {userOrder.length > 0 ? (
                          userOrder.map((phrase, index) => (
                            <Button
                              key={index}
                              color='primary'
                              className='me-2 mb-2'
                              onClick={() => removePhraseFromOrder(phrase)}
                            >
                              {phrase}
                            </Button>
                          ))
                        ) : (
                          <p className='text-muted'>
                            Click phrases above to build the sentence.
                          </p>
                        )}
                      </div>
                      {/* Controls */}
                      <div className='d-flex justify-content-between align-items-center'>
                        <div>
                          <Button
                            color='secondary'
                            onClick={prevTask}
                            disabled={currentTaskIndex === 0}
                          >
                            Previous
                          </Button>
                          <span className='mx-3'>
                            Task {currentTaskIndex + 1} / {tasks.length}
                          </span>
                          <Button
                            color='secondary'
                            onClick={nextTask}
                            disabled={currentTaskIndex === tasks.length - 1}
                          >
                            Next
                          </Button>
                        </div>
                        <Button color='success' onClick={checkAnswer}>
                          Check Answer
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* ... Additional exercises can be added here ... */}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={toggleLessonModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

export default Section


part 11:
import React, { useState, useEffect } from 'react'
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
  UncontrolledDropdown
} from 'reactstrap'

const Section = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isLessonOpen, setIsLessonOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)

  const toggleSection = () => setIsOpen(!isOpen)
  const toggleLessonModal = () => setIsLessonOpen(!isLessonOpen)

  const toggleDropdown = id => {
    setDropdownOpen(prevState => (prevState === id ? null : id))
  }

  // State for Exercise 1.14
  const [optionAnswers, setOptionAnswers] = useState({
    blank1: '',
    blank2: ''
  })

  const options = {
    blank1: ['are', 'is', 'am'],
    blank2: ['to', 'by', 'for']
  }

  const handleOptionChange = (blank, value) => {
    setOptionAnswers({
      ...optionAnswers,
      [blank]: value
    })
  }

  return (
    <div
      id='content'
      className='content'
      style={{ minHeight: 'calc(-97px + 100vh)' }}
    >
      <div className='data_wrapper'>
        {/* Section Card */}
        <Card className='mb-3'>
          <CardBody className='d-flex align-items-center justify-content-between'>
            {/* Section Image */}
            <div className='d-flex align-items-center'>
              <div
                className='user_photo_wrapper course-image me-3'
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
                <span
                  className='user_inits'
                  style={{ color: 'rgb(230, 149, 230)', fontSize: '2rem' }}
                >
                  S
                </span>
              </div>
              {/* Section Title */}
              <div>
                <CardTitle tag='h5'>Section 1</CardTitle>
              </div>
            </div>
            {/* Actions */}
            <div className='d-flex align-items-center'>
              {/* More Options */}
              <div className='me-3'>
                <Dropdown
                  isOpen={dropdownOpen === 'section'}
                  toggle={() => toggleDropdown('section')}
                >
                  <DropdownToggle
                    tag='span'
                    data-toggle='dropdown'
                    aria-expanded={dropdownOpen === 'section'}
                  >
                    <Button
                      color='link'
                      className='text-decoration-none text-secondary'
                    >
                      <i className='bi bi-three-dots-vertical'></i>
                    </Button>
                  </DropdownToggle>
                  <DropdownMenu end>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              {/* Toggle Collapse */}
              <Button
                color='link'
                className='text-decoration-none text-secondary'
                onClick={toggleSection}
              >
                {isOpen ? (
                  <i className='bi bi-chevron-up'></i>
                ) : (
                  <i className='bi bi-chevron-down'></i>
                )}
              </Button>
            </div>
          </CardBody>
          {/* Lessons List */}
          <Collapse isOpen={isOpen}>
            <CardBody className='pt-0'>
              <ListGroup flush>
                {/* Existing Lesson Item */}
                <ListGroupItem className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    {/* Lesson Image */}
                    <div
                      className='user_photo_wrapper lesson-image me-3'
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
                      <span
                        className='user_inits'
                        style={{
                          color: 'rgb(230, 149, 230)',
                          fontSize: '1.5rem'
                        }}
                      >
                        U
                      </span>
                    </div>
                    {/* Lesson Title */}
                    <div>
                      <CardSubtitle tag='h6' className='mb-0'>
                        Unit 1
                      </CardSubtitle>
                    </div>
                  </div>
                  {/* Open Lesson Button */}
                  <Button color='primary' size='sm' onClick={toggleLessonModal}>
                    Open Unit
                  </Button>
                </ListGroupItem>

                {/* New Unit Button */}
                <ListGroupItem
                  className='d-flex align-items-center justify-content-start hover-item'
                  style={{ cursor: 'pointer' }}
                >
                  <div className='d-flex align-items-center'>
                    <Button color='secondary' className='me-3' size='sm'>
                      <i className='bi bi-plus-lg'></i>
                    </Button>
                    <div>New Unit</div>
                  </div>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Collapse>
        </Card>

        {/* Lesson Modal */}
        <Modal isOpen={isLessonOpen} toggle={toggleLessonModal} size='lg'>
          <ModalHeader toggle={toggleLessonModal}>Unit 1</ModalHeader>
          <ModalBody>
            {/* Lesson Content */}
            <div className='lesson-content'>
              {/* Section Header */}
              <div className='lesson-section'>
                <h4 className='lesson_section_header_text d-flex align-items-center'>
                  Section 1
                  <Button color='link' className='p-0 ms-2'>
                    <i className='bi bi-pencil'></i>
                  </Button>
                </h4>

                {/* Exercises List */}
                <div className='exercises-list mt-4'>
                  {/* Previous exercises (1.1 to 1.13) */}
                  {/* ... [Keep existing exercises here] ... */}

                  {/* Exercise Item 1.14 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.14
                          </span>
                        </div>
                        <h5 className='mb-0'>Option Choose</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown
                        isOpen={dropdownOpen === 'exercise1.14'}
                        toggle={() => toggleDropdown('exercise1.14')}
                      >
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen === 'exercise1.14'}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem
                            onClick={() =>
                              setOptionAnswers({
                                blank1: '',
                                blank2: ''
                              })
                            }
                          >
                            Reset the answers
                          </DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      <p>
                        Robots {/* Blank 1 */}
                        <UncontrolledDropdown className='d-inline'>
                          <DropdownToggle
                            caret
                            color='secondary'
                            className='mx-1'
                            style={{ display: 'inline' }}
                          >
                            {optionAnswers.blank1 || 'Select'}
                          </DropdownToggle>
                          <DropdownMenu>
                            {options.blank1.map(option => (
                              <DropdownItem
                                key={option}
                                onClick={() =>
                                  handleOptionChange('blank1', option)
                                }
                              >
                                {option}
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </UncontrolledDropdown>{' '}
                        machines designed {/* Blank 2 */}
                        <UncontrolledDropdown className='d-inline'>
                          <DropdownToggle
                            caret
                            color='secondary'
                            className='mx-1'
                            style={{ display: 'inline' }}
                          >
                            {optionAnswers.blank2 || 'Select'}
                          </DropdownToggle>
                          <DropdownMenu>
                            {options.blank2.map(option => (
                              <DropdownItem
                                key={option}
                                onClick={() =>
                                  handleOptionChange('blank2', option)
                                }
                              >
                                {option}
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </UncontrolledDropdown>{' '}
                        perform tasks autonomously.
                      </p>
                    </div>
                  </div>

                  {/* ... Additional exercises can be added here ... */}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={toggleLessonModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

export default Section


part 12:
import React, { useState } from 'react'
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
  DropdownItem
} from 'reactstrap'

const Section = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isLessonOpen, setIsLessonOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)

  const toggleSection = () => setIsOpen(!isOpen)
  const toggleLessonModal = () => setIsLessonOpen(!isLessonOpen)

  const toggleDropdown = id => {
    setDropdownOpen(prevState => (prevState === id ? null : id))
  }

  // State for Exercise 1.15 (True or False)
  const [trueFalseAnswers, setTrueFalseAnswers] = useState({
    q1: null,
    q2: null
  })

  const handleTrueFalseChange = (question, answer) => {
    setTrueFalseAnswers({
      ...trueFalseAnswers,
      [question]: answer
    })
  }

  // State for Exercise 1.16 (Matching)
  const [matchingPairs, setMatchingPairs] = useState([
    {
      left: 'Robots are machines designed to perform tasks autonomously',
      rightOptions: [
        'personal assistants like smart speakers.',
        'or with minimal human intervention.'
      ],
      selectedRight: null
    },
    {
      left: 'They come in various forms, from industrial robots that assemble cars to',
      rightOptions: [
        'personal assistants like smart speakers.',
        'or with minimal human intervention.'
      ],
      selectedRight: null
    }
  ])

  const handleMatchChange = (index, value) => {
    setMatchingPairs(prev => {
      const newPairs = [...prev]
      newPairs[index].selectedRight = value
      return newPairs
    })
  }

  // State for Exercise 1.17 (Unscramble)
  const [unscrambleWords, setUnscrambleWords] = useState([
    {
      scrambled: 'boRots',
      answer: ''
    },
    {
      scrambled: 'mhaecins',
      answer: ''
    }
  ])

  const handleUnscrambleChange = (index, value) => {
    setUnscrambleWords(prev => {
      const newWords = [...prev]
      newWords[index].answer = value
      return newWords
    })
  }

  return (
    <div
      id='content'
      className='content'
      style={{ minHeight: 'calc(-97px + 100vh)' }}
    >
      <div className='data_wrapper'>
        {/* Section Card */}
        <Card className='mb-3'>
          <CardBody className='d-flex align-items-center justify-content-between'>
            {/* Section Image */}
            <div className='d-flex align-items-center'>
              <div
                className='user_photo_wrapper course-image me-3'
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
                <span
                  className='user_inits'
                  style={{ color: 'rgb(230, 149, 230)', fontSize: '2rem' }}
                >
                  S
                </span>
              </div>
              {/* Section Title */}
              <div>
                <CardTitle tag='h5'>Section 1</CardTitle>
              </div>
            </div>
            {/* Actions */}
            <div className='d-flex align-items-center'>
              {/* More Options */}
              <div className='me-3'>
                <Dropdown
                  isOpen={dropdownOpen === 'section'}
                  toggle={() => toggleDropdown('section')}
                >
                  <DropdownToggle
                    tag='span'
                    data-toggle='dropdown'
                    aria-expanded={dropdownOpen === 'section'}
                  >
                    <Button
                      color='link'
                      className='text-decoration-none text-secondary'
                    >
                      <i className='bi bi-three-dots-vertical'></i>
                    </Button>
                  </DropdownToggle>
                  <DropdownMenu end>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              {/* Toggle Collapse */}
              <Button
                color='link'
                className='text-decoration-none text-secondary'
                onClick={toggleSection}
              >
                {isOpen ? (
                  <i className='bi bi-chevron-up'></i>
                ) : (
                  <i className='bi bi-chevron-down'></i>
                )}
              </Button>
            </div>
          </CardBody>
          {/* Lessons List */}
          <Collapse isOpen={isOpen}>
            <CardBody className='pt-0'>
              <ListGroup flush>
                {/* Existing Lesson Item */}
                <ListGroupItem className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    {/* Lesson Image */}
                    <div
                      className='user_photo_wrapper lesson-image me-3'
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
                      <span
                        className='user_inits'
                        style={{
                          color: 'rgb(230, 149, 230)',
                          fontSize: '1.5rem'
                        }}
                      >
                        U
                      </span>
                    </div>
                    {/* Lesson Title */}
                    <div>
                      <CardSubtitle tag='h6' className='mb-0'>
                        Unit 1
                      </CardSubtitle>
                    </div>
                  </div>
                  {/* Open Lesson Button */}
                  <Button color='primary' size='sm' onClick={toggleLessonModal}>
                    Open Unit
                  </Button>
                </ListGroupItem>

                {/* New Unit Button */}
                <ListGroupItem
                  className='d-flex align-items-center justify-content-start hover-item'
                  style={{ cursor: 'pointer' }}
                >
                  <div className='d-flex align-items-center'>
                    <Button color='secondary' className='me-3' size='sm'>
                      <i className='bi bi-plus-lg'></i>
                    </Button>
                    <div>New Unit</div>
                  </div>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Collapse>
        </Card>

        {/* Lesson Modal */}
        <Modal isOpen={isLessonOpen} toggle={toggleLessonModal} size='lg'>
          <ModalHeader toggle={toggleLessonModal}>Unit 1</ModalHeader>
          <ModalBody>
            {/* Lesson Content */}
            <div className='lesson-content'>
              {/* Section Header */}
              <div className='lesson-section'>
                <h4 className='lesson_section_header_text d-flex align-items-center'>
                  Section 1
                  <Button color='link' className='p-0 ms-2'>
                    <i className='bi bi-pencil'></i>
                  </Button>
                </h4>

                {/* Exercises List */}
                <div className='exercises-list mt-4'>
                  {/* Previous exercises (1.1 to 1.14) */}
                  {/* ... [Keep existing exercises here] ... */}

                  {/* Exercise Item 1.15 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.15
                          </span>
                        </div>
                        <h5 className='mb-0'>True or False</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown
                        isOpen={dropdownOpen === 'exercise1.15'}
                        toggle={() => toggleDropdown('exercise1.15')}
                      >
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen === 'exercise1.15'}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem
                            onClick={() =>
                              setTrueFalseAnswers({
                                q1: null,
                                q2: null
                              })
                            }
                          >
                            Reset the answers
                          </DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      <div className='mb-3'>
                        <p>
                          1. Robots are machines designed to perform tasks
                          autonomously.
                        </p>
                        <div className='d-flex'>
                          <Button
                            color={
                              trueFalseAnswers.q1 === true
                                ? 'primary'
                                : 'secondary'
                            }
                            className='me-2'
                            onClick={() => handleTrueFalseChange('q1', true)}
                          >
                            True
                          </Button>
                          <Button
                            color={
                              trueFalseAnswers.q1 === false
                                ? 'primary'
                                : 'secondary'
                            }
                            onClick={() => handleTrueFalseChange('q1', false)}
                          >
                            False
                          </Button>
                        </div>
                      </div>
                      <div className='mb-3'>
                        <p>2. Robots like pizza and chairs.</p>
                        <div className='d-flex'>
                          <Button
                            color={
                              trueFalseAnswers.q2 === true
                                ? 'primary'
                                : 'secondary'
                            }
                            className='me-2'
                            onClick={() => handleTrueFalseChange('q2', true)}
                          >
                            True
                          </Button>
                          <Button
                            color={
                              trueFalseAnswers.q2 === false
                                ? 'primary'
                                : 'secondary'
                            }
                            onClick={() => handleTrueFalseChange('q2', false)}
                          >
                            False
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Exercise Item 1.16 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.16
                          </span>
                        </div>
                        <h5 className='mb-0'>Matching</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown
                        isOpen={dropdownOpen === 'exercise1.16'}
                        toggle={() => toggleDropdown('exercise1.16')}
                      >
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen === 'exercise1.16'}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem
                            onClick={() =>
                              setMatchingPairs(prev =>
                                prev.map(pair => ({
                                  ...pair,
                                  selectedRight: null
                                }))
                              )
                            }
                          >
                            Reset the answers
                          </DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      {matchingPairs.map((pair, index) => (
                        <div key={index} className='mb-3'>
                          <div className='d-flex align-items-center'>
                            <div className='me-3' style={{ flex: 1 }}>
                              {pair.left}
                            </div>
                            <div style={{ flex: 1 }}>
                              <select
                                className='form-select'
                                value={pair.selectedRight || ''}
                                onChange={e =>
                                  handleMatchChange(index, e.target.value)
                                }
                              >
                                <option value='' disabled>
                                  Select match
                                </option>
                                {pair.rightOptions.map((option, idx) => (
                                  <option key={idx} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exercise Item 1.17 */}
                  <div className='exercise_wrapper mb-4'>
                    {/* Exercise Header */}
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='icon_wrapper me-3'
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
                          <span
                            style={{
                              color: 'rgb(51, 204, 255)',
                              fontWeight: 'bold'
                            }}
                          >
                            1.17
                          </span>
                        </div>
                        <h5 className='mb-0'>Unscramble</h5>
                      </div>
                      {/* Exercise Actions */}
                      <Dropdown
                        isOpen={dropdownOpen === 'exercise1.17'}
                        toggle={() => toggleDropdown('exercise1.17')}
                      >
                        <DropdownToggle
                          tag='span'
                          data-toggle='dropdown'
                          aria-expanded={dropdownOpen === 'exercise1.17'}
                        >
                          <Button
                            color='link'
                            className='text-decoration-none text-secondary'
                          >
                            <i className='bi bi-three-dots-vertical'></i>
                          </Button>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem
                            onClick={() =>
                              setUnscrambleWords(prev =>
                                prev.map(word => ({ ...word, answer: '' }))
                              )
                            }
                          >
                            Reset the answers
                          </DropdownItem>
                          <DropdownItem>Change position</DropdownItem>
                          <DropdownItem>Edit exercise</DropdownItem>
                          <DropdownItem>Delete exercise</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Copy exercise(s) to...</DropdownItem>
                          <DropdownItem>Move exercise(s) to...</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    {/* Exercise Content */}
                    <div className='exercise-content'>
                      {unscrambleWords.map((word, index) => (
                        <div key={index} className='mb-3'>
                          <p>
                            Unscramble the word:{' '}
                            <strong>{word.scrambled}</strong>
                          </p>
                          <input
                            type='text'
                            className='form-control'
                            value={word.answer}
                            onChange={e =>
                              handleUnscrambleChange(index, e.target.value)
                            }
                            placeholder='Your answer'
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ... Additional exercises can be added here ... */}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={toggleLessonModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

export default Section


part 13:





part 14:
// ... (Previous imports remain the same)
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const Section = () => {
  // ... (Previous state and functions remain the same)

  // State for Exercise 1.20 (Sorting Exercise)
  const [sortingItems, setSortingItems] = useState([
    { id: '1', content: 'Robots' },
    { id: '2', content: 'are machines' },
    { id: '3', content: 'designed to' },
    { id: '4', content: 'perform tasks' },
    { id: '5', content: 'autonomously.' },
    { id: '6', content: 'They come' },
    { id: '7', content: 'in various forms,' },
    { id: '8', content: 'from industrial robots' },
    { id: '9', content: 'that assemble cars' },
    { id: '10', content: 'to personal assistants' },
    { id: '11', content: 'like smart speakers.' }
  ])

  const handleOnDragEnd = result => {
    if (!result.destination) return

    const items = Array.from(sortingItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSortingItems(items)
  }

  return (
    <div
      id='content'
      className='content'
      style={{ minHeight: 'calc(-97px + 100vh)' }}
    >
      <div className='data_wrapper'>
        {/* ... (Section Card and other components remain the same) */}

        {/* Lesson Modal */}
        <Modal isOpen={isLessonOpen} toggle={toggleLessonModal} size='lg'>
          <ModalHeader toggle={toggleLessonModal}>Unit 1</ModalHeader>
          <ModalBody>
            {/* Lesson Content */}
            <div className='lesson-content'>
              {/* ... (Previous sections and exercises remain the same) */}

              {/* Exercise Item 1.20 */}
              <div className='exercise_wrapper mb-4'>
                {/* Exercise Header */}
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <div className='d-flex align-items-center'>
                    <div
                      className='icon_wrapper me-3'
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
                      <span
                        style={{
                          color: 'rgb(51, 204, 255)',
                          fontWeight: 'bold'
                        }}
                      >
                        1.20
                      </span>
                    </div>
                    <h5 className='mb-0'>Sorting Exercise</h5>
                  </div>
                  {/* Exercise Actions */}
                  <Dropdown
                    isOpen={dropdownOpen === 'exercise1.20'}
                    toggle={() => toggleDropdown('exercise1.20')}
                  >
                    <DropdownToggle
                      tag='span'
                      data-toggle='dropdown'
                      aria-expanded={dropdownOpen === 'exercise1.20'}
                    >
                      <Button
                        color='link'
                        className='text-decoration-none text-secondary'
                      >
                        <i className='bi bi-three-dots-vertical'></i>
                      </Button>
                    </DropdownToggle>
                    <DropdownMenu end>
                      <DropdownItem
                        onClick={() =>
                          setSortingItems([
                            { id: '1', content: 'Robots' },
                            { id: '2', content: 'are machines' },
                            { id: '3', content: 'designed to' },
                            { id: '4', content: 'perform tasks' },
                            { id: '5', content: 'autonomously.' },
                            { id: '6', content: 'They come' },
                            { id: '7', content: 'in various forms,' },
                            { id: '8', content: 'from industrial robots' },
                            { id: '9', content: 'that assemble cars' },
                            { id: '10', content: 'to personal assistants' },
                            { id: '11', content: 'like smart speakers.' }
                          ])
                        }
                      >
                        Reset the answers
                      </DropdownItem>
                      <DropdownItem>Change position</DropdownItem>
                      <DropdownItem>Edit exercise</DropdownItem>
                      <DropdownItem>Delete exercise</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem>Copy exercise(s) to...</DropdownItem>
                      <DropdownItem>Move exercise(s) to...</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                {/* Exercise Content */}
                <div className='exercise-content'>
                  <p className='mb-3'>
                    Arrange the phrases to form coherent sentences:
                  </p>
                  <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId='sortingList'>
                      {provided => (
                        <ul
                          className='list-group'
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {sortingItems.map(({ id, content }, index) => (
                            <Draggable key={id} draggableId={id} index={index}>
                              {provided => (
                                <li
                                  className='list-group-item'
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  {content}
                                </li>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </ul>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>

              {/* New Exercise Button */}
              <div
                className='d-flex align-items-center justify-content-start hover-item'
                style={{ cursor: 'pointer' }}
              >
                <Button color='secondary' className='me-3' size='sm'>
                  <i className='bi bi-plus-lg'></i>
                </Button>
                <div>New Exercise</div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={toggleLessonModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

export default Section


part 15:
// ... (Previous imports remain the same)
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Tooltip } from 'reactstrap'

const Section = () => {
  // ... (Previous state and functions remain the same)

  // State for Exercise 1.21 (Link Exercise)
  // No additional state needed unless you want to track clicks

  // State for Exercise 1.22 (Note Exercise)
  const [isNoteVisible, setIsNoteVisible] = useState(false)

  const toggleNoteVisibility = () => {
    setIsNoteVisible(!isNoteVisible)
  }

  // State for Exercise 1.23 (Vocabulary Exercise)
  const [vocabularyWords, setVocabularyWords] = useState([
    { id: '1', word: 'Robots', definition: 'a walking machine', added: false }
    // Add more words if needed
  ])

  const handleAddAllWords = () => {
    setVocabularyWords(prevWords =>
      prevWords.map(word => ({ ...word, added: true }))
    )
  }

  const handleAddWord = id => {
    setVocabularyWords(prevWords =>
      prevWords.map(word => (word.id === id ? { ...word, added: true } : word))
    )
  }

  return (
    <div
      id='content'
      className='content'
      style={{ minHeight: 'calc(-97px + 100vh)' }}
    >
      <div className='data_wrapper'>
        {/* ... (Section Card and other components remain the same) */}

        {/* Lesson Modal */}
        <Modal isOpen={isLessonOpen} toggle={toggleLessonModal} size='lg'>
          <ModalHeader toggle={toggleLessonModal}>Unit 1</ModalHeader>
          <ModalBody>
            {/* Lesson Content */}
            <div className='lesson-content'>
              {/* ... (Previous sections and exercises remain the same) */}

              {/* Exercise Item 1.21 */}
              <div className='exercise_wrapper mb-4'>
                {/* Exercise Header */}
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <div className='d-flex align-items-center'>
                    <div
                      className='icon_wrapper me-3'
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
                      <span
                        style={{
                          color: 'rgb(51, 204, 255)',
                          fontWeight: 'bold'
                        }}
                      >
                        1.21
                      </span>
                    </div>
                    <h5 className='mb-0'>Link Exercise</h5>
                  </div>
                  {/* Exercise Actions */}
                  <Dropdown
                    isOpen={dropdownOpen === 'exercise1.21'}
                    toggle={() => toggleDropdown('exercise1.21')}
                  >
                    <DropdownToggle
                      tag='span'
                      data-toggle='dropdown'
                      aria-expanded={dropdownOpen === 'exercise1.21'}
                    >
                      <Button
                        color='link'
                        className='text-decoration-none text-secondary'
                      >
                        <i className='bi bi-three-dots-vertical'></i>
                      </Button>
                    </DropdownToggle>
                    <DropdownMenu end>
                      <DropdownItem>Change position</DropdownItem>
                      <DropdownItem>Edit exercise</DropdownItem>
                      <DropdownItem>Delete exercise</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem>Copy exercise(s) to...</DropdownItem>
                      <DropdownItem>Move exercise(s) to...</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                {/* Exercise Content */}
                <div className='exercise-content'>
                  <p>Some link to somewhere</p>
                  <a
                    href='https://www.ted.com/talks/iseult_gillespie_the_meaning_of_life_according_to_simone_de_beauvoir/transcript?subtitle=en'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='btn btn-primary'
                  >
                    Follow the link
                  </a>
                </div>
              </div>

              {/* Exercise Item 1.22 */}
              <div className='exercise_wrapper mb-4'>
                {/* Exercise Header */}
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <div className='d-flex align-items-center'>
                    <div
                      className='icon_wrapper me-3'
                      style={{
                        backgroundColor: isNoteVisible
                          ? 'rgb(255, 240, 241)'
                          : 'rgb(235, 251, 255)',
                        borderRadius: '50%',
                        height: '40px',
                        width: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i
                        className='bi bi-sticky'
                        style={{
                          color: isNoteVisible
                            ? 'rgb(252, 101, 126)'
                            : 'rgb(50, 202, 252)'
                        }}
                      ></i>
                    </div>
                    <h5 className='mb-0'>Note Exercise</h5>
                  </div>
                  {/* Exercise Actions */}
                  <Dropdown
                    isOpen={dropdownOpen === 'exercise1.22'}
                    toggle={() => toggleDropdown('exercise1.22')}
                  >
                    <DropdownToggle
                      tag='span'
                      data-toggle='dropdown'
                      aria-expanded={dropdownOpen === 'exercise1.22'}
                    >
                      <Button
                        color='link'
                        className='text-decoration-none text-secondary'
                      >
                        <i className='bi bi-three-dots-vertical'></i>
                      </Button>
                    </DropdownToggle>
                    <DropdownMenu end>
                      <DropdownItem>Change position</DropdownItem>
                      <DropdownItem>Edit exercise</DropdownItem>
                      <DropdownItem>Delete exercise</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem>Copy exercise(s) to...</DropdownItem>
                      <DropdownItem>Move exercise(s) to...</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                {/* Exercise Content */}
                <div
                  className='alert'
                  style={{
                    backgroundColor: isNoteVisible
                      ? 'rgb(255, 240, 241)'
                      : 'rgb(235, 251, 255)',
                    color: isNoteVisible
                      ? 'rgb(252, 101, 126)'
                      : 'rgb(50, 202, 252)'
                  }}
                >
                  <div className='d-flex justify-content-between align-items-start'>
                    <div>
                      <h5>
                        {isNoteVisible
                          ? 'A hidden note about something'
                          : 'A note about something'}
                      </h5>
                      <p>
                        {isNoteVisible
                          ? 'This is the hidden note.'
                          : 'This is the note'}
                      </p>
                    </div>
                    <div className='ms-2'>
                      <Button
                        color='link'
                        id='NoteVisibilityToggle'
                        onClick={toggleNoteVisibility}
                      >
                        {isNoteVisible ? (
                          <i
                            className='bi bi-eye-fill'
                            style={{ color: 'rgb(252, 101, 126)' }}
                          ></i>
                        ) : (
                          <i
                            className='bi bi-eye-slash-fill'
                            style={{ color: 'rgb(50, 202, 252)' }}
                          ></i>
                        )}
                      </Button>
                      <Tooltip
                        placement='top'
                        isOpen={dropdownOpen === 'noteTooltip'}
                        target='NoteVisibilityToggle'
                        toggle={() => toggleDropdown('noteTooltip')}
                      >
                        {isNoteVisible
                          ? 'Students can see this note'
                          : "Students can't see this note"}
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exercise Item 1.23 */}
              <div className='exercise_wrapper mb-4'>
                {/* Exercise Header */}
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <div className='d-flex align-items-center'>
                    <div
                      className='icon_wrapper me-3'
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
                      <span
                        style={{
                          color: 'rgb(51, 204, 255)',
                          fontWeight: 'bold'
                        }}
                      >
                        1.23
                      </span>
                    </div>
                    <h5 className='mb-0'>Vocabulary Exercise</h5>
                  </div>
                  {/* Exercise Actions */}
                  <Dropdown
                    isOpen={dropdownOpen === 'exercise1.23'}
                    toggle={() => toggleDropdown('exercise1.23')}
                  >
                    <DropdownToggle
                      tag='span'
                      data-toggle='dropdown'
                      aria-expanded={dropdownOpen === 'exercise1.23'}
                    >
                      <Button
                        color='link'
                        className='text-decoration-none text-secondary'
                      >
                        <i className='bi bi-three-dots-vertical'></i>
                      </Button>
                    </DropdownToggle>
                    <DropdownMenu end>
                      <DropdownItem>Change position</DropdownItem>
                      <DropdownItem>Edit exercise</DropdownItem>
                      <DropdownItem>Delete exercise</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem>Copy exercise(s) to...</DropdownItem>
                      <DropdownItem>Move exercise(s) to...</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                {/* Exercise Content */}
                <div className='exercise-content'>
                  <Button
                    color='primary'
                    onClick={handleAddAllWords}
                    className='mb-3'
                  >
                    Add all words
                  </Button>
                  {vocabularyWords.map(word => (
                    <div
                      key={word.id}
                      className='d-flex align-items-center mb-2'
                    >
                      <Button
                        color={word.added ? 'success' : 'secondary'}
                        onClick={() => handleAddWord(word.id)}
                        disabled={word.added}
                        className='me-2'
                      >
                        {word.added ? (
                          <i className='bi bi-check-lg'></i>
                        ) : (
                          <i className='bi bi-plus-lg'></i>
                        )}
                      </Button>
                      <div className='me-auto'>
                        <strong>{word.word}</strong> - {word.definition}
                      </div>
                      {/* Speaker Icon */}
                      <Button color='link' className='text-secondary'>
                        <i className='bi bi-volume-up-fill'></i>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* New Exercise Button */}
              <div
                className='d-flex align-items-center justify-content-start hover-item'
                style={{ cursor: 'pointer' }}
              >
                <Button color='secondary' className='me-3' size='sm'>
                  <i className='bi bi-plus-lg'></i>
                </Button>
                <div>New Exercise</div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={toggleLessonModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

export default Section


part 16:

// ... (Previous imports remain the same)
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Tooltip } from 'reactstrap'
// For audio recording, you might need to install additional packages or use the Web Audio API

const Section = () => {
  // ... (Previous state and functions remain the same)

  // Update for Exercise 1.23 (Vocabulary Exercise)
  const [vocabularyWords, setVocabularyWords] = useState([
    { id: '1', word: 'Robots', definition: 'a walking machine', added: false },
    { id: '2', word: 'Human', definition: 'a walking meatsuit', added: false }
  ])

  // State for Exercise 1.24 (Audio Recording Exercise)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioURL, setAudioURL] = useState('')
  const [recordingTime, setRecordingTime] = useState(30)

  // Functions for audio recording
  let mediaRecorder
  let audioChunks = []

  const startRecording = async () => {
    if (!navigator.mediaDevices) {
      alert('Your browser does not support audio recording.')
      return
    }

    setIsRecording(true)
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    mediaRecorder.start()

    mediaRecorder.ondataavailable = event => {
      audioChunks.push(event.data)
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/mpeg-3' })
      const url = URL.createObjectURL(blob)
      setAudioBlob(blob)
      setAudioURL(url)
      audioChunks = []
    }

    // Set a timeout to stop recording after 30 seconds
    setTimeout(() => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
        setIsRecording(false)
      }
    }, recordingTime * 1000)
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  // State for Exercise 2.1 (Test Exercise)
  // No additional state needed unless you want to implement test functionality

  return (
    <div
      id='content'
      className='content'
      style={{ minHeight: 'calc(-97px + 100vh)' }}
    >
      <div className='data_wrapper'>
        {/* ... (Section Card and other components remain the same) */}

        {/* Lesson Modal */}
        <Modal isOpen={isLessonOpen} toggle={toggleLessonModal} size='lg'>
          <ModalHeader toggle={toggleLessonModal}>Unit 1</ModalHeader>
          <ModalBody>
            {/* Lesson Content */}
            <div className='lesson-content'>
              {/* ... (Previous sections and exercises remain the same) */}

              {/* Exercise Item 1.23 (Updated Vocabulary Exercise) */}
              <div className='exercise_wrapper mb-4'>
                {/* Exercise Header */}
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <div className='d-flex align-items-center'>
                    <div
                      className='icon_wrapper me-3'
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
                      <span
                        style={{
                          color: 'rgb(51, 204, 255)',
                          fontWeight: 'bold'
                        }}
                      >
                        1.23
                      </span>
                    </div>
                    <h5 className='mb-0'>Vocabulary Exercise</h5>
                  </div>
                  {/* Exercise Actions */}
                  <Dropdown
                    isOpen={dropdownOpen === 'exercise1.23'}
                    toggle={() => toggleDropdown('exercise1.23')}
                  >
                    <DropdownToggle
                      tag='span'
                      data-toggle='dropdown'
                      aria-expanded={dropdownOpen === 'exercise1.23'}
                    >
                      <Button
                        color='link'
                        className='text-decoration-none text-secondary'
                      >
                        <i className='bi bi-three-dots-vertical'></i>
                      </Button>
                    </DropdownToggle>
                    <DropdownMenu end>
                      <DropdownItem>Change position</DropdownItem>
                      <DropdownItem>Edit exercise</DropdownItem>
                      <DropdownItem>Delete exercise</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem>Copy exercise(s) to...</DropdownItem>
                      <DropdownItem>Move exercise(s) to...</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                {/* Exercise Content */}
                <div className='exercise-content'>
                  <Button
                    color='primary'
                    onClick={handleAddAllWords}
                    className='mb-3'
                  >
                    Add all words
                  </Button>
                  {vocabularyWords.map(word => (
                    <div
                      key={word.id}
                      className='d-flex align-items-center mb-2'
                    >
                      <Button
                        color={word.added ? 'success' : 'secondary'}
                        onClick={() => handleAddWord(word.id)}
                        disabled={word.added}
                        className='me-2'
                      >
                        {word.added ? (
                          <i className='bi bi-check-lg'></i>
                        ) : (
                          <i className='bi bi-plus-lg'></i>
                        )}
                      </Button>
                      <div className='me-auto'>
                        <strong>{word.word}</strong> - {word.definition}
                      </div>
                      {/* Speaker Icon */}
                      <Button color='link' className='text-secondary'>
                        <i className='bi bi-volume-up-fill'></i>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exercise Item 1.24 (Audio Recording Exercise) */}
              <div className='exercise_wrapper mb-4'>
                {/* Exercise Header */}
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <div className='d-flex align-items-center'>
                    <div
                      className='icon_wrapper me-3'
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
                      <span
                        style={{
                          color: 'rgb(51, 204, 255)',
                          fontWeight: 'bold'
                        }}
                      >
                        1.24
                      </span>
                    </div>
                    <h5 className='mb-0'>Audio Recording Exercise</h5>
                  </div>
                  {/* Exercise Actions */}
                  <Dropdown
                    isOpen={dropdownOpen === 'exercise1.24'}
                    toggle={() => toggleDropdown('exercise1.24')}
                  >
                    <DropdownToggle
                      tag='span'
                      data-toggle='dropdown'
                      aria-expanded={dropdownOpen === 'exercise1.24'}
                    >
                      <Button
                        color='link'
                        className='text-decoration-none text-secondary'
                      >
                        <i className='bi bi-three-dots-vertical'></i>
                      </Button>
                    </DropdownToggle>
                    <DropdownMenu end>
                      <DropdownItem>Reset the answers</DropdownItem>
                      <DropdownItem>Change position</DropdownItem>
                      <DropdownItem>Edit exercise</DropdownItem>
                      <DropdownItem>Delete exercise</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem>Copy exercise(s) to...</DropdownItem>
                      <DropdownItem>Move exercise(s) to...</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                {/* Exercise Content */}
                <div className='exercise-content'>
                  <p>This is where you say "robots"</p>
                  {!isRecording && !audioURL && (
                    <Button color='primary' onClick={startRecording}>
                      <i className='bi bi-mic-fill me-2'></i>Start recording
                      (00:30)
                    </Button>
                  )}
                  {isRecording && (
                    <Button color='danger' onClick={stopRecording}>
                      <i className='bi bi-stop-fill me-2'></i>Stop recording
                    </Button>
                  )}
                  {audioURL && (
                    <div className='mt-3'>
                      <audio controls src={audioURL}></audio>
                      <div className='mt-2'>
                        <Button
                          color='primary'
                          className='me-2'
                          onClick={() => alert('Audio saved!')}
                        >
                          Save
                        </Button>
                        <Button
                          color='secondary'
                          onClick={() => setAudioURL('')}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Exercise Item 1.25 (Dividing Line) */}
              <div className='exercise_wrapper mb-4'>
                <hr />
              </div>

              {/* Exercise Item 2.1 (Test Exercise) */}
              <div className='exercise_wrapper mb-4'>
                {/* Exercise Header */}
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <div className='d-flex align-items-center'>
                    <div
                      className='icon_wrapper me-3'
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
                      <span
                        style={{
                          color: 'rgb(51, 204, 255)',
                          fontWeight: 'bold'
                        }}
                      >
                        2.1
                      </span>
                    </div>
                    <h5 className='mb-0'>Test Exercise</h5>
                  </div>
                  {/* Exercise Actions */}
                  <Dropdown
                    isOpen={dropdownOpen === 'exercise2.1'}
                    toggle={() => toggleDropdown('exercise2.1')}
                  >
                    <DropdownToggle
                      tag='span'
                      data-toggle='dropdown'
                      aria-expanded={dropdownOpen === 'exercise2.1'}
                    >
                      <Button
                        color='link'
                        className='text-decoration-none text-secondary'
                      >
                        <i className='bi bi-three-dots-vertical'></i>
                      </Button>
                    </DropdownToggle>
                    <DropdownMenu end>
                      <DropdownItem>Reset the answers</DropdownItem>
                      <DropdownItem>Change position</DropdownItem>
                      <DropdownItem>Edit exercise</DropdownItem>
                      <DropdownItem>Delete exercise</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem>Copy exercise(s) to...</DropdownItem>
                      <DropdownItem>Move exercise(s) to...</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                {/* Exercise Content */}
                <div className='exercise-content'>
                  <p>Please take the test.</p>
                  {/* You can add test questions here or link to a test component */}
                  <Button color='primary'>Start Test</Button>
                </div>
              </div>

              {/* New Exercise Button */}
              <div
                className='d-flex align-items-center justify-content-start hover-item'
                style={{ cursor: 'pointer' }}
              >
                <Button color='secondary' className='me-3' size='sm'>
                  <i className='bi bi-plus-lg'></i>
                </Button>
                <div>New Exercise</div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={toggleLessonModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

export default Section


part 17:
// ... (Previous imports remain the same)
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Tooltip } from 'reactstrap'
// For audio recording, you might need to install additional packages or use the Web Audio API

const Section = () => {
  // ... (Previous state and functions remain the same)

  // State for Exercise 2.1 (Time-Limited Test)
  const [isTestStarted, setIsTestStarted] = useState(false)

  const handleStartTest = () => {
    setIsTestStarted(true)
    // Additional logic to start the test timer can be added here
  }

  const handlePreviewTest = () => {
    // Logic to preview the test
    alert('Test preview is not available yet.')
  }

  return (
    <div
      id='content'
      className='content'
      style={{
        minHeight: 'calc(-97px + 100vh)',
        color: '#535353',
        fontFamily: '"Hebrew", Ubuntu',
        boxSizing: 'inherit',
        margin: '50px 0 0',
        padding: '15px 0 16px',
        display: 'flex'
      }}
    >
      <div className='data_wrapper' style={{ width: '100%' }}>
        {/* ... (Section Card and other components remain the same) */}

        {/* Lesson Modal */}
        <Modal isOpen={isLessonOpen} toggle={toggleLessonModal} size='lg'>
          <ModalHeader toggle={toggleLessonModal}>Unit 1</ModalHeader>
          <ModalBody>
            {/* Lesson Content */}
            <div className='lesson-content'>
              {/* ... (Previous sections and exercises remain the same) */}

              {/* Exercise Item 2.1 (Time-Limited Test) */}
              <div className='exercise_wrapper mb-4'>
                {/* Exercise Header */}
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <div className='d-flex align-items-center'>
                    <div
                      className='icon_wrapper me-3'
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
                      <span
                        style={{
                          color: 'rgb(51, 204, 255)',
                          fontWeight: 'bold'
                        }}
                      >
                        2.1
                      </span>
                    </div>
                    <h5 className='mb-0'>Time-limited test</h5>
                  </div>
                  {/* Exercise Actions */}
                  <Dropdown
                    isOpen={dropdownOpen === 'exercise2.1'}
                    toggle={() => toggleDropdown('exercise2.1')}
                  >
                    <DropdownToggle
                      tag='span'
                      data-toggle='dropdown'
                      aria-expanded={dropdownOpen === 'exercise2.1'}
                    >
                      <Button
                        color='link'
                        className='text-decoration-none text-secondary'
                      >
                        <i className='bi bi-three-dots-vertical'></i>
                      </Button>
                    </DropdownToggle>
                    <DropdownMenu end>
                      <DropdownItem>Reset the answers</DropdownItem>
                      <DropdownItem>Change position</DropdownItem>
                      <DropdownItem>Edit exercise</DropdownItem>
                      <DropdownItem>Delete exercise</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem>Copy exercise(s) to...</DropdownItem>
                      <DropdownItem>Move exercise(s) to...</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                {/* Exercise Content */}
                <div
                  className='exercise-content'
                  style={{ ...styles.exerciseContent }}
                >
                  <div className='text-center mb-3'>
                    <img
                      src='path/to/Emoji-Stopwatch.png'
                      alt='Emoji-Stopwatch'
                      style={{ width: '60px', height: '60px' }}
                    />
                    <h4 className='mt-2'>Time-limited test</h4>
                  </div>
                  <div className='d-flex justify-content-around mb-3'>
                    <div className='text-center'>
                      <p className='mb-1'>Questions</p>
                      <h5>1</h5>
                    </div>
                    <div className='text-center'>
                      <p className='mb-1'>Time to complete</p>
                      <h5>03:00</h5>
                    </div>
                  </div>
                  <div className='d-flex justify-content-center'>
                    <Button
                      color='link'
                      onClick={handlePreviewTest}
                      className='me-3'
                    >
                      Preview
                    </Button>
                    <Button color='primary' onClick={handleStartTest}>
                      Start the test
                    </Button>
                  </div>
                </div>
              </div>

              {/* New Exercise Button */}
              <div
                className='d-flex align-items-center justify-content-start hover-item'
                style={{ cursor: 'pointer' }}
              >
                <Button color='secondary' className='me-3' size='sm'>
                  <i className='bi bi-plus-lg'></i>
                </Button>
                <div>Add a new exercise</div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={toggleLessonModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

// Styles object
const styles = {
  exerciseContent: {
    '--vh': '8.9px',
    color: '#535353',
    fontFamily: '"Hebrew", Ubuntu',
    boxSizing: 'inherit',
    margin: '50px 0 0',
    padding: '15px 0 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 'calc(-97px + 100vh)'
  }
}

export default Section


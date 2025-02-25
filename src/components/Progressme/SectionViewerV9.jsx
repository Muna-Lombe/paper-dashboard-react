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
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Helper function to reorder items in drag-and-drop
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// NoteExercise subcomponent
const NoteExercise = ({ content }) => (
  <ListGroupItem className='d-flex flex-row justify-content-between m-1 px-1 bg-primary rounded border-primary '>
    <div className="left">
      <h5 className="left mb-2 bg-secondary border rounded text-white" style={{ width: "20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        i
      </h5>
    </div>
    <div className="middle d-flex flex-column text-white">
      <p>{content.title}</p>
      <p>{content.text}</p>
    </div>
    <div className="right text-white">
      <span>Visible</span>
    </div>
  </ListGroupItem>
);

// GapFillExercise subcomponent
const GapFillExercise = ({ content }) => (
  <ListGroupItem>
    <h5 className="mb-2">{content.title}</h5>
    {content.questions.map((question, index) => (
      <div key={index}>
        <p>{question.text}</p>
        <Input type="text" name={`gap-fill-${index}`} className="mx-2" placeholder="Fill in the blank" />
      </div>
    ))}
  </ListGroupItem>
);

// TextOrderExercise subcomponent
const TextOrderExercise = ({ content }) => (
  <ListGroupItem>
    <h5 className="mb-2">{content.title}</h5>
    {content.sentences.map((sentence, index) => (
      <p key={index}>{sentence.text}</p>
    ))}
  </ListGroupItem>
);

// GifExercise subcomponent
const GifExercise = ({ content }) => (
  <ListGroupItem>
    <h5 className="mb-2">{content.title}</h5>
    <img src={content.gifUrl} alt={content.alt} className="img-fluid" />
  </ListGroupItem>
);

// VideoExercise subcomponent
const VideoExercise = ({ content }) => (
  <ListGroupItem>
    <h5 className="mb-2">{content.title}</h5>
    <div className="video-wrapper">
      <iframe
        width="100%"
        height="315"
        src={content.videoUrl}
        title={content.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  </ListGroupItem>
);

// AudioExercise subcomponent
const AudioExercise = ({ content }) => (
  <ListGroupItem>
    <h5 className="mb-2">{content.title}</h5>
    <audio controls className="w-100">
      <source src={content.audioUrl} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  </ListGroupItem>
);

// Picture Component
const PictureExercise = ({content}) => (
  <ListGroupItem>
    <h5 className="mb-2">{content.title}</h5>
  </ListGroupItem>
)

// PictureLabel subcomponent
const PictureLabel = ({ content }) => (
  <ListGroupItem>
    <h5 className="mb-2">{content.title}</h5>
    <img src={content.image} alt={content.alt} className="img-fluid" />
    <Input type="text" defaultValue={content.label} disabled />
  </ListGroupItem>
);

// SortingExercise subcomponent
const SortingExercise = ({ content }) => (
  <ListGroupItem>
    <h5 className="mb-2">{content.title}</h5>
    <DragComponent id="sortingItems" items={content.items} direction="horizontal" />
  </ListGroupItem>
);

// TrueFalse subcomponent
const TrueFalse = ({ content }) => (
  <ListGroupItem>
    <h5 className="mb-2">{content.title}</h5>
    {content.questions.map((question, index) => (
      <div key={index}>
        <p>{question.text}</p>
        <Input type="radio" name={`truefalse-${index}`} value="true" /> True
        <Input type="radio" name={`truefalse-${index}`} value="false" className="ms-2" /> False
      </div>
    ))}
  </ListGroupItem>
);

// MatchingExercise subcomponent
const MatchingExercise = ({ content }) => (
  <ListGroupItem>
    <h5 className="mb-2">{content.title}</h5>
    <Row className="d-flex flex-row justify-content-between gap-2">
      <Col className="left-match w-50">
        <DragComponent id="left-match-items" items={content.leftItems} />
      </Col>
      <Col className="right-match w-50">
        <DragComponent id="right-match-items" items={content.rightItems} />
      </Col>
    </Row>
  </ListGroupItem>
);

// UnscrambleExercise subcomponent
const UnscrambleExercise = ({ content }) => (
  <ListGroupItem>
    <h5 className="mb-2">{content.title}</h5>
    <DragComponent id="unscrambleItems" items={content.items} direction="horizontal" />
  </ListGroupItem>
);

// SortExercise subcomponent
const SortExercise = ({ content }) => (
  <ListGroupItem>
    <h5 className="mb-2">{content.title}</h5>
    <DragComponent id="sortItems" items={content.items} />
  </ListGroupItem>
);

// ExternalLink subcomponent
const ExternalLink = ({ link }) => (
  <ListGroupItem>
    <h5 className="mb-2">External Link</h5>
    <a href={link} target="_blank" rel="noopener noreferrer" className="btn btn-link">
      Follow the link
    </a>
  </ListGroupItem>
);

// NewWords subcomponent
const NewWords = ({ items }) => (
  <ListGroupItem>
    <h5 className="mb-2">New Words</h5>
    <Button color="primary" className="mb-2">Add all words</Button>
    <div>
      {items.map((word, index) => (
        <p key={index} className="mb-2 p-2 bg-light rounded border">
          {word.word}: {word.definition}
        </p>
      ))}
    </div>
  </ListGroupItem>
);

// RecordExercise subcomponent
const RecordExercise = ({ content }) => (
  <ListGroupItem>
    <h5 className="mb-2">{content.title}</h5>
    <Button color="secondary">Start recording</Button>
    <audio controls className="w-100">
      <source src={content.audioUrl} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  </ListGroupItem>
);

// DragComponent helper for drag-and-drop functionality
const DragComponent = ({ id, items, direction }) => {
  const [dragItems, setDragItems] = useState(items);
  const handleOnDragEnd = result => {
    if (!result.destination) return;
    const reorderedItems = reorder(dragItems, result.source.index, result.destination.index);
    setDragItems(reorderedItems);
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId={id} direction={direction}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className={direction === 'horizontal' ? 'd-flex' : ''}>
            {dragItems.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="p-2 bg-light rounded mb-2">
                    {item.content}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

// ExerciseSwitcher for dynamically switching exercise types
const ExerciseSwitcher = ({ exercise, index }) => {
  switch (exercise.type) {
    case 'note':
      return <NoteExercise key={index} content={exercise.note_exercise_data.note} />;
    case 'gap_fill':
      return <GapFillExercise key={index} content={{
        title: exercise.name,
        questions: exercise.gap_fill_exercise_data.question_with_coding_texts || [],
      }} />;
    case 'text_order':
      return <TextOrderExercise key={index} content={{
        title: exercise.name,
        sentences: exercise.text_order_exercise_data.sentences_in_correct_order || [],
      }} />;
    case 'gif':
      return <GifExercise key={index} content={exercise} />;
    case 'video':
      return <VideoExercise key={index} content={exercise} />;
    case 'audio':
      return <AudioExercise key={index} content={exercise} />;
    case 'picture':
      return <PictureExercise key={index} content={exercise} />;
    case 'picture_label':
      return <PictureLabel key={index} content={exercise} />;
    case 'true_or_false':
      return <TrueFalse key={index} content={exercise} />;
    case 'match_words':
      return <MatchingExercise key={index} content={exercise} />;
    case 'word_unscramble':
      return <UnscrambleExercise key={index} content={exercise} />;
    case 'sort_into_columns':
      return <SortExercise key={index} content={exercise} />;
    case 'external_link':
      return <ExternalLink key={index} link={exercise.link} />;
    case 'wordlist':
      return <NewWords key={index} items={exercise.wordlist_exercise_data.items || []} />;
    case 'voice_recording':
      return <RecordExercise key={index} content={exercise} />;
    default:
      return null;
  }
};

// Main SectionViewerV9 component
const SectionViewerV9 = ({ section }) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSection = () => setIsOpen(!isOpen);

  return (
    <div className="container my-4">
      <Card className="mb-4 shadow-sm">
        <CardBody className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="rounded-circle d-flex justify-content-center align-items-center bg-light" style={{ height: '80px', width: '80px' }}>
              <span className="display-6 text-muted">S</span>
            </div>
            <div className="ms-3">
              <CardTitle tag="h4" className="mb-0">{section.name}</CardTitle>
            </div>
          </div>
          <Button size='md' color="link" className="text-decoration-none text-secondary" onClick={toggleSection}>
            {isOpen ? '>' : '<'}
          </Button>
        </CardBody>

        <Collapse isOpen={isOpen}>
          <CardBody>
            <ListGroup flush>
              {
                section.content && 
                section.content[0] && 
                section.content[0].data.map((exercise, index) => (
                  <ExerciseSwitcher key={index} exercise={exercise} index={index} />
                ))
              }
            </ListGroup>
          </CardBody>
        </Collapse>
      </Card>
    </div>
  );
};

export default SectionViewerV9;

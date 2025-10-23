import React, { useState } from 'react';
// import {
//   Row,
//   Col,
//   Card,
//   CardBody,
//   CardTitle,
//   Collapse,
//   Button,
//   ListGroup,
//   ListGroupItem,
//   Input,
//   Dropdown,
//   DropdownToggle,
//   DropdownMenu,
//   DropdownItem,
// } from 'reactstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Helper function to reorder items in drag-and-drop
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Instructions subcomponent
const Instructions = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <p>{content.text}</p>
  </div>
);

// Carousel subcomponent
const Carousel = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <img src={content.image} alt={content.alt} className="img-fluid mb-2 w-full h-auto" />
    <p className="text-center">{content.caption}</p>
  </div>
);

// GifExercise subcomponent
const GifExercise = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <img src={content.gifUrl} alt={content.alt} className="img-fluid w-full h-auto" />
  </div>
);

// VideoExercise subcomponent
const VideoExercise = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <div classNameName="relative pb-[56.25%] h-0 overflow-hidden max-w-full bg-black">
      <iframe
        width="100%"
        height="315"
        src={content.videoUrl}
        title={content.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full"
      ></iframe>
    </div>
  </div>
);

// GapFillExercise subcomponent
const GapFillExercise = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    {content.sentences.map((sentence, index) => {
      const parts = sentence.split('__');
      return (
        <p key={index} className="flex items-baseline mb-2">
          {parts[0]} <input type="text" name={`blank-${index}`} className="mx-2 p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" /> {parts[1]}
        </p>
      );
    })}
  </div>
);
//NoteExercise subcomponent
const NoteExercise = ({ content }) => (
  <div className="flex flex-row justify-between items-center m-1 p-1 bg-blue-500 rounded border border-blue-500 text-white">
    <div className="left">
      <h5 className="mb-2 bg-gray-600 border rounded text-white flex justify-center items-center w-5 h-5">
        <i className="fas fa-info-circle"></i>
      </h5>
    </div>
    <div className="middle flex flex-col text-white">
      <p> {content.title}</p>
      <p> {content.text}</p>
    </div>
    <div className="right text-white">
      <span>
        {"visible"}
      </span>
    </div>

  </div>
)
// TestExercise subcomponent
const TestExercise = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <p className="mb-2">{content.question}</p>
    {content.answers.map((answer, index) => (
      <div key={index} className="mb-1">
        <input type="radio" name={`test-${index}`} value={answer} className="mr-2" /> {answer}
      </div>
    ))}
  </div>
);

// ArticleExercise subcomponent
const ArticleExercise = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <img src={content.image} alt={content.alt} className="img-fluid mb-2 w-full h-auto" />
    <p>{content.text}</p>
  </div>
);

// TextExercise subcomponent
const TextExercise = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <p>{content.text}</p>
  </div>
);

const ReadingExercise = ({ content}) =>{
  if(content.image){
    return <ArticleExercise content={content}/>
  }
  return <TextExercise content={content}/>
}

// WritingExercise subcomponent
const WritingExercise = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <textarea placeholder={content.placeholder} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
  </div>
);

// AudioExercise subcomponent
const AudioExercise = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <audio controls className="w-full">
      <source src={content.audioUrl} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  </div>
);

// GapFillNoBox subcomponent
const GapFillNoBox = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <p>{content.sentence}</p>
  </div>
);

// PictureLabel subcomponent
const PictureLabel = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <img src={content.image} alt={content.alt} className="img-fluid w-full h-auto" />
    <input type="text" defaultValue={content.label} disabled className="w-full p-2 border border-gray-300 rounded mt-2 bg-gray-100" />
  </div>
);

// SortingExercise subcomponent
const SortingExercise = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <DragComponent id="sortingItems" items={content.items} direction="horizontal" />
  </div>
);

// OptionChoose subcomponent
const OptionChoose = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <p className="flex items-baseline mb-2">
      {content.sentenceBefore} <SelectOption dropDownItems={content.options} /> {content.sentenceAfter}
    </p>
  </div>
);

// TrueFalse subcomponent
const TrueFalse = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    {content.questions.map((question, index) => (
      <div key={index} className="mb-2">
        <p className="mb-1">{question.text}</p>
        <input type="radio" name={`truefalse-${index}`} value="true" className="mr-2" /> True
        <input type="radio" name={`truefalse-${index}`} value="false" className="ml-2 mr-2" /> False
      </div>
    ))}
  </div>
);

// MatchingExercise subcomponent
const MatchingExercise = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <div className="flex justify-between gap-2">
      <div className="w-1/2">
        <DragComponent id="left-match-items" items={content.leftItems} />
      </div>
      <div className="w-1/2">
        <DragComponent id="right-match-items" items={content.rightItems} />
      </div>
    </div>
  </div>
);

// UnscrambleExercise subcomponent
const UnscrambleExercise = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <DragComponent id="unscrambleItems" items={content.items} direction="horizontal" />
  </div>
);

// SortExercise subcomponent
const SortExercise = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <DragComponent id="sortItems" items={content.items} />
  </div>
);

// ExternalLink subcomponent
const ExternalLink = ({ link }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">External Link</h5>
    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
      Follow the link
    </a>
  </div>
);

// NewWords subcomponent
const NewWords = ({ items }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">New Words</h5>
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2">Add all words</button>
    <div>
      {items.map((word, index) => (
        <p key={index} className="mb-2 p-2 bg-gray-100 rounded border border-gray-200">
          {word.word}: {word.definition}
        </p>
      ))}
    </div>
  </div>
);

// RecordExercise subcomponent
const RecordExercise = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-2">Start recording</button>
    <audio controls className="w-full">
      <source src={content.audioUrl} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  </div>
);

// TimedTest subcomponent
const TimedTest = ({ content }) => (
  <div className="p-4 border-b border-gray-200">
    <h5 className="text-lg font-semibold mb-2">{content.title}</h5>
    <p>{content.description}</p>
  </div>
);

// SelectOption component for dropdown options
const SelectOption = ({ dropDownItems = [] }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(dropDownItems[0] || '');
  const toggle = () => setDropdownOpen(!dropdownOpen);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
        id="options-menu"
        aria-haspopup="true"
        aria-expanded="true"
        onClick={toggle}
      >
        {selectedOption || 'Select'}
        <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {dropDownItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedOption(item);
                  setDropdownOpen(false);
                }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                role="menuitem"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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
          <div {...provided.droppableProps} ref={provided.innerRef} className={direction === 'horizontal' ? 'flex' : ''}>
            {dragItems.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="p-2 bg-gray-100 rounded mb-2 border border-gray-200 mr-2 cursor-grab">
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

const ExerciseSwitcher = ({exercise, index})=>{
  switch (exercise.type) {
    case 'gap_fill_from_box':
      return <GapFillExercise key={index} content={exercise} />;
    case 'picture':
      return <PictureLabel key={index} content={exercise} />;
    case 'exercise_test':
      return <TestExercise key={index} content={exercise} />;
    case 'reading':
      return <ReadingExercise key={index} content={exercise} />;
    case 'audio':
      return <AudioExercise key={index} content={exercise} />;
    case 'gap_fill':
      return <GapFillExercise key={index} content={exercise} />;
    case 'picture_labeling_by_drag':
      return <PictureLabel key={index} content={exercise} />;
    case 'picture_labeling_by_fill':
      return <PictureLabel key={index} content={exercise} />;
    case 'picture_labeling_by_option_choose':
      return <OptionChoose key={index} content={exercise} />;
    case 'word_order':
      return <SortingExercise key={index} content={exercise} />;
    case 'choose_option':
      return <OptionChoose key={index} content={exercise} />;
    case 'true_or_false':
      return <TrueFalse key={index} content={exercise} />;
    case 'match_words':
      return <MatchingExercise key={index} content={exercise} />;
    case 'word_unscramble':
      return <UnscrambleExercise key={index} content={exercise} />;
    case 'sort_into_columns':
      return <SortExercise key={index} content={exercise} />;
    case 'text_order':
      return <SortExercise key={index} content={exercise} />;
    case 'external_link':
      return <ExternalLink key={index} link={exercise.link} />;
    case 'note':
      return <NoteExercise key={index} content={exercise} />;
    case 'wordlist':
      return <NewWords key={index} items={exercise.items} />;
    case 'voice_recording':
      return <RecordExercise key={index} content={exercise} />;
    case 'dividing_line':
      return <hr key={index} className="my-4 border-gray-300" />;
    case 'pdf':
      return <ExternalLink key={index} link={exercise.link} />;
    default:
      return null;
  }
}
// Main SectionViewerV8 component
const SectionViewerV8 = ({ section }) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSection = () => setIsOpen(!isOpen);

  return (
    <div className="container mx-auto my-4">
      <div className="mb-4 shadow-sm rounded-lg bg-white">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center">
            <div className="rounded-full flex justify-center items-center bg-gray-100 h-20 w-20">
              <span className="text-4xl text-gray-500 font-bold">S</span>
            </div>
            <div className="ml-3">
              <h4 className="text-xl font-semibold mb-0">{section.title}</h4>
            </div>
          </div>
          <button className="text-gray-500 text-2xl" onClick={toggleSection}>
            {isOpen ? <i className="fas fa-chevron-up"></i> : <i className="fas fa-chevron-down"></i>}
          </button>
        </div>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-4">
            <div className="border-t border-gray-200 pt-4">
              {
                ( typeof section.content[0] === "string") ?
                <>
                  <NoteExercise content={{title:"Note", text:section.content[0]}}/>
                  {
                    section.branches.length ?
                      section.branches[0].content[0].data.map((exercise, index) => (
                        <ExerciseSwitcher exercise={exercise} index={index} key={index} />
                      ))
                    : null
                  }
                
                </>
                :
                  section.content[0].data.map((exercise, index) => (
                    <ExerciseSwitcher exercise={exercise} index={index} key={index} />
                  ))
                
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionViewerV8;


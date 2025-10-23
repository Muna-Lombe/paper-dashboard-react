import React, { useState } from 'react';
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
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.1 Some Instructions</h5>
    <p>Hello <input type="text" name="blank1" placeholder="(someone)" className="inline-block border border-gray-300 rounded px-2 py-1" /></p>
  </li>
);

const Carousel = () => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.2 This is a carousel of pictures</h5>
    <img src="/path/to/table.jpg" alt="Table" className="w-full h-auto rounded-md mb-2" />
    <p className="text-center mt-2">A table</p>
  </li>
);

const GifExercise = () => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.3 A GIF about something funny</h5>
    <img src="/path/to/cat-gif.gif" alt="A funny GIF" className="w-full h-auto rounded-md" />
  </li>
);

const VideoExercise = () => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.4 A video about trees</h5>
    <div className="aspect-w-16 aspect-h-9">
      <iframe
        width="100%"
        height="315"
        src="https://www.youtube.com/embed/samplevideo"
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
      <p className="text-center mt-2">Trees</p>
    </div>
  </li>
);

const GapFillExercise = ({items}) => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.5 Gap Fill Exercise</h5>
    {
      items.map((i,x)=>{
        const wordBlocks = i.sentence.split(" ")
        const [partBefore, partAfter] = [wordBlocks.slice(0, i.sliceIndex).join(" "), wordBlocks.slice(i.sliceIndex+1).join(" ")]
        return(
          <p key={x} className="flex flex-row items-baseline flex-wrap text-base mb-2">
            {x+1}. {partBefore} <input type="text" name="blank1" placeholder={i.placeholder} className="mx-2 w-1/4 border border-gray-300 rounded px-2 py-1" /> {partAfter}
          </p>
        )
      })
    }
  </li>
);

const TestExercise = () => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.6 A Test</h5>
    <p>Which is a fruit?</p>
    <div className="px-4">
      <label className="inline-flex items-center mt-2"><input type="radio" name="test" className="form-radio mr-2" /> <span className="ml-2">Chair</span></label>
      <br />
      <label className="inline-flex items-center mt-2"><input type="radio" name="test" className="form-radio mr-2" /> <span className="ml-2">Car</span></label>
      <br />
      <label className="inline-flex items-center mt-2"><input type="radio" name="test" className="form-radio mr-2" /> <span className="ml-2">Cherry</span></label>
    </div>
  </li>
);

const ArticleExercise = () => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.7 An article about robots</h5>
    <img src="https://th.bing.com/th/id/R.ee9e4f728bb1d88f72dbb08c8df0e114?rik=cUxMkcgIWpbYiw&pid=ImgRaw&r=0" alt="Robots" className="w-full h-auto rounded-md mb-2" />
    <p>In the bustling city of Neotropolis...</p>
  </li>
);

const TextExercise = () => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.8 Text about robots</h5>
    <p>Robots are machines designed to perform tasks autonomously or with minimal human intervention...</p>
  </li>
);

const WritingExercise = () => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.9 Writing Exercise about Robots</h5>
    <textarea placeholder="Write something about robots" className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
  </li>
);

const AudioExercise = () => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.10 Audio Exercise</h5>
    <audio controls className="w-full">
      <source src="/path/to/robot-audio.mp3" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  </li>
);

const GapFillNoBox = () => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.11 Gap Fill (No Box)</h5>
    <div className="flex flex-wrap">
      <p className="flex flex-row items-baseline flex-wrap text-base">
        Robots <input type="text" className="mx-2 w-1/4 border border-gray-300 rounded px-2 py-1" placeholder=" be" /> machines. In <input type="text" className="mx-2 w-1/4 border border-gray-300 rounded px-2 py-1" placeholder=" preposition(place)" />the bustling city of Neotropolis, a quirky household robot named Z3N loved to tell stories and help the Johnson children, Mia and Leo. When they <input type="text" className="mx-2 w-1/4 border border-gray-300 rounded px-2 py-1" placeholder=" pronoun" /> grew anxious about their upcoming school talent show—Mia too shy to sing solo and Leo lacking confidence for his magic act—Z3N had an idea.
      </p>
    </div>
  </li>
);

const PictureLabel = () => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.12 Picture Label</h5>
    <input type="text" placeholder="Label" className="w-1/4 border border-gray-300 rounded px-2 py-1 mb-2" disabled defaultValue="robots" />
    <div className="flex flex-col items-center justify-start">
      <img src="https://www.bing.com/th?id=OIP.l89mVn4MiRsQuptE_ePPdwHaK-&w=146&h=217&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2" alt="Robot" className="w-auto h-auto border border-gray-300 rounded-md mr-3" />
    </div>
  </li>
);

const SortingExercise = ({ items, handleOnDragEnd }) => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.13 Words Order (Sorting)</h5>
    <DragComponent
      id={"sortingItems"}
      items={items}
      direction={'horizontal'}
      layout={({ innerRef, draggableProps, dragHandleProps, item }) => {
        if(!innerRef||!dragHandleProps||!draggableProps){
          return(
            <p className="text-red-500">Nothing here</p>
          )
        }
        return (
          <div ref={innerRef} {...draggableProps} {...dragHandleProps} className="w-1/4 mx-1 p-2 bg-gray-100 rounded border border-gray-300 flex items-center justify-between shadow-sm">
            <span className="flex-grow text-gray-800">{item.content}</span>
            <i className="fas fa-arrows-alt text-gray-500"></i>
          </div>
        )
      }}
    />
  </li>
);

const SelectOption = ({dropDownItems=['Edit', 'Delete']})=>{
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [dropValue, setDropValue] = useState("")
  const toggleDropdown = (id) => setDropdownOpen(prevState => (prevState === id ? null : id));
  return (
    <div className="relative">
      <button
        onClick={() => toggleDropdown('section')}
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {dropValue.toLowerCase() || '___'}
        <i className="fas fa-chevron-down ml-2 -mr-1 h-5 w-5" ></i>
      </button>
      {dropdownOpen === 'section' && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {dropDownItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setDropValue(item);
                  setDropdownOpen(null);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
const OptionChoose = () => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.14 Option Choose</h5>
    <p className="flex flex-row items-baseline flex-wrap text-base">Robots <SelectOption dropDownItems={['are', 'is', 'am']}/> designed to do some interesting things</p>
  </li>
);

const TrueFalse = () => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.15 True/False</h5>
    <p>Robots are machines designed to perform tasks autonomously.</p>
    <div className="flex flex-col">
      <label className="inline-flex items-center mt-2">
        <input type="radio" name="truefalse" className="form-radio mr-2" /> <span className="ml-2">True</span>
      </label>
      <label className="inline-flex items-center mt-2">
        <input type="radio" name="truefalse" className="form-radio mr-2" /> <span className="ml-2">False</span>
      </label>
    </div>
  </li>
);

const MatchingExercise = ({ leftItems, rightItems }) => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.16 Matching</h5>
    <div className="flex flex-row justify-between gap-2">
      <div className="w-1/2">
        <DragComponent
          id={"left-match-items"}
          items={leftItems}
          layout={({ innerRef, draggableProps, dragHandleProps, item }) => {
            if (!innerRef || !dragHandleProps || !draggableProps) {
              return (<p className="text-red-500">Nothing here</p>)
            }
            return (
              <div ref={innerRef} {...draggableProps} {...dragHandleProps} key={item.id} className="p-2 bg-gray-100 rounded mb-2 border border-gray-300 shadow-sm">
                {item.content}
              </div>
            )
          }}/>
      </div>
      <div className="w-1/2 ml-3">
        <DragComponent
          id={"right-match-items"}
          items={rightItems}
          layout={({ innerRef, draggableProps, dragHandleProps, item }) => {
            if (!innerRef || !dragHandleProps || !draggableProps) {
              return (<p className="text-red-500">Nothing here</p>)
            }
            return (
              <div ref={innerRef} {...draggableProps} {...dragHandleProps} key={item.id} className="p-2 bg-gray-100 rounded mb-2 border border-gray-300 shadow-sm">
                {item.content}
              </div>
            )
          }} />
      </div>
    </div>
  </li>
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
          <div {...provided.droppableProps} ref={provided.innerRef} className={`flex ${direction && direction === "horizontal" ? "flex-row" : "flex-col"} space-y-2`}>
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
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.17 Unscramble</h5>
    <div className="mb-2 p-2 bg-gray-100 rounded border border-gray-300 shadow-sm">
        {
          items.map((item, index) => (
            <DragComponent
              key={item.id}
              id={"unscrambleItems-"+item.id}
              items={item.content.split("").map((i,x)=>({id: (x+1).toString(), content:i}))}
              direction={"horizontal"}
              layout={({ innerRef, draggableProps, dragHandleProps, item }) => {
                if (!innerRef || !dragHandleProps || !draggableProps) {
                  return (<p className="text-red-500">Nothing here</p>)
                }
                return (
                  <div ref={innerRef} {...draggableProps} {...dragHandleProps} className="mx-1 mb-2 p-2 bg-white rounded border border-gray-300 flex items-center justify-between shadow-sm">
                    <span className="text-gray-800">{item.content}</span>
                    <i className="fas fa-arrows-alt text-gray-500"></i>
                  </div>
                )
              }}
            />
          ))
        }
      </div>
  </li>
);

const SortExercise = ({items}) => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.18 Sort Exercise</h5>
    <p className="mb-2">Sort the following sentences in order:</p>
    <div className="mb-2">Drag words here: <input type="text" className="mx-2 w-1/4 border border-gray-300 rounded px-2 py-1" /></div>
    <DragComponent
      id={"sortableSentences"}
      items={items}
      layout={({ innerRef, draggableProps, dragHandleProps, item, idx }) => {
        if (!innerRef || !dragHandleProps || !draggableProps) {
          return (<p className="text-red-500">Nothing here</p>)
        }
        return (
          <div ref={innerRef} {...draggableProps} {...dragHandleProps} className="mx-1 mb-2 p-2 bg-gray-100 rounded border border-gray-300 flex items-center justify-between shadow-sm">
            <span className="text-gray-800">{idx+1}. {item.content}</span>
            <i className="fas fa-arrows-alt text-gray-500"></i>
          </div>
        )
      }}
    />
  </li>
);

const ExternalLink = ({ link = "https://www.example.com" }) => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.19 External Link</h5>
    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
      Follow the link
    </a>
  </li>
);

const NewWords = ({items}) => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.20 New Words</h5>
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2">Add all words</button>
    <div className="space-y-2">
      {
        items.map((i,x)=>(
          <p key={x} className="mb-2 p-2 bg-gray-100 rounded border border-gray-300 shadow-sm">
            - <span className="font-semibold">{i.content}</span> : {i.definition}
          </p>
        ))
      }
    </div>
  </li>
);

const RecordExercise = () => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">1.21 Record Yourself Saying Robots</h5>
    <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-3 rounded text-sm">Start recording</button>
    <audio controls className="w-full mt-2">
      <source src="/path/to/robot-audio.mp3" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  </li>
);

const TimedTest = () => (
  <li className="py-3">
    <h5 className="text-lg font-semibold mb-2">2.1 Take the Test</h5>
    <p>Time-limited test with 1 question.</p>
  </li>
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
    <div id="content" className="container mx-auto my-4 min-h-[calc(100vh-97px)]">
      <div className="bg-white rounded-lg shadow-md mb-4">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center">
            <div className="rounded-full flex justify-center items-center bg-gray-100 h-20 w-20">
              <span className="text-gray-500 text-4xl">S</span>
            </div>
            <div className="ml-3">
              <h4 className="text-xl font-semibold">Section 1</h4>
            </div>
          </div>
          <div className="flex items-center">
            {/* Assuming SelectOption is a dropdown for section actions */}
            <SelectOption />
            <button className="text-gray-500 hover:text-gray-700 focus:outline-none ml-2" onClick={toggleSection}>
              {isOpen ? <i className="fas fa-chevron-up"></i> : <i className="fas fa-chevron-down"></i>}
            </button>
          </div>
        </div>

        <div className={`${isOpen ? 'block' : 'hidden'}`}>
          <div className="p-4">
            <ul className="divide-y divide-gray-200">
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
              <ExternalLink link={null} />
              <NewWords items={newWords} />
              <RecordExercise />
              <TimedTest />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionViewerV7;

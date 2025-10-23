import React, { useState } from 'react';
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
    <div id="content" className="min-h-[calc(100vh-97px)]">
      <div className="data_wrapper">
        {/* Section Card */}
        <div className="bg-white rounded-lg shadow-md mb-3">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <div
                className="bg-pink-100 h-20 w-20 rounded-lg flex items-center justify-center mr-3"
              >
                <span className="text-pink-400 text-4xl">S</span>
              </div>
              <div>
                <h5 className="text-xl font-semibold">Section 1</h5>
              </div>
            </div>
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('section')}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <i className="fas fa-ellipsis-v"></i>
                </button>
                {dropdownOpen === 'section' && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Delete</a>
                  </div>
                )}
              </div>
              <button
                onClick={toggleSection}
                className="text-gray-500 hover:text-gray-700 focus:outline-none ml-2"
              >
                {isOpen ? <i className="fas fa-chevron-up"></i> : <i className="fas fa-chevron-down"></i>}
              </button>
            </div>
          </div>

          {/* Lessons List */}
          <div className={`${isOpen ? 'block' : 'hidden'}`}>
            <div className="p-4 pt-0">
              <ul className="divide-y divide-gray-200">
                <li className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <div
                      className="bg-pink-100 h-10 w-10 rounded-lg flex items-center justify-center mr-3"
                    >
                      <span className="text-pink-400 text-xl">U</span>
                    </div>
                    <div>
                      <h6 className="text-base font-semibold">Unit 1</h6>
                    </div>
                  </div>
                  <button
                    onClick={toggleLessonModal}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Open Unit
                  </button>
                </li>

                <li className="flex items-center justify-start py-3 cursor-pointer hover:bg-gray-50">
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded text-sm mr-3">
                    <i className="fas fa-plus-lg"></i>
                  </button>
                  <div>New Unit</div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Lesson Modal */}
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isLessonOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold">Unit 1</h4>
              <button onClick={toggleLessonModal} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            {/* Lesson Content */}
            <div className="lesson-content">
              {/* Exercise 1.23 Vocabulary Exercise */}
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                      <span className="text-blue-500 font-bold">1.23</span>
                    </div>
                    <h5 className="text-lg font-semibold">Vocabulary Exercise</h5>
                  </div>
                </div>
                <button onClick={handleAddAllWords} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-3">Add all words</button>
                {vocabularyWords.map(word => (
                  <div key={word.id} className="flex items-center mb-2">
                    <button onClick={() => handleAddWord(word.id)} disabled={word.added} className={`py-1 px-3 rounded text-sm mr-2 ${word.added ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}>
                      {word.added ? <i className="fas fa-check-lg"></i> : <i className="fas fa-plus-lg"></i>}
                    </button>
                    <div className="mr-auto">
                      <strong className="font-semibold">{word.word}</strong> - {word.definition}
                    </div>
                    <button className="text-gray-500 hover:text-gray-700">
                      <i className="fas fa-volume-up"></i>
                    </button>
                  </div>
                ))}
              </div>
              {/* Exercise 1.20 Sorting Exercise */}
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                      <span className="text-blue-500 font-bold">1.20</span>
                    </div>
                    <h5 className="text-lg font-semibold">Sorting Exercise</h5>
                  </div>
                </div>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                  <Droppable droppableId="sortingItems">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {sortingItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="mb-2 p-2 border border-gray-200 rounded-md bg-white flex items-center">
                                <span className="mr-auto">{item.content}</span>
                                <button className="text-gray-500 hover:text-gray-700">
                                  <i className="fas fa-arrows-alt"></i>
                                </button>
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
              <div className="flex items-center justify-start py-3 cursor-pointer hover:bg-gray-50">
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded text-sm mr-3">
                  <i className="fas fa-plus-lg"></i>
                </button>
                <div>New Exercise</div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={toggleLessonModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionViewerV2;
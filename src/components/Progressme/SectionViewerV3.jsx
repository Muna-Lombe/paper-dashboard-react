import React, { useState } from 'react';
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
    <div id="content" className="min-h-[calc(100vh-97px)]">
      <div className="data_wrapper">
        {/* Section Card */}
        <div className="bg-white rounded-lg shadow-md mb-3 flex flex-row items-start">
          <div className="flex flex-row items-center justify-between p-4 flex-grow">
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
                {/* Unit 1 */}
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
                </li>

                {/* Exercises */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.4 A video about trees</h5>
                  <div className="video-wrapper aspect-w-16 aspect-h-9">
                    <iframe
                      width="560"
                      height="315"
                      src="https://www.youtube.com/embed/samplevideo"
                      title="YouTube video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                    <p className="text-center mt-2">trees</p>
                  </div>
                </li>

                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.5 Gap Fill Exercise</h5>
                  <p>
                    There <input type="text" name="blank1" placeholder="are" className="inline-block border border-gray-300 rounded px-2 py-1" value={gapFillAnswers.blank1} onChange={handleGapFillChange} /> a chair in the room. There{' '}
                    <input type="text" name="blank2" placeholder="are" className="inline-block border border-gray-300 rounded px-2 py-1" value={gapFillAnswers.blank2} onChange={handleGapFillChange} /> some people on the street.
                  </p>
                </li>

                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.6 A Test</h5>
                  <p>Which is a fruit?</p>
                  <div>
                    <label className="inline-flex items-center mt-2"><input type="radio" name="test" className="form-radio" /> <span className="ml-2">Chair</span></label>
                    <br />
                    <label className="inline-flex items-center mt-2"><input type="radio" name="test" className="form-radio" /> <span className="ml-2">Car</span></label>
                    <br />
                    <label className="inline-flex items-center mt-2"><input type="radio" name="test" className="form-radio" /> <span className="ml-2">Cherry</span></label>
                  </div>
                </li>

                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.7 An article about robots</h5>
                  <div className="article">
                    <img src="/path/to/robot-poster.jpg" alt="something about robots" className="w-full h-auto rounded-md mb-2" />
                    <p>In the bustling city of Neotropolis...</p>
                  </div>
                </li>

                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.8 Text about robots</h5>
                  <p>Robots are machines designed to perform tasks autonomously or with minimal human intervention...</p>
                </li>

                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.9 Writing Exercise about Robots</h5>
                  <textarea placeholder="Write something about robots" className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                </li>

                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.10 Audio Exercise</h5>
                  <audio controls className="w-full">
                    <source src="/path/to/robot-audio.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </li>

                {/* Continue adding more exercises as shown in the screenshots... */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.17 Unscramble</h5>
                  <div className="flex flex-col">
                    <p className="mb-2">Autonomously</p>
                    <input type="text" placeholder="Type the word" className="border border-gray-300 rounded px-3 py-2 mb-2" />
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Test</button>
                  </div>
                </li>

                {/* External Link */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.19 External Link</h5>
                  <a href="https://www.example.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    Follow the link
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionViewerV3;

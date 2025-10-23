import React, { useState } from 'react';

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
    <div id="content" className="min-h-[calc(100vh-97px)]">
      <div className="data_wrapper">
        {/* Section Card */}
        <div className="bg-white rounded-lg shadow-md mb-3">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <div className="bg-pink-100 h-20 w-20 rounded-lg flex items-center justify-center mr-3">
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
                {/* Exercise 1.1: Instructions */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.1 Some Instructions</h5>
                  <p>Hello <input type="text" name="blank1" placeholder="(someone)" className="inline-block border border-gray-300 rounded px-2 py-1" value={gapFillAnswers.blank1} onChange={(e) => setGapFillAnswers({...gapFillAnswers, blank1: e.target.value})} /></p>
                </li>

                {/* Exercise 1.2: Carousel */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.2 This is a carousel of pictures</h5>
                  <img src="/path/to/table.jpg" alt="Table" className="w-full h-auto rounded-md" />
                  <p className="text-center mt-2">A table</p>
                </li>

                {/* Exercise 1.3: GIF */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.3 A GIF about something funny</h5>
                  <img src="/path/to/cat-gif.gif" alt="A funny GIF" className="w-full h-auto rounded-md" />
                </li>

                {/* Exercise 1.4: Video */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.4 A video about trees</h5>
                  <div className="video-wrapper aspect-w-16 aspect-h-9">
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/samplevideo" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
                    <p className="text-center mt-2">Trees</p>
                  </div>
                </li>

                {/* Exercise 1.5: Gap Fill */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.5 Gap Fill Exercise</h5>
                  <p>There <input type="text" name="blank1" placeholder="are" className="inline-block border border-gray-300 rounded px-2 py-1" value={gapFillAnswers.blank1} onChange={(e) => setGapFillAnswers({...gapFillAnswers, blank1: e.target.value})} /> a chair in the room. There <input type="text" name="blank2" placeholder="are" className="inline-block border border-gray-300 rounded px-2 py-1" value={gapFillAnswers.blank2} onChange={(e) => setGapFillAnswers({...gapFillAnswers, blank2: e.target.value})} /> some people on the street.</p>
                </li>

                {/* Exercise 1.6: Test */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.6 A Test</h5>
                  <p>Which is a fruit?</p>
                  <div>
                    <label className="inline-flex items-center mt-2"><input type="radio" name="test" className="form-radio" /> <span className="ml-2">Chair</span></label>
                    <label className="inline-flex items-center mt-2"><input type="radio" name="test" className="form-radio" /> <span className="ml-2">Car</span></label>
                    <label className="inline-flex items-center mt-2"><input type="radio" name="test" className="form-radio" /> <span className="ml-2">Cherry</span></label>
                  </div>
                </li>

                {/* Exercise 1.7: Article */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.7 An article about robots</h5>
                  <div className="article">
                    <img src="/path/to/robot-poster.jpg" alt="Robots" className="w-full h-auto rounded-md mb-2" />
                    <p>In the bustling city of Neotropolis...</p>
                  </div>
                </li>

                {/* Exercise 1.8: Text */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.8 Text about robots</h5>
                  <p>Robots are machines designed to perform tasks autonomously or with minimal human intervention...</p>
                </li>

                {/* Exercise 1.9: Writing */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.9 Writing Exercise about Robots</h5>
                  <textarea placeholder="Write something about robots" className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                </li>

                {/* Exercise 1.10: Audio */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.10 Audio Exercise</h5>
                  <audio controls className="w-full">
                    <source src="/path/to/robot-audio.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </li>

                {/* Exercise 1.11: Gap Fill No Box */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.11 Gap Fill (No Box)</h5>
                  <p>Robots <input type="text" className="inline-block border border-gray-300 rounded px-2 py-1" /> machines...</p>
                </li>

                {/* Exercise 1.12: Picture Label */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.12 Picture Label</h5>
                  <div>
                    <img src="/path/to/robot.jpg" alt="Robot" className="w-full h-auto rounded-md mb-2" />
                    <input type="text" placeholder="Label" className="border border-gray-300 rounded px-3 py-2 w-full" />
                  </div>
                </li>

                {/* Exercise 1.13: Words Order */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.13 Words Order</h5>
                  <div>Robots are machines <input type="text" className="inline-block border border-gray-300 rounded px-2 py-1" /> autonomously...</div>
                </li>

                {/* Exercise 1.14: Option Choose */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.14 Option Choose</h5>
                  <p>Robots <input type="text" className="inline-block border border-gray-300 rounded px-2 py-1" /> designed to...</p>
                </li>

                {/* Exercise 1.15: True/False */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.15 True/False</h5>
                  <p>Robots are machines designed to perform tasks autonomously.</p>
                  <div>
                    <label className="inline-flex items-center mt-2"><input type="radio" name="truefalse" className="form-radio" /> <span className="ml-2">True</span></label>
                    <label className="inline-flex items-center mt-2"><input type="radio" name="truefalse" className="form-radio" /> <span className="ml-2">False</span></label>
                  </div>
                </li>

                {/* Exercise 1.16: Matching */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.16 Matching</h5>
                  <div className="matching">
                    <div>Robots are machines <input type="text" className="inline-block border border-gray-300 rounded px-2 py-1" />...</div>
                  </div>
                </li>

                {/* Exercise 1.17: Unscramble */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.17 Unscramble</h5>
                  <div className="flex flex-col">
                    <p className="mb-2">Autonomously</p>
                    <input type="text" placeholder="Type the word" className="border border-gray-300 rounded px-3 py-2 mb-2" />
                  </div>
                </li>

                {/* Exercise 1.18: Sort Exercise */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.18 Sort Exercise</h5>
                  <div>
                    <div>Drag words here: <input type="text" className="inline-block border border-gray-300 rounded px-2 py-1" /></div>
                  </div>
                </li>

                {/* Exercise 1.19: External Link */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.19 External Link</h5>
                  <a href="https://www.example.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Follow the link</a>
                </li>

                {/* Exercise 1.20: Vocabulary */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.20 New Words</h5>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add all words</button>
                  <div className="mt-2">Robot - A walking machine</div>
                </li>

                {/* Exercise 1.21: Record Yourself */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">1.21 Record Yourself Saying Robots</h5>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Start recording</button>
                </li>

                {/* Exercise 2.1: Time-limited Test */}
                <li className="py-3">
                  <h5 className="text-lg font-semibold mb-2">2.1 Take the Test</h5>
                  <div>Time-limited test with 1 question.</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionViewerV4;

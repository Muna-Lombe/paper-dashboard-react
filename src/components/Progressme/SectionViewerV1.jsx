import React, { useState } from 'react';

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
                {/* Existing Lessons */}
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

                {/* New Unit Button */}
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
              <div className="lesson-section">
                <h4 className="text-lg font-semibold flex items-center mb-4">
                  Section 1
                  <button className="text-blue-500 hover:text-blue-700 ml-2 p-0">
                    <i className="fas fa-pencil-alt"></i>
                  </button>
                </h4>

                {/* Exercises List */}
                <div className="mt-4">
                  {/* Exercise Item 1.1 */}
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div
                          className="bg-blue-100 rounded-full h-10 w-10 flex items-center justify-center mr-3"
                        >
                          <span className="text-blue-500 font-bold">1.1</span>
                        </div>
                        <h5 className="text-lg font-semibold">Some Instructions</h5>
                      </div>
                      <ExerciseActions />
                    </div>
                    <div className="lesson-content">
                      <p>
                        <span>Hello </span>
                        <span className="text-blue-500">[drag word here]</span>
                        <span>(someone).</span>
                      </p>
                    </div>
                  </div>

                  {/* Additional exercises (1.2 - 1.11) would follow the same structure */}
                </div>
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

const ExerciseActions = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <div className="relative z-10">
      <button
        onClick={toggleDropdown}
        className="text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <i className="fas fa-ellipsis-v"></i>
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1">
          <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <i className="fas fa-sync-alt mr-3 text-gray-500"></i>
            <span>Reset the answers</span>
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <i className="fas fa-arrows-alt mr-3 text-gray-500"></i>
            <span>Change position</span>
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <i className="fas fa-edit mr-3 text-gray-500"></i>
            <span>Edit exercise</span>
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <i className="fas fa-trash-alt mr-3 text-gray-500"></i>
            <span>Delete exercise</span>
          </a>
          <div className="border-t border-gray-200"></div>
          <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <i className="fas fa-copy mr-3 text-gray-500"></i>
            <span>Copy exercise(s) to...</span>
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <i className="fas fa-reply mr-3 text-gray-500"></i>
            <span>Move exercise(s) to...</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default SectionViewerV1;

import React from 'react'

function TextLogo({className}) {
  return (
    <div>
      {/* <span className="text-2xl flex items-start font-bold text-gray-800">
        <span className="text-blue-600 text-3xl italic">PaperDash</span>
        <span className="text-blue-400 text-xl"><i className="fas fa-pen-nib"></i></span>
      </span> */}
      <img srcSet="/logo.png 1x, /logo@2x.png 2x" alt="Logo" className={`h-14 ${className}`} />
    </div>
  )
}

export default TextLogo
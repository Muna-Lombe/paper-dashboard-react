import React from "react";

function TextLogo({ className = "h-9" }) {
  return (
    <img
      srcSet="/logo.png 1x, /logo@2x.png 2x"
      src="/logo.png"
      alt="PaperDash"
      className={`w-auto object-contain ${className}`}
    />
  );
}

export default TextLogo;

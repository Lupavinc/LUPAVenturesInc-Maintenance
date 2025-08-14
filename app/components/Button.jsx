// app/components/Button.jsx
import React from "react";
import Link from "next/link";

const Button = ({ text, link, onClick, type = "button", className = "" }) => {
  const baseStyle =
    "w-full bg-yellow-400 text-black py-3 px-6 rounded-md hover:bg-yellow-500 transition ease-in-out duration-300 font-semibold";

  // Merge base styles with incoming className (user's styles will override base)
  const combinedClassName = `${baseStyle} ${className}`;

  if (link) {
    return (
      <Link href={link}>
        <span className={combinedClassName}>{text}</span>
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={combinedClassName}>
      {text}
    </button>
  );
};

export default Button;

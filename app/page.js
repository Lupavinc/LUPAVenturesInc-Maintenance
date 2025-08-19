"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Button from "./components/Button";

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  //const handleButtonClick = () => {
  //  if (isSignedIn) {
  //    router.push("/dashboard");
  //  } else {
  //    alert("Please sign in to view available listings and services.");
  //    router.push("/sign-in");
  //  }
  //};

  const handleButtonClick = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 sm:px-12 py-12 gap-16 bg-white">
      {/* Hero-style layout with house image and tagline */}
      <section className="w-full flex flex-col-reverse sm:flex-row items-center justify-between gap-10 sm:gap-16">
        
        {/* Left: House Image */}
        <div className="w-full sm:w-1/2">
          <img
            src="/assets/House.jpg"
            alt="Modern rental house"
            className="w-full h-auto rounded-xl shadow-lg object-cover"
          />
        </div>

        {/* Right: Heading & Call to Action */}
        <div className="w-full sm:w-1/2 text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-2 no-underline">
          Your Next <span className="text-yellow-400 no-underline">Home</span> Starts{" "}
          <span className="text-yellow-400 no-underline">Here</span>
        </h1>

          
          <div className="w-16 h-1 bg-yellow-400 my-4 mx-auto sm:mx-0"></div>

          {/* Tagline paragraph removed */}

          //<Button
          //  text="Browse Listings"
          //  onClick={handleButtonClick}
          ///>
        </div>
      </section>
    </div>
  );
}

"use client"; 

import { SignIn } from "@clerk/nextjs";
import React from "react";

const SignInPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen pb-20 py-2 rounded-2xl"> 
      <section className="bg-white rounded-2xl p-6 sm:p-8 md:p-12 w-full max-w-screen-sm sm:max-w-lg md:max-w-3xl relative flex flex-col space-y-8 border-4 border-black shadow-lg overflow-hidden">
        <h2 className="text-3xl font-semibold text-center text-black mb-6">
          Welcome Back
        </h2>
        <section className="flex justify-center items-center">
          <SignIn />
        </section>
      </section>
    </div>
  );
};

export default SignInPage;

"use client"; 

import { SignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation"; 
import React, { useEffect } from "react";

const SignUpPage = () => {
  const { isSignedIn } = useUser(); 
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/profile"); 
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen pb-20 rounded-2xl">
      <section className="bg-white rounded-2xl p-12 w-full max-w-5xl relative flex flex-col space-y-8 border-4 border-black shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-black mb-6">
          Welcome
        </h2>
        <section className="flex justify-center items-center">
          <SignUp />
        </section>
      </section>
    </div>
  );
};

export default SignUpPage;

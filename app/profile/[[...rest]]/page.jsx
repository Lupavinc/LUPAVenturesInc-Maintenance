"use client";  

import { UserProfile, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";  

const ProfilePage = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();  

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    router.push("/sign-in");  
    return null;  
  }

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-black py-2 rounded-2xl">   
        <section className="bg-white rounded-2xl p-12 w-full max-w-5xl relative flex flex-col space-y-8 border-4 border-black shadow-lg">
          
          <section className="text-center mb-8">
            <h2 className="text-4xl font-semibold mb-4">
              <span className="text-black">Welcome, </span>
              <span className="text-yellow-500">
                {user.firstName} {user.lastName}!
              </span>
            </h2>
            <p className="text-lg text-gray-500">We are happy to have you!</p>
          </section>

          <section className="flex justify-center bg-gray-50 rounded-lg p-6 border-2 border-gray-300">
            <UserProfile />
          </section>
        </section>
      </div>
    </>
  );
};

export default ProfilePage;

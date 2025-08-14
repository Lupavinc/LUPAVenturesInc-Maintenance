"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Button from "../components/Button";

const Card = ({
  id,
  imageSrc,
  altText,
  title,
  location,
  price,
  availability,
}) => {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    if (availability) {
      const date = new Date(availability);
      const formatted = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
      setFormattedDate(formatted);
    }
  }, [availability]);

  const handleViewDetails = () => {
    if (isSignedIn) {
      router.push(`/property/${id}`);
    } else {
      alert("Please sign in to view property details.");
      router.push("/sign-in");
    }
  };

  return (
    <section className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition flex flex-col justify-between h-full">
      <div className="relative w-full h-48">
        <Image
          className="rounded-lg object-cover w-full h-full"
          src={imageSrc}
          width={440}
          height={192}
          alt={altText}
        />
      </div>

      <div className="mt-4 text-center flex flex-col justify-between flex-grow">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600">{location}</p>
        <p className="text-black font-semibold mt-2">${price}</p>
        <p className="text-sm text-yellow-600 mt-1">
          Available: {formattedDate || "Loading..."}
        </p>

        <div className="mt-4">
          <Button text="View Details" onClick={handleViewDetails} />
        </div>
      </div>
    </section>
  );
};

export default Card;


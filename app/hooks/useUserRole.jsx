import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs"; 

export function useUserRole() {
  const { user, isLoaded: clerkIsLoaded } = useUser();
  const [role, setRole] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (clerkIsLoaded && user) {
      fetch(`/api/get-user-role?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setRole(data.role);
          setIsLoaded(true);
        })
        .catch(() => {
          setRole(null);
          setIsLoaded(true);
        });
    } else if (clerkIsLoaded) {
      // No user logged in
      setRole(null);
      setIsLoaded(true);
    }
  }, [clerkIsLoaded, user]);

  return { role, isLoaded };
}

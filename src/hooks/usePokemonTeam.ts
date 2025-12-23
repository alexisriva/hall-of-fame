import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export const usePokemonTeam = () => {
  const [team, setTeam] = useState<FirestoreTeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Subscribe to Firestore updates
    const unsubscribe = onSnapshot(
      doc(db, "teams", "main_portfolio"),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const members: FirestoreTeamMember[] = data.members || [];
          setTeam(members);
        } else {
          // Document doesn't exist yet
          setTeam([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore subscription error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { team, loading };
};

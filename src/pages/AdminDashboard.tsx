import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AdminTeamCard from "../components/admin/AdminTeamCard";
import PokemonEditor from "../components/admin/PokemonEditor";
import { auth, db } from "../firebase";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState<FirestoreTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Subscribe to real-time data
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "teams", "main_portfolio"),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setTeam(data.members || []);
        } else {
          setTeam([]);
        }
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleSaveMember = async (updatedMember: FirestoreTeamMember) => {
    if (selectedIndex === null) return;

    // Create new array with updated item
    const newTeam = [...team];
    newTeam[selectedIndex] = updatedMember;

    try {
      // Optimistic update
      setTeam(newTeam);

      // Update Firestore
      await setDoc(doc(db, "teams", "main_portfolio"), {
        members: newTeam,
      });

      setSelectedIndex(null); // Close editor on save
    } catch (error) {
      console.error("Error updating team:", error);
      // Revert would happen automatically via snapshot listener if write failed,
      // but alerting user is good practice
      alert("Failed to save changes");
    }
  };

  return (
    <div className="min-h-screen text-white p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-12 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage your Hall of Fame roster
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            View Site
          </button>
          <div className="h-4 w-px bg-white/10"></div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors text-sm font-semibold tracking-wide cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Team List */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-300 mb-4 px-1">
              Current Roster ({team.length}/6)
            </h2>
            <div className="space-y-3">
              {team.map((member, index) => (
                <AdminTeamCard
                  key={`${member.name}-${index}`}
                  member={member}
                  isSelected={selectedIndex === index}
                  onClick={() => setSelectedIndex(index)}
                />
              ))}

              {/* Add Slot Button (if less than 6) */}
              {team.length < 6 && (
                <button
                  onClick={() => {
                    // Add placeholder
                    const newTeam = [
                      ...team,
                      { name: "", role: "New Member", isShiny: false },
                    ];
                    setTeam(newTeam);
                    setSelectedIndex(newTeam.length - 1);
                  }}
                  className="w-full py-4 rounded-xl border border-dashed border-white/20 text-gray-500 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all text-sm font-medium uppercase tracking-widest cursor-pointer"
                >
                  + Add Slot
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Editor */}
          <div className="lg:col-span-7">
            <h2 className="text-lg font-semibold text-gray-300 mb-4 px-1 opacity-0 md:opacity-100">
              Editor
            </h2>
            {selectedIndex !== null && team[selectedIndex] ? (
              <div className="lg:sticky lg:top-8 animate-fade-in-up">
                <PokemonEditor
                  member={team[selectedIndex]}
                  onSave={handleSaveMember}
                  onCancel={() => setSelectedIndex(null)}
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 border border-white/5 rounded-2xl bg-white/[0.02] text-center min-h-[400px]">
                <div className="p-4 bg-white/5 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg font-medium">
                  Select a Pokemon to edit
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Or add a new slot to your team
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

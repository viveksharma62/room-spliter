import React, { useEffect, useState } from "react";
import { auth, db } from "../db/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";

const Account = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      try {
        // 1️⃣ Pehle find karo ye user kis room me saved hai
        const roomsRef = collection(db, "rooms");
        const q = query(roomsRef);
        const roomSnap = await getDocs(q);

        let foundUser = null;

        // Saare rooms scan karna padega because uid unknown room me ho sakta hai
        for (let roomDoc of roomSnap.docs) {
          const membersRef = collection(db, "rooms", roomDoc.id, "members");
          const userDocRef = doc(membersRef, user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const roomInfo = roomDoc.data();
            foundUser = {
              ...userDocSnap.data(),
              building: roomInfo.building,
              wing: roomInfo.wing,
              room: roomInfo.room,
              email: user.email,
            };
            break;
          }
        }

        setUserData(foundUser);

      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    });

    return () => unsub();
  }, [navigate]);


  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (loading) return <Loading />;

  if (!userData) return (
    <div className="text-center mt-5">
      <h4>User data not found.</h4>
      <p>Try logging out and logging in again.</p>
    </div>
  );

  return (
    <div className="container mt-5">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: "500px", borderRadius: "15px" }}>
        <h2 className="text-center mb-4 text-primary">👤 Account Details</h2>

        <ul className="list-group list-group-flush mb-3">
          <li className="list-group-item"><strong>Name:</strong> {userData.name}</li>
          <li className="list-group-item"><strong>Age:</strong> {userData.age}</li>
          <li className="list-group-item"><strong>Mobile:</strong> {userData.mobile}</li>
          <li className="list-group-item"><strong>Email:</strong> {userData.email}</li>
          <li className="list-group-item"><strong>Address:</strong> {userData.address}</li>
          <li className="list-group-item"><strong>Role:</strong> {userData.role}</li>

          {/* NEW: Room group info */}
          <li className="list-group-item"><strong>Building:</strong> {userData.building}</li>
          <li className="list-group-item"><strong>Wing:</strong> {userData.wing}</li>
          <li className="list-group-item"><strong>Room No:</strong> {userData.room}</li>
        </ul>

        <button className="btn btn-danger w-100" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Account;

import React, { useEffect, useState } from "react";
import { auth, db } from "../db/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";

const Account = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid); // ensure users collection and doc id = user.uid
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.warn("No document found for UID:", user.uid);
            setUserData({ name: user.displayName || "Unknown", email: user.email }); // fallback
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        navigate("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (loading) return <Loading />;

  if (!userData) return (
    <div className="text-center mt-5">
      <h4>No user data found.</h4>
      <p>Try logging out and logging in again.</p>
    </div>
  );

  return (
    <div className="container mt-5">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: "500px", borderRadius: "15px" }}>
        <h2 className="text-center mb-4 text-primary">👤 Account Details</h2>
        <ul className="list-group list-group-flush mb-3">
          <li className="list-group-item"><strong>Name:</strong> {userData.name || "N/A"}</li>
          <li className="list-group-item"><strong>Age:</strong> {userData.age || "N/A"}</li>
          <li className="list-group-item"><strong>Mobile:</strong> {userData.mobile || "N/A"}</li>
          <li className="list-group-item"><strong>Email:</strong> {userData.email || auth.currentUser?.email}</li>
          <li className="list-group-item"><strong>Address:</strong> {userData.address || "N/A"}</li>
          <li className="list-group-item"><strong>Role:</strong> {userData.role || "N/A"}</li>
        </ul>
        <button className="btn btn-danger w-100" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Account;

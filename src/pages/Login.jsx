import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../db/firebase";
import { doc, setDoc } from "firebase/firestore";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("");

  // NEW FIELDS
  const [building, setBuilding] = useState("");
  const [wing, setWing] = useState("");
  const [room, setRoom] = useState("");

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/home");
      } else {
        // REGISTER

        // 1) Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // 2) Room ID create (grouping)
        const roomId = `${building}-${wing}-room${room}`;

        // 3) Save room info (only once)
        await setDoc(
          doc(db, "rooms", roomId),
          {
            building,
            wing,
            room,
          },
          { merge: true }
        );

        // 4) User ko members ke under add karo
        await setDoc(doc(db, "rooms", roomId, "members", user.uid), {
          name,
          age,
          mobile,
          email,
          address,
          role,
        });

        // 5) Auto login
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/home");

        // Reset
        setName("");
        setAge("");
        setMobile("");
        setAddress("");
        setRole("");
        setEmail("");
        setPassword("");
        setBuilding("");
        setWing("");
        setRoom("");
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{ background: "linear-gradient(135deg, #74ebd5, #ACB6E5)" }}
    >
      <div
        className="card shadow p-4 w-100"
        style={{ maxWidth: "420px", borderRadius: "15px" }}
      >
        <h2 className="text-center mb-4 text-primary">
          {isLogin ? "Login" : "Register"}
        </h2>

        {message && <div className="alert alert-danger text-center">{message}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Name"
                className="form-control mb-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Age"
                className="form-control mb-2"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />

              <input
                type="tel"
                placeholder="Mobile"
                className="form-control mb-2"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Address"
                className="form-control mb-2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />

              <select
                className="form-select mb-2"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Select Role</option>
                <option value="Student">Student</option>
                <option value="Employee">Employee</option>
              </select>

              {/* NEW FIELDS */}
              <input
                type="text"
                placeholder="Building Name"
                className="form-control mb-2"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Wing"
                className="form-control mb-2"
                value={wing}
                onChange={(e) => setWing(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Room Number"
                className="form-control mb-3"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            className="form-control mb-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="form-control mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-primary w-100">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="text-center mt-3">
          <button className="btn btn-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have account? Register" : "Already have account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
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
        // Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save extra info in Firestore
        await setDoc(doc(db, "users", user.uid), {
          name,
          age,
          mobile,
          email,
          address,
          role,
        });

        // Auto-login after registration
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/home");

        // Reset form
        setName(""); setAge(""); setMobile(""); setAddress(""); setRole(""); setEmail(""); setPassword("");
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100" style={{ background: "linear-gradient(135deg, #74ebd5, #ACB6E5)" }}>
      <div className="card shadow p-4 w-100" style={{ maxWidth: "420px", borderRadius: "15px" }}>
        <h2 className="text-center mb-4 text-primary">{isLogin ? "Login" : "Register"}</h2>
        {message && <div className="alert alert-danger text-center">{message}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && <>
            <input type="text" placeholder="Name" className="form-control mb-2" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="number" placeholder="Age" className="form-control mb-2" value={age} onChange={(e) => setAge(e.target.value)} required />
            <input type="tel" placeholder="Mobile" className="form-control mb-2" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
            <input type="text" placeholder="Address" className="form-control mb-2" value={address} onChange={(e) => setAddress(e.target.value)} required />
            <select className="form-select mb-2" value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="">Select Role</option>
              <option value="Student">Student</option>
              <option value="Employee">Employee</option>
            </select>
          </>}
          <input type="email" placeholder="Email" className="form-control mb-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="form-control mb-3" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="btn btn-primary w-100">{isLogin ? "Login" : "Register"}</button>
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

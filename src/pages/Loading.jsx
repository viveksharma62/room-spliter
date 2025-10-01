// Loading.jsx
import React from "react";

const Loading = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: "linear-gradient(135deg, #74ebd5, #ACB6E5)" }}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: "4rem", height: "4rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="mt-3 text-primary fw-bold">Please wait...</h4>
      </div>
    </div>
  );
};

export default Loading;

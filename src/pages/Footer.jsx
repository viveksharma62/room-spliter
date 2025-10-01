import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-4 pb-2 mt-auto">
      <div className="container">
        <div className="row align-items-center">
          {/* Left Side */}
          <div className="col-md-4 text-center text-md-start mb-3 mb-md-0">
            <h5 className="fw-bold">Room Splitter</h5>
            <p className="small mb-1">
              <MdEmail className="me-2" />
              <a
                href="mailto:viveksharma28402@gmail.com"
                className="text-light text-decoration-none"
              >
                viveksharma28402@gmail.com
              </a>
            </p>
            <p className="small text-muted mb-0">
              Manage your shared expenses easily
            </p>
          </div>

          {/* Middle Section */}
          <div className="col-md-4 text-center mb-3 mb-md-0">
            <p className="small mb-0">
              💰 Keep track of room expenses with simplicity and accuracy.
            </p>
          </div>

          {/* Right Side */}
          <div className="col-md-4 text-center text-md-end">
            <a
              href="https://github.com/viveksharma62"
              target="_blank"
              rel="noopener noreferrer"
              className="text-light fs-4 me-3"
            >
              <FaGithub />
            </a>
            <a
              href="https://www.linkedin.com/in/vivek-kumar-35637b26a/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-light fs-4"
            >
              <FaLinkedin />
            </a>
          </div>
        </div>

        <hr className="border-secondary my-3" />

        {/* Bottom Section */}
        <div className="text-center small">
          <span>
            &copy; {new Date().getFullYear()} Room Splitter | Made with <span style={{ color: "#e25555" }}>❤</span> by Vivek Sharma | 
            Location: Room, Railnagar, Pin 360004, Gujarat
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";
import "./Navbar.css";

const Navbar = ({ copyRoomId, leaveRoom }) => {
  return (
    <nav className="navbar">
      <div className="container">
        <a className="navbar-brand" href="#">
          <img
            className="logoImage"
            src="/code-sync.png"
            alt="logo"
            height="60"
          />
        </a>
        <div>
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={copyRoomId}
          >
            Share
          </button>
          <button
            type="button"
            className="btn btn-outline-light mx-4"
            onClick={leaveRoom}
          >
            Leave
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

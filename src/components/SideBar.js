import { useState } from "react";
import Client from "./Client";

const SideBar = ({ clients }) => {
  const [isWide, setIsWide] = useState(false);

  const handleImgClick = () => {
    setIsWide((prev) => !prev);
  };
  return (
    <div className={`sidebar ${isWide ? 'wide' : ''}`}>  
      <div className="burger">
        <img
          className="menu"
          width="30"
          height="30"
          src="https://img.icons8.com/glyph-neue/39/FFFFFF/menu--v1.png"
          alt="menu--v1"
          onClick={handleImgClick}
        />
      </div>
    {isWide && <p className="fs-5 text-center">Connected</p>}
      <div className="clientsList">
        {clients.map((client) => (
          <Client key={client.socketId} username={client.username} isWide={isWide}/>
        ))}
      </div>
    </div>
  );
};

export default SideBar;

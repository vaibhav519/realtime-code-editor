import { useState, useEffect } from "react";

const LanguageInfoModal = ({ language, onCloseModal, showModal }) => {
  const [languageInfo, setLanguageInfo] = useState("");

  useEffect(() => {
    switch (language) {
      case "Python":
        setLanguageInfo("Python Version: 3.9.10");
        break;
      case "Cpp":
        setLanguageInfo("Cpp Version: C++11");
        break;
      case "Java":
        setLanguageInfo("Java Version: 17.0.1");
        break;
      case "JavaScript":
        setLanguageInfo("Node.js version: v16.14.0");
        break;
      default:
        setLanguageInfo("Please select a language!");
        break;
    }
  }, [language]);

  return (
    <>
      {showModal && (
        <>
          <div className="fade modal-backdrop show"></div>
          <div className="modal" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Language Info</h5>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="20"
                    width="20"
                    viewBox="0 0 384 512"
                    className="svg-icon"
                    onClick={onCloseModal}
                  >
                    <path
                      fill="#909294"
                      d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                    />
                  </svg>
                </div>
                <div className="modal-body">
                  <p>{languageInfo}</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-success"
                    data-bs-dismiss="modal"
                    onClick={onCloseModal}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default LanguageInfoModal;

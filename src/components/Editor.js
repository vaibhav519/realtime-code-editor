import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";
import AceEditor from "react-ace";
import "brace/mode/javascript";
import "brace/mode/c_cpp";
import "brace/mode/java";
import "brace/mode/python";
import "brace/theme/dracula";
import "brace/theme/monokai";
import "brace/ext/language_tools";
import stubs from "../stubs";
import ResetModal from "./ResetModal";
import LanguageInfoModal from "./LanguageInfoModal";
import ACTIONS from "../Actions";

const Editor = ({
  socketRef,
  roomId,
  onCodeChange,
  onInputChange,
  onOutputChange,
  onLanguageChange,
}) => {
  const [lang, setLang] = useState("Python");
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");
  const [code, setCode] = useState(stubs[lang]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showLanguageInfoModal, setShowLanguageInfoModal] = useState(false);

  const handleSubmit = async () => {
    let outMsg = "";
    let errMsg = "";
    const dataPayload = {
      lang,
      code,
      input,
    };
    handleInputChange("");
    handleOutputChange("");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}run-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataPayload),
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.stdout !== "") {
          outMsg = result.stdout;
        }
        if (result.stderr !== "") {
          errMsg = result.stderr.replace(/File "[^"]+", /g, "");
        }
        handleOutputChange(outMsg + errMsg);
        console.log("Backend Response:", result);
      } else {
        console.error("Backend API Request Failed");
      }
    } catch (error) {
      console.error("Backend API Request Error:", error);
    }
  };

  const clearInputOutput = () => {
    handleInputChange("");
    handleOutputChange("");
  };

  const onCloseResetModal = () => {
    setShowResetModal(false);
  };

  const onCloseLanguageInfoModal = () => {
    setShowLanguageInfoModal(false);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socketRef.current?.emit(ACTIONS.CODE_CHANGE, {
      roomId,
      code: newCode,
    });
  };

  const handleInputChange = (newInput) => {
    setInput(newInput);
    socketRef.current?.emit(ACTIONS.INPUT_CHANGE, {
      roomId,
      input: newInput,
    });
  };

  const handleOutputChange = (newOutput) => {
    setOutput(newOutput);
    socketRef.current?.emit(ACTIONS.OUTPUT_CHANGE, {
      roomId,
      output: newOutput,
    });
  };

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    handleCodeChange(stubs[newLang]);
    socketRef.current?.emit(ACTIONS.LANGUAGE_CHANGE, {
      roomId,
      language: newLang,
    });
  };

  useEffect(() => {
    const currentSocketRef = socketRef.current;
    if (currentSocketRef) {
      currentSocketRef.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          setCode(code);
          onCodeChange(code);
        }
      });

      currentSocketRef.on(ACTIONS.INPUT_CHANGE, ({ input }) => {
        if (input !== null) {
          setInput(input);
          onInputChange(input);
        }
      });

      currentSocketRef.on(ACTIONS.OUTPUT_CHANGE, ({ output }) => {
        if (output !== null) {
          setOutput(output);
          onOutputChange(output);
        }
      });

      currentSocketRef.on(ACTIONS.LANGUAGE_CHANGE, ({ language }) => {
        if (language !== null) {
          setLang(language);
          onLanguageChange(language);
        }
      });
    }

    return () => {
      if (currentSocketRef) {
        currentSocketRef.off(ACTIONS.CODE_CHANGE);
        currentSocketRef.off(ACTIONS.INPUT_CHANGE);
        currentSocketRef.off(ACTIONS.OUTPUT_CHANGE);
        currentSocketRef.off(ACTIONS.LANGUAGE_CHANGE);
      }
    };
  }, [
    onCodeChange,
    onInputChange,
    onLanguageChange,
    onOutputChange,
    socketRef.current,
  ]);

  return (
    <>
      {/* <div className="d-flex justify-content-between rounded p-2 m-1">
        <div className="w-auto">
          <label
            className="visually-hidden"
            htmlFor="inlineFormSelectPref"
          ></label>
          <select
            className="form-select btn dropdown-toggle"
            style={{ background: "#1c1e29", color: "white" }}
            id="inlineFormSelectPref"
            value={lang}
            onChange={(e) => {
              setLang(e.target.value);
            }}
          >
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="Cpp">Cpp</option>
            <option value="JavaScript">JavaScript</option>
          </select>
        </div>
        <div>
          <button
            type="button"
            id="run"
            className="btn runBtn"
            onClick={handleSubmit}
          >
            Run
            <img
              className=""
              width="20"
              height="20"
              src="https://img.icons8.com/ios-glyphs/30/FFFFFF/play--v1.png"
              alt="play--v1"  
            />
          </button>
        </div>
      </div> */}
      <div className="mainEditorWrap">
        <div
          className="editorHeader"
          style={{ height: "50px", background: "#2D2F34" }}
        >
          <div className="d-flex justify-content-center align-items-center mx-4">
            <div
              style={{
                width: "140px",
                position: "relative",
              }}
            >
              <label
                className="visually-hidden text-end"
                htmlFor="inlineFormSelectPref"
              ></label>
              <select
                className="form-select btn dropdown-toggle custom-select"
                style={{
                  padding: "0",
                  textAlign: "left",
                  fontSize: "18px",
                  color: "#FFF",
                  height: "36px",
                  fontWeight: "450",
                  background: "#3A3D43",
                  appearance: "none",
                }}
                id="inlineFormSelectPref"
                value={lang}
                onChange={(e) => {
                  handleLanguageChange(e.target.value);
                }}
              >
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="Cpp">Cpp</option>
                <option value="JavaScript">JavaScript</option>
              </select>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "18px",
                  transform: "translateY(-50%)",
                  width: "0",
                  height: "0",
                  borderTop: "6px solid #FFF",
                  borderRight: "6px solid transparent",
                  borderLeft: "6px solid transparent",
                  pointerEvents: "none",
                }}
              ></div>
            </div>
            <div className="tooltip-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="4 4 16 16"
                width="1.5rem"
                height="1.5rem"
                fill="white"
                className="mx-2"
                style={{ cursor: "pointer" }}
                onClick={() => setShowLanguageInfoModal(true)}
              >
                <path
                  fillRule="evenodd"
                  d="M13.741 7.314a.95.95 0 00-.627-.272.95.95 0 00-.627.272.833.833 0 00-.246.614c0 .246.082.45.246.614a.85.85 0 00.627.245.85.85 0 00.627-.245.833.833 0 00.246-.614.832.832 0 00-.246-.614zm-.34 2.919c-.01-.273-.178-.41-.505-.41-.4.092-.914.36-1.541.805-.628.446-.969.696-1.023.75-.055.055-.082.091-.082.11l.082.136c.036.09.063.14.082.15.018.01.054-.004.109-.04l.627-.41c.564-.364.732-.16.505.614-.228.772-.505 1.94-.832 3.505-.055.709.127 1.013.545.913.419-.1.746-.231.982-.395l1.364-.955c.055-.036.073-.072.055-.109l-.11-.19c-.036-.037-.072-.055-.109-.055l-.027.027c-.218.145-.45.29-.695.436-.246.146-.405.146-.478 0-.036-.218.064-.754.3-1.609l.682-2.564c.055-.2.077-.436.068-.71z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="tooltip-text">Language Info</span>
            </div>
            <LanguageInfoModal
              language={lang}
              onCloseModal={onCloseLanguageInfoModal}
              showModal={showLanguageInfoModal}
            />
          </div>
          <div className="d-flex justify-content-center align-items-center">
            <div className="tooltip-container">
              <FontAwesomeIcon
                icon={faArrowRotateRight}
                flip="horizontal"
                onClick={() => {
                  setShowResetModal(true);
                }}
                style={{
                  width: "20px",
                  height: "20px",
                  color: "#ffffff",
                  cursor: "pointer",
                  marginRight: "1.5rem",
                }}
              />
              <span className="tooltip-text">Reset Code</span>
            </div>
            <ResetModal
              language={lang}
              showModal={showResetModal}
              onCloseModal={onCloseResetModal}
              handleCodeChange={handleCodeChange}
            />
            <button
              type="button"
              id="run"
              className="btn runBtn btn-outline-light"
              onClick={handleSubmit}
            >
              Run Code
            </button>
          </div>
        </div>
        <div className="editorWrap">
          <AceEditor
            placeholder="Placeholder Text"
            mode={lang === "Cpp" ? "c_cpp" : lang?.toLowerCase()}
            theme="dracula"
            name="editor"
            width="100%"
            height="100%"
            fontSize={17}
            showPrintMargin={false}
            showGutter={true}
            highlightActiveLine={false}
            value={code}
            onChange={handleCodeChange}
            enableBasicAutocompletion={true}
            enableLiveAutocompletion={true}
            enableSnippets={false}
            showLineNumbers={true}
            tabSize={4}
            $blockScrolling={{ Infinity }}
            onLoad={(editor) => {
              editor.renderer.setPadding(4);
            }}
          />
        </div>
      </div>

      {/* <div
        className="d-flex flex-column rounded bg-dark mx-2 border-none"
        style={{ width: "28vw" }}
      >
        <div className="w-100">
          <textarea
            type="text"
            id="input"
            className="form-control"
            style={{ height: "40vh", background: "#1c1e29", color: "white" }}
            aria-label="Last name"
            placeholder="Enter Input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          ></textarea>
        </div>
        <div className="w-100 mt-2">
          <textarea
            readOnly
            type="text"
            id="output"
            className="form-control"
            style={{ height: "40vh", background: "#1c1e29", color: "white" }}
            aria-label="Last name"
            placeholder="Output"
            value={output}
            onChange={(e) => setOutput(e.target.value)}
          ></textarea>
        </div>
      </div> */}
      <div
        className="d-flex flex-column rounded bg-dark border-none outline-none"
        style={{ width: "30.5vw" }}
      >
        <div
          style={{
            width: "100%",
            height: "50px",
            background: "#2D2F34",
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            className="btn runBtn btn-outline-light mx-4"
            style={{ width: "70px" }}
            onClick={clearInputOutput}
          >
            Clear
          </button>
        </div>
        <div
          className="d-flex flex-column rounded bg-dark border-none outline-none"
          style={{ width: "30.5vw" }}
        >
          <div
            className="d-flex flex-column rounded bg-dark border-none outline-none"
            style={{ width: "30.5vw" }}
          >
            <div
              style={{
                height: "calc(100vh - 137px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <textarea
                type="text"
                id="input"
                className="w-100"
                style={{
                  fontSize: "18px",
                  resize: "none",
                  height: "50%",
                  background: "#1C2130",
                  color: "white",
                  padding: "10px",
                }}
                aria-label="Input"
                placeholder="Enter Input"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
              ></textarea>
              <textarea
                readOnly
                type="text"
                id="output"
                className="w-100"
                style={{
                  fontSize: "18px",
                  resize: "none",
                  height: "50%",
                  background: "#1C2130",
                  color: "white",
                  padding: "10px",
                  borderTop: "1px solid #565656",
                }}
                aria-label="Output"
                placeholder="Output"
                value={output}
                onChange={(e) => handleOutputChange(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Editor;

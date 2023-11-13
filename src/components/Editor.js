import React, { useState, useEffect } from "react";
import ace from "ace-builds";
import AceEditor from "react-ace";
import "brace/mode/javascript";
import "brace/mode/c_cpp";
import "brace/mode/java";
import "brace/mode/python";
import "brace/theme/dracula";
import "brace/theme/monokai";
import "brace/ext/language_tools";
import stubs from "../stubs";
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
  const [code, setCode] = useState("");

  const handleSubmit = async () => {
    const dataPayload = {
      lang,
      code,
      input,
    };
    setInput("");
    setOutput("");
    try {
      const response = await fetch("http://localhost:5000/run-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataPayload),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.stdout !== "") {
          setOutput(result.stdout);
        } else if (result.stderr !== "") {
          let errMsg = result.stderr.replace(/File "[^"]+", /g, "");
          setOutput(errMsg);
        }
        console.log("Backend Response:", result);
      } else {
        console.error("Backend API Request Failed");
      }
    } catch (error) {
      console.error("Backend API Request Error:", error);
    }
  };

  const clearInputOutput = (()=>{
    setInput("")
    setOutput("")
  })

  useEffect(() => {
    onCodeChange(code);
    socketRef.current?.emit(ACTIONS.CODE_CHANGE, {
      roomId,
      code,
    });
  }, [code]);

  useEffect(() => {
    onInputChange(input);
    socketRef.current?.emit(ACTIONS.INPUT_CHANGE, {
      roomId,
      input,
    });
  }, [input]);

  useEffect(() => {
    onOutputChange(output);
    socketRef.current?.emit(ACTIONS.OUTPUT_CHANGE, {
      roomId,
      output,
    });
  }, [output]);

  useEffect(() => {
    setCode(stubs[lang]);
    onLanguageChange(lang);
    socketRef.current?.emit(ACTIONS.LANGUAGE_CHANGE, {
      roomId,
      language: lang,
    });
  }, [lang]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          setCode(code);
        }
      });

      socketRef.current.on(ACTIONS.INPUT_CHANGE, ({ input }) => {
        if (input !== null) {
          setInput(input);
        }
      });

      socketRef.current.on(ACTIONS.OUTPUT_CHANGE, ({ output }) => {
        if (output !== null) {
          setOutput(output);
        }
      });

      socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, ({ language }) => {
        if (language !== null) {
          setLang(language);
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
      socketRef.current.off(ACTIONS.INPUT_CHANGE);
      socketRef.current.off(ACTIONS.OUTPUT_CHANGE);
    };
  }, [socketRef.current]);

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
          <div style={{ width: "120px", position: "relative" }}>
            <label
              className="visually-hidden text-end"
              htmlFor="inlineFormSelectPref"
            ></label>
            <select
              className="form-select btn dropdown-toggle"
              style={{
                fontSize: "18px",
                color: "#FFF",
                background: "#2D2F34",
                appearance: "none", // Hide default arrow in some browsers
                paddingRight: "15 px", // Add space for a custom arrow
              }}
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
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: "5px",
                transform: "translateY(-50%)",
                width: "0",
                height: "0",
                borderTop: "6px solid #FFF", // Set the color of the arrow
                borderRight: "6px solid transparent",
                borderLeft: "6px solid transparent",
                pointerEvents: "none", // Make sure it doesn't interfere with clicks
              }}
            ></div>
          </div>
          <div>
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
            onChange={setCode}
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
        style={{ width: "30vw" }}
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
            class="btn runBtn btn-outline-light mx-4"
            style={{ width: "70px" }}
            onClick={clearInputOutput}
          >
            Clear
          </button>
        </div>

        <textarea
          type="text"
          id="input"
          className="w-100"
          style={{
            fontSize:"18px",
            resize: "none",
            height: "40vh",
            background: "#1C2130",
            color: "white",
            padding: "10px",
          }}
          aria-label="Last name"
          placeholder="Enter Input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        ></textarea>
        <div className="w-100">
          <textarea
            readOnly
            type="text"
            id="output"
            className="w-100"
            rows={4}
            cols={50}
            style={{
              fontSize:"18px",
              resize: "none",
              height: "40vh",
              background: "#1C2130",
              color: "white",
              padding: "10px",
              borderTop: "1px solid #565656",
            }}
            aria-label="Last name"
            placeholder="Output"
            value={output}
            onChange={(e) => setOutput(e.target.value)}
          ></textarea>
        </div>
      </div>
    </>
  );
};

export default Editor;

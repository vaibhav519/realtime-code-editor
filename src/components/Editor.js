import React, { useState, useEffect, useRef } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/clike/clike";
import "codemirror/mode/python/python";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../Actions";

const Editor = ({
  socketRef,
  roomId,
  onCodeChange,
  onInputChange,
  onOutputChange,
  onLanguageChange,
}) => {
  const editorRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState("Python");
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");

  const handleSubmit = async () => {
    const code = editorRef.current.getValue();

    const dataPayload = {
      selectedLanguage,
      code,
      input,
    };
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

  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: "text/x-python",
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current?.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    }
    init();
  }, []);

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
    onLanguageChange(selectedLanguage);
    socketRef.current?.emit(ACTIONS.LANGUAGE_CHANGE, {
      roomId,
      language: selectedLanguage,
    });
  }, [selectedLanguage]);

  useEffect(() => {
    if (selectedLanguage === "Java") {
      editorRef.current.setOption("mode", "text/x-java");
    } else if (selectedLanguage === "JavaScript") {
      editorRef.current.setOption("mode", "javascript");
    } else if (selectedLanguage === "Cpp") {
      editorRef.current.setOption("mode", "text/x-c++src");
    }
  }, [selectedLanguage]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
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
          setSelectedLanguage(language);
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
      <div className="d-flex justify-content-between rounded p-2 m-1">
        <div className="w-auto">
          <label
            className="visually-hidden"
            htmlFor="inlineFormSelectPref"
          ></label>
          <select
            className="form-select btn dropdown-toggle"
            style={{ background: "#1c1e29", color: "white" }}
            id="inlineFormSelectPref"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
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
            <img
              className="d-flex justify-content-center align-item-center"
              width="20"
              height="20"
              src="https://img.icons8.com/ios-glyphs/30/FFFFFF/play--v1.png"
              alt="play--v1"
            />
          </button>
        </div>
      </div>
      <textarea id="realtimeEditor"></textarea>
      <div className="d-flex rounded bg-dark my-2 py-1">
        <div className="w-50 mx-1">
          <textarea
            type="text"
            id="input"
            className="form-control"
            style={{ height: "25vh", background: "#1c1e29", color: "white" }}
            aria-label="Last name"
            placeholder="Enter Input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          ></textarea>
        </div>
        <div className="w-50 mx-2">
          <textarea
            type="text"
            id="output"
            className="form-control"
            style={{ height: "25vh", background: "#1c1e29", color: "white" }}
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

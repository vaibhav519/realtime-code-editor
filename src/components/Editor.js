import React, { useState, useEffect, useRef } from "react";
import "ace-builds";
import AceEditor from "react-ace";
import "brace/mode/javascript";
import "brace/mode/c_cpp";
import "brace/mode/java";
import "brace/mode/python";
import "brace/theme/dracula";
import "brace/snippets/html";
import "brace/ext/language_tools";
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
    console.log(dataPayload);
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
            value={lang}
            onChange={(e) => {
              const shouldSwitch = window.confirm(
                "Are you sure you want to change language? WARNING: Your current code will be lost."
              );
              if (shouldSwitch) {
                setLang(e.target.value);
              }
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

      <AceEditor
        placeholder="Placeholder Text"
        mode={lang === "Cpp" ? "c_cpp" : lang?.toLowerCase()}
        theme="dracula"
        name="blah2"
        width="100"
        height="62vh"
        fontSize={18}
        showPrintMargin={false}
        showGutter={true}
        highlightActiveLine={false}
        value={code}
        onChange={setCode}
        editorProps={{$blockScrolling: Infinity}}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 4
        }}
      />

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

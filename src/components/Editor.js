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
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const languageRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState("Python");
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
      inputRef.current = document.getElementById("input");
      outputRef.current = document.getElementById("output");
      languageRef.current = document.getElementById("inlineFormSelectPref");

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        console.log(editorRef.current);
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });

      inputRef.current.addEventListener("change", (event) => {
        const input = event.target.value;
        onInputChange(input);
        socketRef.current.emit(ACTIONS.INPUT_CHANGE, {
          roomId,
          input,
        });
      });

      outputRef.current.addEventListener("change", (event) => {
        const output = event.target.value;
        onOutputChange(output);
        socketRef.current.emit(ACTIONS.OUTPUT_CHANGE, {
          roomId,
          output,
        });
      });

      languageRef.current.addEventListener("change", function () {
        const selected = languageRef.current.value;
        setSelectedLanguage(selected);
        onLanguageChange(selected);
        socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
          roomId,
          language: selected,
        });
      });
    }

    init();
  }, []);

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
          console.log("inside", editorRef.current);
          editorRef.current.setValue(code);
        }
      });

      socketRef.current.on(ACTIONS.INPUT_CHANGE, ({ input }) => {
        if (input !== null) {
          inputRef.current.value = input; // Update the input element's value
        }
      });

      socketRef.current.on(ACTIONS.OUTPUT_CHANGE, ({ output }) => {
        if (output !== null) {
          outputRef.current.value = output; // Update the output element's value
        }
      });

      socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, ({ language }) => {
        if (language !== null) {
          languageRef.current.value = language; // Update the language element's value
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
      <div class="d-flex justify-content-between rounded p-2 m-1">
        <div class="w-auto">
          <label class="visually-hidden" for="inlineFormSelectPref"></label>
          <select
            class="form-select btn dropdown-toggle"
            style={{ background: "#1c1e29", color: "white" }}
            id="inlineFormSelectPref"
          >
            <option selected>Python</option>
            <option value="Java">Java</option>
            <option value="Cpp">Cpp</option>
            <option value="JavaScript">JavaScript</option>
          </select>
        </div>
        <div>
          <button type="button" id="run" className="btn runBtn">
            <img
              class="d-flex justify-content-center align-item-center"
              width="20"
              height="20"
              src="https://img.icons8.com/ios-glyphs/30/FFFFFF/play--v1.png"
              alt="play--v1"
            />
          </button>
        </div>
      </div>
      <textarea id="realtimeEditor"></textarea>
      <div class="d-flex rounded bg-dark my-2 py-1">
        <div class="w-50 mx-1">
          <textarea
            type="text"
            id="input"
            class="form-control"
            style={{ height: "25vh", background: "#1c1e29", color: "white" }}
            aria-label="Last name"
            placeholder="Enter Input"
          ></textarea>
        </div>
        <div class="w-50 mx-2">
          <textarea
            type="text"
            id="output"
            class="form-control"
            style={{ height: "25vh", background: "#1c1e29", color: "white" }}
            aria-label="Last name"
            placeholder="Output"
          ></textarea>
        </div>
      </div>
    </>
  );
};

export default Editor;

const express = require("express");
const http = require("http");
const path = require("path");
const axios = require("axios");
const cors = require("cors"); 
const { Server } = require("socket.io");
const ACTIONS = require("./src/Actions");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(cors());

app.post("/run-code", async (req, res) => {
  const { selectedLanguage, code, input } = req.body;

  let language = selectedLanguage.toLowerCase();
  let fileExtension = "";

  switch (selectedLanguage) {
    case "Python":
      fileExtension = "py";
      break;
    case "Java":
      fileExtension = "java";
      break;
    case "JavaScript":
      fileExtension = "js";
      break;
    case "Cpp":
      fileExtension = "cpp";
      break;
  }

  const dataPayload = {
    files: [
      {
        name: `main.${fileExtension}`,
        content: code,
      },
    ],
  };

  if (input !== null && input !== "") {
    dataPayload.stdin = input;
  }
  try {
    const response = await axios.post(
      `https://glot.io/api/run/${language}/latest`,
      dataPayload,
      {
        headers: {
          Authorization: "Token f33c00c3-8161-4315-98a1-5e4b1f871e7c",
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Response from Backend:", response.data);
    if (response.status === 200) {
      const result = response.data;
      res.json(result);
    } else {
      console.error("Glot.io API Request Failed");
      res.status(500).json({ error: "Glot.io API Request Failed" });
    }
  } catch (error) {
    console.error("Glot.io API Request Error:", error);
    res.status(500).json({ error: "Glot.io API Request Error" });
  }
});

app.use(express.static("build"));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const userSocketMap = {};
function getAllConnectedClients(roomId) {
  // Map
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  // code change/sync
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  //input change/sync
  socket.on(ACTIONS.INPUT_CHANGE, ({ roomId, input }) => {
    socket.in(roomId).emit(ACTIONS.INPUT_CHANGE, { input });
  });

  socket.on(ACTIONS.SYNC_INPUT, ({ socketId, input }) => {
    io.to(socketId).emit(ACTIONS.INPUT_CHANGE, { input });
  });

  //output change/sync
  socket.on(ACTIONS.OUTPUT_CHANGE, ({ roomId, output }) => {
    socket.in(roomId).emit(ACTIONS.OUTPUT_CHANGE, { output });
  });

  socket.on(ACTIONS.SYNC_OUTPUT, ({ socketId, output }) => {
    io.to(socketId).emit(ACTIONS.OUTPUT_CHANGE, { output });
  });

  //language change/sync
  socket.on(ACTIONS.LANGUAGE_CHANGE, ({ roomId, language }) => {
    socket.in(roomId).emit(ACTIONS.LANGUAGE_CHANGE, { language });
  });

  socket.on(ACTIONS.SYNC_LANGUAGE, ({ socketId, language }) => {
    io.to(socketId).emit(ACTIONS.LANGUAGE_CHANGE, { language });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

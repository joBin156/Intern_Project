require("dotenv").config();

const express = require("express");
const Sequelize = require("sequelize");
const db_config = require("./config").database;
const bodyParser = require("body-parser");
const cors = require("cors");
const history = require("connect-history-api-fallback");
const cookieParser = require("cookie-parser");
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const port = process.env.PORT || 80;
const server = http.createServer(app);

const wss = new WebSocket.Server({server});

wss.on('error', console.error);

wss.on('connection', function connection(ws){
    console.log("A new client connected");
    ws.send("WS SEND Welcome new client!");

    ws.on('message', function message(status) {
        console.log('received: %s', status);
        ws.send("Got your message its from WS: " + message)
    });
})

const allowedOrigin = ["http://localhost:80", "http://localhost:4200"];

const corsOptions = {
  origin: allowedOrigin,
  methods: "GET,POST,PUT",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());

// app.use(history());

let currentRule = { time: '7:00 AM-5:00 PM' };

// WebSocket setup
wss.on("error", console.error);
wss.on("connection", function connection(ws) {
  console.log("A new client connected");
  ws.send("WS SEND Welcome new client!");

  ws.on("message", function message(status) {
    console.log("Received: %s", status);
    ws.send("Got your message from WS: " + status);
  });
});

// Remove timezone at the end of the creationAt and updateAt
Sequelize.DATE.prototype._stringify = function (date, options) {
  date = this._applyTimezone(date, options);
  // Z here means current timezone, _not_ UTC
  // return date.format('YYYY-MM-DD HH:mm:ss.SSS Z');
  return date.format("YYYY-MM-DD HH:mm:ss.SSS");
};

const sequelize = new Sequelize(
  db_config.database,
  db_config.user,
  db_config.password,
  {
    host: db_config.server,
    dialect: "mssql",
    timezone: db_config.timezone,
    dialectOptions: {
      useUTC: db_config.dialectOptions.useUTC,
    },
  },
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully");
  })
  .catch((err) => {
    console.error("Unable to connect to the db: " + err);
  });

module.exports = sequelize;

// const User = require("./model/account.model");
// const TimeInAndOut = require("./model/time_in_out.model");

// app.get("/test", (req, res) => {
//   User.findAll().then((users) => {
//     res.json(users);
//   });
// });

//Routes
const account_routes = require("./routes/account.routes");
app.use("/", account_routes);

const time_in_out_routes = require("./routes/time_in_time_out");
app.use("/", time_in_out_routes);

const status_route = require("./routes/status.route")(wss);
app.use("/", status_route);

const status_value_route = require("./routes/status_value");
app.use("/", status_value_route);

app.use('/', express.static(path.join(__dirname, 'dist/gsdd-whereabouts')));

app.get("/admin_rules", (req, res) => {
  const data = {
      selectedTimeRule: "7:00 AM-6:00 PM",
      selectedPauseTracking: true,
  };
  res.status(200).json(data);
});

//added for the rules
app.post("/admin_rules", (req, res) => {
  const { selectedTimeRule, selectedPauseTracking } = req.body;

  if (!selectedTimeRule || selectedPauseTracking === undefined) {
      return res.status(400).send({ message: "Invalid request body" });
  }

  // Example: You can process or save these rules to the database
  console.log("Admin Rules Updated:", req.body);

  res.status(200).send({ message: "Admin rules updated successfully!" });
});

app.get('/allowed-time', (req, res) => {
  res.json({ time: '7:00 AM-6:00 PM' });
});

app.post('/allowed-time', (req, res) => {
  const { time, pauseTracking } = req.body;
  console.log('Received payload:', req.body);
  if (!time || pauseTracking === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
  }
  res.json({ success: true, message: 'Time rule configured successfully' });
});

app.post('/employee-timein', (req, res) => {
  const currentTime = new Date();
  const [startTime, endTime] = currentRule.time
    .split('-')
    .map(t => new Date(`1970-01-01T${convertTo24Hour(t.trim())}`));

  if (currentTime >= startTime && currentTime <= endTime) {
    res.status(200).send({ success: true, message: 'Time-in successful' });
  } else {
    res.status(400).send({ success: false, message: `Time-in allowed only between ${currentRule.time}` });
  }
});

function convertTo24Hour(timeStr) {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Static file serving
app.use("/", express.static(path.join(__dirname, "dist/gsdd-whereabouts")));

// Catch-all route for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/gsdd-whereabouts/index.html"));
});

// Server startup
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
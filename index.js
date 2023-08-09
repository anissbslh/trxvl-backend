const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require('multer');
const path = require('path');

const offerRoute = require("./routes/offerRoutes");


var { config } = require("dotenv");
const { Sequelize } = require("sequelize");
const port = process.env.PORT || 4000;

const dev = process.env.NODE_ENV !== "production";
if (dev) {
  config();
}

const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: '*'
}));

// const dbOptions = {
//   host: 'localhost',
//   dialect: 'mysql',
//   logging: false
// };

// const sequelize = new Sequelize(process.env.DB, process.env.USER, process.env.PW, dbOptions);

// sequelize
//   .authenticate()
//   .then(()=>console.log("db connection established"))
//   .catch(err => console.error("unable to connect db :", err))


var connection = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.PORT_DB,
    user: process.env.USER,
    password: process.env.PW,
    database: process.env.DB,
  });
  connection.connect(function (err, conn) {
    if (err) console.log(err);
  });

  const uploadsFolderPath = path.join(__dirname, 'uploads', 'offers');
  app.use('/uploads/offers', express.static(uploadsFolderPath));

  app.get("/",(req,res)=>{
    res.send("Backend");
})

app.use("/", offerRoute(connection));

app.listen(port, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:" + port);
  });
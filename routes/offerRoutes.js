const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mysql = require("mysql");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

module.exports = function (connection) {
    const storageOffer = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, "uploads/offers");
        },
        filename: function (req, file, cb) {
          cb(
            null,
            "car_temp_" +
              Date.now() +
              "-" +
              Math.round(Math.random() * 1e9) +
              path.extname(file.originalname)
          );
        },
    });
      
    const uploadOffer = multer({ storage: storageOffer });

    router.get("/offers", (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;
    
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
    
        connection.query(
          "SELECT * FROM offre LIMIT ?, ?;",
          [startIndex, itemsPerPage],
          (err, result) => {
            if (err) throw err;
    
            connection.query(
              "SELECT COUNT(*) AS totalOffres FROM offre;",
              (err, countResult) => {
                if (err) throw err;
    
                const totalOffres = countResult[0].totalOffres;
    
                const totalPages = Math.ceil(totalOffres / itemsPerPage);
    
                res.send({
                  data: result,
                  currentPage: page,
                  totalPages: totalPages,
                });
              }
            );
          }
        );
    });

    router.post("/offers/add", uploadOffer.single("image"), (req, res) => {
        const { titre, type, description } = req.body;
        const imagePath = req.file.path;
        
        connection.query(
          "INSERT INTO offre (titre, type, description) VALUES (?,?,?)",
          [titre, type, description],
          (err, result) => {
            if (err) {
              console.error(err);
              res.json({
                error: "Erreur",
              });
            } else {
                const ID = result.insertId;
                const Folder = path.join(
                    "uploads",
                    "offers",
                );
                const extension = path.extname(imagePath);
                const newImagePath = path.join(
                  Folder,
                  String(ID) +".png" ,  
                );
                fs.renameSync(imagePath, newImagePath);
                res.json({ success: true });
            }
          }
        );
      });

    router.get("/offers/:id", (req,res) => {
        const ID = req.params.id;
        console.log(ID)
        connection.query(
            "SELECT * FROM offre where id=?",
            [ID],
            (err, result) => {
              if (err) {
                console.error(err);
                res.json({
                  error: "Erreur yooo",
                });
              } else {
                  res.json(result[0]);
              }
            }
          );

    });

    return router;

}

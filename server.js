var express = require("express");
var mongojs = require("mongojs");



//Scraping tools
//Axios is a promise based http library, similar to jQuery's Ajax method
//It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");





var app = express();

// Database configuration
var databaseUrl = "newsyscraper";
var collections = ["scrapedData"];

//Hook mongojs config to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route
app.get("/", function (req, res) {
  res.send("Hello World");
});


// Routes
app.get("/api/all", function(req, res) {
  
  db.scrapedData.find({}, (err, scrapedDataInfo)
  =>{
  if (err) {
    console.log(err);
    res.status(500).end();
  } else {
    res.json(scrapedDataInfo);
  }
 })
})

//A GET route for scraping the echoJS website
app.get("/api/scrape", function(req, res) {
  //First we grab the body of the html with axios
  axios.get("http://www.nypost.com/")
  .then(function(response) {
    //Then we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

     //Save an empty result object
     var results = [];
    
     //Now we grab every div headline within a container, and do the following:
    $("div.headline-container").each(function(i, element) {
     

      //Add the text and href of every link, and save them as properties of the result object
      var article = $(element)
      .find("h3.headline")
      .find("div.entry-content")
      .find("p")
      .text();

      var img = $(element)
        .find("article.story-photo-box")
        .find("img")
        .attr("src");

    //   //Create a new article using the 'result' object built from scraping
    //   db.Article.create(result)
    //     .then(function(dbArticle) {
    //       //View the added result in the console
    //       console.log(dbArticle);
    //     })
    //     .catch(function(err) {
    //       //If an error occurred, send it to the client
    //       return res.json(err);
    //     });
    // });

    //If we were able to successfully scrape and save an Article, send a message to the client
    results.push({article: article, img: img});
  });

  db.scrapedData.insert(results, (err,insertData)=>{
    if (err) {
      console.log(err);
    } else {
      res.json({message: "Scrape complete",status: 200, data: insertData});
    }
  })
}).catch(function(err) {
  console.log(err);
  res.status(500).json(err);
  });
});


// // Route for getting all Articles from the db
// app.get("/articles", function(req, res) {
//   //Grab every document in the Articles collection
//   db.Article.find({})
//     .then(function(dbArticle) {
//       //If we were able to successfully find Articles, send them back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       //If an error occurred, send it to client
//       res.json(err);
//     });
// });

// //Route for grabbing a specific Article by id, populate it with it's note
// app.get("/articles/:id", function(req, res) {
//   //Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
//   db.Article.findOne({ _id: req.params.id })
//     // ..and populate all of the notes associated with it
//     .populate("note")
//     .then(function(dbArticle) {
//       //If we were able to successfully find an Article with the given id, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       //If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// //Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function(req, res) {
//   //Create a new note and pass the req.body to the entry
//   db.Note.create(req.body)
//     .then(function(dbNote) {
//       //If a Note was created successfully, find one Article with an '_id' equal to 'req.params.id'. Update the Article to be associated with the new Note
//       //{ new: true } tells the query that we want it to return the updated User -- it returns the original by default
//       // Since our mongoose query returns a promise, we can chain another '.then' which receives the result of the query
//       return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
//     })
//     .then(function(dbArticle) {
//       //If we were able to successfully update an Article, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       //If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// Start the server
app.listen(3000, function () {
  console.log("App running on port 3000!");
});

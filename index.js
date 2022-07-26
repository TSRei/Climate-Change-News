const port = 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

const newspapers = [
  {
    name: "The Times",
    address: "https://www.thetimes.co.uk/environment/climate-change",
    urlBase: "",
  },
  {
    name: "The Guardian",
    address: "https://www.theguardian.com/environment/climate-crisis",
    urlBase: "",
  },
  {
    name: "Telegraph",
    address: "https://www.telegraph.co.uk/climate-change",
    urlBase: "https://www.telegraph.co.uk",
  },
];

const articles = [];

newspapers.forEach((newspaper) => {
  axios.get(newspaper.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $('a:contains("climate")', html).each(function () {
      const title = $(this)
        .text()
        .replace(/\n/g, "")
        .replace(/\s{2,}/g, " ");
      const url = $(this).attr("href");

      articles.push({
        title,
        url: newspaper.urlBase + url,
        source: newspaper.name,
      });
    });
  });
});

app.get("/", (req, res) => {
  res.json("Welcome to my Climate Change News API");
});

app.get("/news", (req, res) => {
  res.json(articles);
});

app.get("/news/:newspaperId", async (req, res) => {
  const newspaperId = req.params.newspaperId;

  const newspaper = newspapers.filter(
    (newspaper) =>
      newspaper.name.toLocaleLowerCase().replace(/\s/g, "") == newspaperId
  );

  const newspaperAddress = newspaper[0].address;
  const newspaperBase = newspaper[0].urlBase;

  axios
    .get(newspaperAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificArticles = [];

      $('a:contains("climate")', html).each(function () {
        const title = $(this)
          .text()
          .replace(/\n/g, "")
          .replace(/\s{2,}/g, " ");
        const url = $(this).attr("href");
        specificArticles.push({
          title,
          url: newspaperBase + url,
        });
      });
      res.json(specificArticles);
    })
    .catch((err) => console.log(err));
});

app.listen(port, () => console.log(`server running on PORT: ${port}`));

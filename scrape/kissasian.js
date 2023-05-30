const kissasian = require('express').Router();
const cheerio = require("cheerio");
const cors = require("cors");
const e = require('express');
const rs = require("request");
const baseUrl = 'https://ww3.kissasian.ai'

kissasian.post('/kdramaSearch', (req, res ) => {
    const { title } = req.body
    console.log(title)
    let results = [];
    searchUrl = `${baseUrl}/search.html?keyword=${title}`
    rs( searchUrl, (err, resp, html) => {
        if (!err) {
            try {
                const $ = cheerio.load(html)
                $(".item").each( function (index, element) {
                    let title = $(this).children("a").children("span").text().trim();
                    let id = $(this).children("a").attr().href;
                    let img = $(this).children("a").children("div").children("div").children("img").attr().src;

                    results[index] = { title, id, img };
                });
              
                res.status(200).json({ results: results });

            } catch(e) {
                res.status(404).json({ error: 'something went wrong' })
            }
        } else {
            res.json({ error: err })
        }
    })
})

kissasian.post('/kdramaInfo', (req,res) => {
    const { id } = req.body
    url = `${baseUrl}${id}`
    let episode = []
    rs(url, (err, resp, html) => {
        if(!err) {
            try {
                const $ = cheerio.load(html)
                $(".listing").children("li").children("a").each(function(index, element) {
                    let epID = $(this).attr().href;
                    let name = $(this).attr().title;
                    episode[index] = { epID, name }
                })
                res.status(200).json({ episode: episode });
            } catch(e) {
                res.status(404).json({ error: "something went wrong" })
            }
        } else {
            res.json({ error: err })
        }
    })
})

kissasian.post("/kdramaWatch", (req, res) => {
    const { epID } = req.body
    let watch = [];
    url = `${baseUrl}${epID}`
    rs(url, (err, resp, html) => {
        if(!err) {
            try {
                const $ = cheerio.load(html)
                let videoUrl = $(".play-video").children("iframe").attr().src
                let dlPage = "https:"+videoUrl.replace("streaming.php","download")
                console.log(dlPage)
                // go to dl page
                rs(dlPage, (err, resp, html) => {
                    if(!err) {  
                        try {
                            const $ = cheerio.load(html)
                            $("a").each(function(index, element) {
                                if(element.attribs.download === "") {
                                    watch.push({
                                        link: element.attribs.href,
                                        name: $(this).text().replace("Download\n","").trim()
                                    })
                                }
                            })
                            res.json({ watch: watch })

                        } catch(e) {
                            res.status(404).json({ error: err })
                        }
                    } else {
                        res.json({ error: "can't load dlPage" })
                    }
                })

            } catch(e) {
                res.status(404).json({ error: "something went wrong" })
            }
        } else {
            res.json({ error: err })
        }     
    })
})

module.exports = kissasian;
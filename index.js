let express = require('express');
let multer = require('multer');
let axios = require('axios');
let _ = require('lodash');
const upload = multer();
const DEFAULT_PORT = 3000;
let keys = require("./keys");



let app = express();

app.all('/uploads', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get('/', function (req, res) {
    res.send('hello world')
});


app.post('/uploads', upload.single('image'), function (req, res) {

    processImage(req.file.buffer).then((data) => {
        res.send(data)
    }).catch((error)=> {
        res.send("IT is all borken")
    });
});

app.set("port", process.env.PORT || DEFAULT_PORT);

app.listen(app.get("port"));


var mostPopularHashTags = [];

function processImage(image) {
    var subscriptionKey = keys.mKey;

    var uriBase = "https://eastus.api.cognitive.microsoft.com/vision/v1.0/analyze";

    // Request parameters.
    var params = {
        "visualFeatures": "Categories,Description,Color",
        "details": "",
        "language": "en"
    };

    function toArrayBuffer(buf) {
        var ab = new ArrayBuffer(buf.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    }


    console.log("Process Image")
    return axios({
        url: uriBase,
        method: "Post",
        headers: {"Content-Type": "application/octet-stream", "Ocp-Apim-Subscription-Key": subscriptionKey},
        data: toArrayBuffer(image),
        params: params
    }).then((response) => {

        var b = response


        // let promiseArray = response.data.description.tags.map( tag => getHashTagsFromInstagram(tag) );
        // return Promise.all( promiseArray )
        //     .then(
        //         results => {
        //
        //             // console.log(results)
        //
        //             let a = {hashTags: _.flatten(results),
        //             tags: response.data.description.tags};
        //
        //             return a
        //
        //         }
        //     )
        //     .catch(console.log)





        return getHashTagsFromInstagram(response.data.description.tags[0]).then((response) => {

            let a = {hashTags: _.flatten(response),
                tags: b.data.description.tags};

            return a
        }).catch((error) => {
           console.log(error);
           return "Error Error ERROR"
        });


    }).catch((error) => {
        console.log(error.response.data)
        return "failed to find Microsoft";
    })

}



function getHashTagsFromInstagram(hashtag) {

    let uriBase2 = "https://api.instagram.com/v1/tags/search";

    let params = {
        "q": hashtag,
        "access_token": keys.iKey,
        "clientId": keys.iClient
    };


    return axios({
        url: uriBase2,
        method: "get",
        headers: {"Content-Type": "application/javascript"},
        params: params
    }).then((response) => {
        var mostPopularHashTags = [];


        if(response.data.data.length > 0){
           _.sortBy(response.data.data, [function(o) {return o.media_count; }]);

            for(var j = 0; j < 3; j++){
                mostPopularHashTags.push("#" + response.data.data[j].name);

            }


        }

        return mostPopularHashTags;



    }).catch((error) => {
        console.log(error)
        return "Failed Instagram thingy"
    })


}



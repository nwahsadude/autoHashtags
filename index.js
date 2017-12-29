let express = require('express');
let multer = require('multer');
let axios = require('axios');
let _ = require('lodash');
const upload = multer();

let keys = require("./keys");

let app = express();

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



app.listen(3000, () => console.log('Example app listening on port 3000!'));


var mostPopularHashTags = [];

function processImage(image) {
    // **********************************************
    // *** Update or verify the following values. ***
    // **********************************************

    // Replace the subscriptionKey string value with your valid subscription key.
    var subscriptionKey = keys.mKey;

    // Replace or verify the region.
    //
    // You must use the same region in your REST API call as you used to obtain your subscription keys.
    // For example, if you obtained your subscription keys from the westus region, replace
    // "westcentralus" in the URI below with "westus".
    //
    // NOTE: Free trial subscription keys are generated in the westcentralus region, so if you are using
    // a free trial subscription key, you should not need to change this region.
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



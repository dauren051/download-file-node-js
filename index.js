const http = require('http');
const fs = require('fs');
const fetch = require('node-fetch')

function getRemoteFile(file, url) {
    let localFile = fs.createWriteStream(file);
    const request = http.get(url, function(response) {
        var len = parseInt(response.headers['content-length'], 10);
        var cur = 0;
        var total = len / 1048576; //1048576 - bytes in 1 Megabyte


        response.on('end', function() {
            console.log("Download complete " + "size " + total.toFixed(2) + " MB" + " name " + file );
        });

        response.pipe(localFile);
    });
}

function showProgress(file, cur, len, total) {
    console.log("Downloading " + file + " - " + (100.0 * cur / len).toFixed(2) 
        + "% (" + (cur / 1048576).toFixed(2) + " MB) of total size: " 
        + total.toFixed(2) + " MB");
}

async function readTextFile(file)
{
    let etext
    const resp = await fetch(file)
        .then(response => response.text())
        .then(text => etext = text);
    return etext
}


function linkify(text) {
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    let arr = []
    text.replace(urlRegex, function(url) {
        let obj = {
            file: url.replace('http://aloteq-test-tasks.s3-website.eu-central-1.amazonaws.com/',''),
            url: url
        }
        arr.push(obj)
        return obj
    });
    return arr
}

const fileWithUrls = {
    file: "urls.txt",
    url: "http://aloteq-test-tasks.s3-website.eu-central-1.amazonaws.com/list.txt"
}

async function getUrls(){
    let RawText = await readTextFile(fileWithUrls.url)
    let links = linkify(RawText)
    console.log(links)
    links.forEach(function(item) {
        getRemoteFile(item.file, item.url);
    })

}

getUrls()
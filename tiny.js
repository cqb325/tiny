/**
 * Created by cqb32_000 on 2015/8/21.
 */

var fs = require("fs");
var https = require("https");
var path = require('path');
var spawn = require('child_process').spawn;
var cwd = process.cwd();
var key = "pob73k2-9l3YzL3Ldop8Whm6B8jyOfLB";

fs.readdir(cwd, function(err, files){
    if(files && files.length){
        var fobj = new Files(files);

        if(!fs.existsSync(__dirname + "/mini")) {
            fs.mkdirSync("mini");
        }
        _compress(fobj);
    }
});

function _compress(files){
    if(files.hasNext()){
        var file = files.next();

        var info = fs.statSync(file);
        if(info.isDirectory()){
            _compress(files);
            return;
        }

        var ext = path.extname(file).toLowerCase();
        if(ext == ".png" || ext == ".jpg" || ext == ".jpeg") {

            console.log("compressing file "+file);
            var input = fs.createReadStream(file);
            var output = fs.createWriteStream("mini/" + file);

            var options = require("url").parse("https://api.tinify.com/shrink");
            options.auth = "api:" + key;
            options.method = "POST";

            var request = https.request(options, function (response) {
                if (response.statusCode === 201) {
                    https.get(response.headers.location, function (response) {
                        response.pipe(output);
                        _compress(files);
                    });
                } else {
                    /* Something went wrong! You can parse the JSON body for details. */
                    console.log("Compression failed");
                    _compress(files);
                }
            });

            input.pipe(request);
        }else{
            _compress(files);
        }
    }else{
        console.log("finished...");
    }
}


var Files = function(arr){
    this.data = arr;
};

Files.prototype = {
    length: -1,

    hasNext: function(){
        if(this.data.length && this.length < this.data.length - 1){
            return true;
        }else{
            return false;
        }
    },

    next: function(){
        if(this.hasNext()){
            this.length ++;
            return this.data[this.length];
        }else{
            return null;
        }
    }
};
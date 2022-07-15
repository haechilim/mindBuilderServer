const http = require('http');
const url = require('url');
const fs = require('fs');
const mime = require('mime');
const DatabaseManager = require('./manager/databaseManager');
const ApiManager = require('./manager/apiManager');

class Server {
    constructor() {
        this.databaseManager = new DatabaseManager();
        this.apiManager = new ApiManager();
        
        this.databaseManager.connect();
    }

    createServer() {
        http.createServer((request, response) => {
            console.log(request.url);

            let pathname = this.getPathname(request.url);
            let parameters = this.getParameters(request.url);
            
            if(request.method == "POST") {
                let post = "";

                request.on("data", (data) => post += data);
                request.on("end", () => {
                    if(pathname == "/upload/image") {
                        let random = "";

                        while(true) {
                            random = Math.random().toString(36).substr(2,11);

                            if (!fs.existsSync(random)) break;
                        }

                        let buf = Buffer.from(decodeURIComponent(post),'base64');
                        fs.writeFileSync("image/" + random + ".jpg", buf);

                        this.jsonResponse(response, {
                            path: "/image/" + random + ".jpg"
                        });
                    }

                    this.processUrl(pathname, this.getParameters("?" + post), response);
                });
            }
            else this.processUrl(pathname, parameters, response);

        }).listen(9000);

        console.log("server start!");
    }

    processUrl(pathname, data, response) {
        switch(pathname) {
            case "/api/user/add":
                this.databaseManager.userAdd(decodeURIComponent(data.name), decodeURIComponent(data.email), (error) => this.response(response, error));
                break;

            default:
                this.fileResponse(response, pathname);
                break;
        }
    }

    setDate(results) {
        if(results != undefined) {
            for(let i = 0; i < results.length; i++) {
                let result = results[i];
                
                result.date = new Date(result.date).getTime();
            }
        }

        return results;
    }

    response(response, error, result) {
        if(result == undefined) result = {success: (error ? false : true)};
        this.jsonResponse(response, error ? [] : result);
    }

    jsonResponse(response, data) {
        console.log(data);
        if(data != undefined) {
            response.writeHead(200, {"content-type": "application/json; charset=utf-8"});
            response.end(JSON.stringify(data));
        }
    }

    fileResponse(response, pathname) {
        response.writeHead(200, {'Content-Type': mime.getType(pathname)});

        fs.readFile("./" + pathname, (err, data) => {
            if (err) {
                console.log(err);

                response.writeHead(404);
                response.end(data);
            }
            else if(mime.getType(pathname).split('/')[0] == "text") response.end(data, 'utf-8');
            else response.end(data);
        });
    }

    getPathname(requestUrl) {
        return url.parse(requestUrl).pathname;
    }

    getParameters(requestUrl) {
        let result = {};
        let part = parameterPart();
        let parameters = part.split("&");
        
        for(let i = 0; i < parameters.length; i++) {
            let tokens = parameters[i].split("=");
            
            if(tokens.length < 2) continue;
            
            result[tokens[0]] = tokens[1];
        }
        
        return result;
        
        function parameterPart() {
            let tokens = requestUrl.split("?");
            
            return tokens.length > 1 ? tokens[1] : "";
        }
    }
}

module.exports = Server;
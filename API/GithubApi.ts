import http, { IncomingMessage, ServerResponse } from "http"
import axios from "axios"
import path from "path";
import fs from "fs"

const port: number = 7000;

interface IMessage {
    message: string,
    success: boolean,
    data: null | {} |{}[]
}

const server = http.createServer((req:IncomingMessage, res:ServerResponse<IncomingMessage>) =>{
    res.setHeader("Content-Type", "Application/JSON");

    let {method, url} = req;

    let status = 404;

    let response: IMessage = {
        message: "Failed",
        success: false,
        data: null,
    };

    if(method === "POST" && url === "/getgithubuserdetails") {
        let requestBody = "";

        req.on("data", (chunk) => {
            requestBody += chunk;
        }).on("end", async() => {
            let requestData = JSON.parse(requestBody);

            const {username} = requestData;

            if(!username || !requestData) {
                status = 400;

                (response.message = "No request Data"),
                (response.success = false),
                (response.data = null);

                res.write(JSON.stringify({status, response}));
                res.end();
            }

            const githubendpoint = await axios.get(`https://api.github.com/users/${username}`
            );
            
            if(githubendpoint.status) {
                const userdetails = githubendpoint.data;

                const useravatar = userdetails.avatar_url;
                const avatarfilename = `${username}_avatar.jpg`;

                const avatarfolder = path.join(__dirname, "../Github_Avatars", avatarfilename);

                const getavatarurl = await axios.get(useravatar,{
                    responseType: "stream",
                });

                getavatarurl.data.pipe(fs.createWriteStream(avatarfolder));

                status = 200;

                (response.message = `${userdetails?.name?. username} Github Details gotten`),
                (response.success = true),
                (response.data = userdetails)

                res.write(JSON.stringify ({status, response}));

                res.end();
            } else {
                status = 404;

                
                (response.message = "User not found"),
                (response.success = false),
                (response.data = null),

                res.write(JSON.stringify ({status, response}));

                res.end();
            } 
        });


    }else {

                (response.message = "Check your Routes"),
                (response.success = false),
                (response.data = null);
        
              res.write(JSON.stringify({ status, response }));
              res.end();

            }
    
})
server.listen(port, () => {
    console.log(port, "Server is up and running in port");
})
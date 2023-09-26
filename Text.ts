import axios from "axios";
import http, { IncomingMessage, ServerResponse } from "http";
import path from "path";
import fs, { existsSync } from "fs";
import { error } from "console";

interface iMessage {
  message: string;
  success: boolean;
  data: null | {}[] | [] | {};
}

const port: number = 3000;

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
    res.setHeader("content-type", "Application/JSON");

    let response: iMessage = {
      message: "Failed to get request made",
      success: false,
      data: null,
    };
    let status = 404;
    let holder = "";

    req
      .on("data", (chunk) => {
        holder += chunk;
      })
      .on("end", async () => {
        const { method, url } = req;

        //All titles should be saved in a .txt file
        if (method === "GET" && url === "/getTitles") {
          const fakeStoreApi = await axios.get(
            "http://fakestoreapi.com/products"
          );
          if (fakeStoreApi.status) {
            const fakeStoreDataTitle = fakeStoreApi.data.map((el) => el.title);
            const TitleFolder = path.join(__dirname, "Titles");

            if (!fs.existsSync) {
              fs.mkdir(TitleFolder, (error) => error);
            }

            fs.writeFile(
              path.join(__dirname, "Titles", "Titles.txt"),
              fakeStoreDataTitle
                .toString()
                .split(",")
                .flatMap((el) => "\n" + el)
                .toString(),
              (error) => {
                console.log(error);
              }
            );

            response.message = "Successful";
            response.success = true;
            response.data = fakeStoreDataTitle;
            status = 200;
            res.write(JSON.stringify({ status, response }));
            res.end();
          } else {
            res.write(JSON.stringify({ response, status }));
            res.end();
          }
        } else {
          res.write(JSON.stringify({ response, status }));
          res.end;
        }
      });
  }
);

server.listen(port, () => {
  console.log("Server active");
});
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

        if (method === "GET") {
          const iniUrl = url?.split("/")[1];
          const urlForUse = iniUrl?.toString();

          const fakeStore = await axios.get("http://fakestoreapi.com/products");

          const fakeStoreData = fakeStore.data;

          let check = fakeStoreData.some((el) => el.category === urlForUse);
          if (check === true) {
            const Category = fakeStoreData.filter(
              (el) => el.category === urlForUse
            );

            response.success = true;
            response.data = Category;
            response.message = "Category needed gotten";
            res.write(JSON.stringify({ response, status }));
            res.end();
          } else {
            res.write(JSON.stringify({ response, status }));
            res.end();
          }
        }
      });
  }
);

server.listen(port, () => {
  console.log("Server active");
});
import express from "express";
import graphqlHTTP from "express-graphql";
import { MongoClient } from "mongodb";
import schema from "./schema";

const MONGO_URL = "mongodb://localhost:27017/graphql-news";

const start = async () => {
  const app = express();
  await MongoClient.connect(MONGO_URL, { promiseLibrary: Promise })
    .catch(err => console.error(err.stack))
    .then(client => {
      const res = client.db("graphql-news");
      const db = {
        Links: res.collection("Links"),
        Users: res.collection("Users"),
        Comments: res.collection("Comments")
      };
      const buildOptions = {
        context: { db },
        schema,
        graphiql: true
      };
      app.use("/graphql", graphqlHTTP(buildOptions));
      app.listen(4000, () =>
        console.log(`Running a GraphQl API server at localhost:4000/graphql`)
      );
    });
};

start();

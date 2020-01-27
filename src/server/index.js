import express from 'express';
import graphqlHTTP from 'express-graphql';
import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLScalarType,
  GraphQLInputObjectType,
} from 'graphql';
import { find } from 'lodash';
// import { graphql } from 'graphql';
// import schema from './schema';

const app = express();

const links = [
  { id: 0, author: 0, url: 'https://google.com', description: 'Google' },
  { id: 1, author: 1, url: 'https://github.com', description: 'GitHub' },
];

const users = [
  { id: 0, username: 'user1', about: 'The first user' },
  { id: 1, username: 'user2', about: 'The second user' },
];

const commentsList = [
  { id: 0, parent: 0, author: 0, content: 'Comment 1' },
  { id: 1, parent: 0, author: 1, content: 'Comment 2' },
  { id: 2, parent: 1, author: 0, content: 'Comment 3' },
  { id: 3, parent: 0, author: 2, content: 'Comment 4' },
  { id: 4, parent: 1, author: 2, content: 'Comment 5' },
];

function getComments(commentID) {
  const comments = commentsList.filter(comment => comment.parent === commentID);
  if (comments.length > 0) return comments;
  return null;
}

const userType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLInt },
    usename: { type: GraphQLString },
    about: { type: GraphQLString },
  },
});

const commentsType = new GraphQLInputObjectType({
  name: 'Comments',
  fields: {
    id: { type: GraphQLInt },
    parent: { type: commentType },
    comments: {
      type: new GraphQLList(commentsType),
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (_, { id }) => getComments(id),
    },
    author: { type: userType },
    args: {},
  },
});

app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));

app.listen(4000, () => console.log('server up and running on port 4000'));

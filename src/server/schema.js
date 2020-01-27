import {
  GraphQLInt,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList
} from "graphql";
import { ObjectId } from "mongodb";


const userType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    _id: { type: GraphQLID },
    usename: { type: GraphQLString },
    about: { type: GraphQLString }
  })
});

const commentsType = new GraphQLObjectType({
  name: "Comments",
  fields: () => ({
    _id: { type: GraphQLNonNull(GraphQLID) },
    link: {
        type: linkType,
        resolve: async({link}, data, {db: {Links}}) => await Links.findOne(ObjectId(link)),
    },  
    parent: { type: commentsType, resolve: async ({parent}, data, {db: {Comments}}) => 
        await Comments.findOne(ObjectId(parent)),

    },
    comments: {
      type: new GraphQLList(commentsType),
      args: {
        _id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve: async ({ _id }, data, {db: {Comments}}) => {
          const comments = await Comments.find({}).toArray(),
        },
    author: {
      type: userType,
      args: {
        author: { type: GraphQLID }
      },
      resolve: (_, { author }) => find(users, { _id: author }),
    },
    content: { type: GraphQLString }
  })
});

const linkType = new GraphQLObjectType({
  name: "Link",
  fields: () => ({
    _id: { type: GraphQLNonNull(GraphQLID) },
    url: { type: GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    author: {
      type: GraphQLNonNull(userType),
      args: {
        author: { type: GraphQLNonNull(GraphQLID) }
      },
      resolve: (_, { author }, { db: {Users} }) => await Users.findOne(ObjectId(author)),
    },
    comments: {
      type: new GraphQLList(commentsType),
      resolve: ({_id}, data,   { db: {Comments} }) =>
      await Comments.find({parent: ObjectId(_id)}).toArray(),
    },
    score: { type: GraphQLNonNull(GraphQLID) }
  })
});

const queryType = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    allLinks: {
      type: new GraphQLList(linkType),
      resolve: async (_, data, {db: {Links}}) => await Links.find({}).toArray(),   
    },
    link: {
      type: linkType,
      args: {
        _id: { type: GraphQLID }
      },
      resolve: async ({_id}, data, {db: {Links}}) => await Links.findOne(ObjectId(_id)),   
    },
    allUsers: {
      type: new GraphQLList(userType),
      resolve: async (_, data, {db: {Users}}) => await Users.find({}).toArray(),   
    },
    user: {
      type: userType,
      args: {
        _id: { type: GraphQLID }
      },
      resolve: (_, { _id }) => find(users, { _id })
    }
  })
});

const mutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    createLink: {
        type: linkType,
        args: {
            url: {type: GraphQLString},
            description: {type: GraphQLString},
        },
        resolve: async (_, data, {db: {Links} }) => {
            const link= Object.assign(
                {
                    score: 0,
                    comments: [],
                },
                data
            );
            const res = await Links.insert(link);
            return Object.assign({_id: res.insertedIds[0]}, data);
        },
    },
    upvoteLink: {
      type: linkType,
      args: {
        _id: { type: GraphQLNonNull(GraphQLID) }
      },
      resolve: async (_, {_id}, {db: {Links}}) => {
          await Links.update({_id: ObjectId(_id)}, {$inc: {score: 1}});
          return Links.findOne(ObjectId(_id)),
      },
    },
    downvoteLink: {
      type: linkType,
      args: {
        _id: { type: GraphQLNonNull(GraphQLID) }
      },
      resolve: async (_, {_id}, {db: {Links}}) => {
        await Links.update({_id: ObjectId(_id)}, {$inc: {score: -1}});
        return Links.findOne(ObjectId(_id)),
    },
    },
  }),
});
const schema = new GraphQLSchema({ query: queryType, mutation: mutationType });
export default schema;

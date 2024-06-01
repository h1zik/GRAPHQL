const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { initDB } = require('./db/database');
const resolvers = require('./resolvers');

const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Post {
    id: ID!
    title: String!
    description: String!
    user: User!
  }

  type Query {
    users: [User]
    posts: [Post]
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): User
    loginUser(email: String!, password: String!): String
    createPost(title: String!, description: String!): Post
    updatePost(id: ID!, title: String, description: String): Post
    deletePost(id: ID!): Post
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
app.use(express.json());

app.use('/graphql', (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7, authHeader.length) : authHeader;
  req.token = token;
  next();
}, graphqlHTTP((req) => ({
  schema,
  context: { token: req.token },
  graphiql: true
})));

initDB().then(() => {
  app.listen(4000, () => {
    console.log('Server is running on http://localhost:4000/graphql');
  });
});

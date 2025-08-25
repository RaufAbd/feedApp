const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        email: String!
        password: String!
        name: String!
        status: String!
        posts: [Post!]!
    }

    input UserInputData {
        email: String!
        password: String!
        name: String!
    }

    type RootMutation {
       createUser(inputData: UserInputData): User!
    }

    type RootQuery {
        hello: String!
    }
    
    schema {
        query: RootQuery
        mutation: RootMutation    
    }`);

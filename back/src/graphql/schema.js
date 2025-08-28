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

    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }  
        
    type PostsData {
        posts: [Post!]!
        totalItems: Int!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type RootMutation {
       createUser(inputData: UserInputData): User!
       createPost(postInput: PostInputData): Post!
       updatePost(id: ID!, postInput: PostInputData!): Post!
       deletePost(id: ID!): Boolean!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        posts(page: Int!): PostsData!
        post(id: ID!): Post!
    }
    
    schema {
        query: RootQuery
        mutation: RootMutation    
    }`);

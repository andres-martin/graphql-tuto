const schema = `
    type Link {
        id: String!
        author: User!
        url: String
        description: String
    }

    type User {
        id: String!
        created: Int!
        firstName: String
        lastName: String
    }
`;
export default schema;

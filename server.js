var express = require("express")
var { createHandler } = require("graphql-http/lib/use/express")
var { buildSchema } = require("graphql")
var { ruruHTML } = require("ruru/server")
 
// Serve the GraphiQL IDE.

 
// Construct a schema, using GraphQL schema language
var schema = buildSchema(/* GraphQL */`
  input UserInput {
    nombre: String
    direccion: String
  }
 
  type User {
    id: ID!
    nombre: String
    direccion: String
  }
 
  type Query {
    getUser(id: ID!): User
    getUsers: [User]
  }
 
  type Mutation {
    createUser(input: UserInput): User
    updateUser(id: ID!, input: UserInput): User
  }
`)
 
// This class implements the RandomDie GraphQL type
class User {
    constructor(id, { nombre, direccion }) {
      this.id = id
      this.nombre = nombre
      this.direccion = direccion
    }
  }
 
fakeDatabase = {
    "1":{
        "nombre": "Roberto",
        "direccion": "12321"
    },
    "2":{
        "nombre": "Rogelio",
        "direccion": "1245"
    },
    "3":{
        "nombre": "Sanpancracio",
        "direccion": "1234"
    }
}
// The root provides a resolver function for each API endpoint
var root = {
    getUser({ id }) {
      if (!fakeDatabase[id]) {
        throw new Error("no message exists with id " + id)
      }
      return new User(id, fakeDatabase[id])
    },
    getUsers() {
        if (!fakeDatabase) {
          throw new Error("no Messages")
        }

        return Object.keys(fakeDatabase).map(elemento =>{
            return new User(elemento, fakeDatabase[elemento])
        })
      },
    createUser({ input }) {
      // Create a random id for our "database".
      var id = require("crypto").randomBytes(10).toString("hex")
   
      fakeDatabase[id] = input
      return new User(id, input)
    },
    updateUser({ id, input }) {
      if (!fakeDatabase[id]) {
        throw new Error("no message exists with id " + id)
      }
      // This replaces all old data, but some apps might want partial update.
      fakeDatabase[id] = input
      return new User(id, input)
    },
  }
 
var app = express()

app.get("/", (_req, res) => {
    res.type("html")
    res.end(ruruHTML({ endpoint: "/graphql" }))
  })

// Create and use the GraphQL handler.
app.all(
  "/graphql",
  createHandler({
    schema: schema,
    rootValue: root,
  })
)
 
// Start the server at port
app.listen(4000)
console.log("Running a GraphQL API server at http://localhost:4000/graphql")
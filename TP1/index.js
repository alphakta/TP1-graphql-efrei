import express from 'express'
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';

let eleves = [
    {
        id: 1,
        nom: 'n1',
        prenom: 'p1'
    },
    {
        id: 2,
        nom: 'n2',
        prenom: 'p2'
    },
    {
        id: 3,
        nom: 'n3',
        prenom: 'p3'
    },
]

var schema = buildSchema(`
    type Eleve {
        id: Int!
        nom: String
        prenom: String
    }

  type Query {
    eleves: [Eleve]
  }

  type Mutation {
    addEleve (nom: String , prenom: String) : Eleve
    updateEleve (id: Int, updateEleve: updateEleve) : Eleve
    deleteEleve (id: Int) : Boolean
  }

  input updateEleve {
    nom: String
    prenom: String
}

`)

var root = {
    eleves: () => {
        return eleves
    },
    addEleve: ({ nom, prenom }) => {
        const idEleve = eleves.length+1;
        eleves.push({
            idEleve, nom, prenom
        })
        return { idEleve, nom, prenom }
    },
    updateEleve: ({ id, updateEleve }) => {
        const index = eleves.findIndex((e) => e.id === id)
        if (index !== -1) {
            eleves[index] = { ...eleves[index], ...updateEleve }
            return eleves[index]
        }
        return null
    },
    deleteEleve: ({ id }) => {
        const index = eleves.findIndex((e) => e.id === id)
        if (index !== -1) {
            eleves.splice(index, 1)
            return true
        }
        return false
    }
}

var app = express()
app.use(
    "/graphql",
    graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true,
    })
)

app.listen(4000, () => {
    console.log("Running a GraphQL API server at http://localhost:4000/graphql")
})

import express from 'express'
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

var schema = buildSchema(`
    type Editors {
        idEditors: ID!
        nameEditors: String!
        games: [Games]
    }

    type Games {
        idGames: ID!
        nameGames: String!
        idEditors: Int
        editors: Editors
        stock: [Stock]
    }

    type Stores {
        idStores: ID!
        nameStores: String!
        stock: Stock
    }

    type Stock {
        idStock: ID!
        idGames: Int
        idStores: Int
        units: Int
        prices: Float
        stores: Stores
        games: Games
    }

    type Query {
        "Récupére les valeurs contenus dans la table Games"
        getGames : [Games]

        "Récupére les valeurs contenus dans la table Editors"
        getEditors : [Editors]

        "Récupére les valeurs contenus dans la table Stores"
        getStores : [Stores]

        "Récupére les valeurs contenus dans la table Stock"
        getStock : [Stock]
    }
    
    input EditorsInput {
        nameEditors: String!
    }

    input GamesInput {
        nameGames: String!
    }

    input StockInput{
        units: Int
        prices: Float
    }

    input StoresInput {
        nameStores: String!
    }

    type Mutation {
        addEditors( value: EditorsInput ) : [Editors]
        addGames( value: GamesInput) : [Games]
        addStock(value: StockInput) : [Stock]
        addStores(value: StoresInput) : [Stores]
    }
`);

var root = {
    /**
     * Read - Lecture 
     */
    getGames: async () => {
        return await prisma.games.findMany({
            include: {
                editors: true
            }
        })
    },
    getEditors: async () => {
        return await prisma.editors.findMany({
            include: {
                games: true
            }
        })
    },
    getStores: async () => {
        return await prisma.stores.findMany({
        })
    },
    getStock: async () => {
        return await prisma.stock.findMany({
            // include: {
            //     stores: true
            // }
        })
    },
    /**
     * Create - Création 
     */
    addGames: async({value}) => {
        await prisma.games.create({
            data: value
        })

        return await prisma.games.findMany({
            include: {
                editors: true
            }
        })
    },
    addEditors: async ({ value }) => {
        await prisma.editors.create({
            data: value
        })

        return await prisma.editors.findMany({
            include: {
                games: true
            }
        })
    },
    addStock: async({value}) => {
        await prisma.stock.create({
            data: value
        })

        return await prisma.stock.findMany()
    },
    addStores: async({value}) => {
        await prisma.stores.create({
            data: value
        })

        return await prisma.stores.findMany()
    },
    /**
     * Update - Modification 
     */

}

const resolvers = {
    Query: {
      games: async () => {
        return prisma.games.findMany({
          include: {
            editors: true,
            stock: true,
          },
        })
      },
    }}

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

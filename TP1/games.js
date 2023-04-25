import express from 'express'
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const schema = buildSchema(`
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
        idEditors: Int
    }

    input StockInput{
        idGames: Int
        idStores: Int
        units: Int
        prices: Float
    }

    input StoresInput {
        nameStores: String!
    }

    type Mutation {
        "Ajoute une données dans la table Editor"
        addEditors(value: EditorsInput ) : [Editors]

        "Ajoute une données dans la table Games"
        addGames(value: GamesInput) : [Games]

        "Ajoute une données dans la table Stock"
        addStock(value: StockInput) : [Stock]

        "Ajoute une données dans la table Stores"
        addStores(value: StoresInput) : [Stores]

        "Supprime une donnée dans la table Editor"
        deleteEditor(id: Int) : [Editors]

        "Supprime une donnée dans la table Games"
        deleteGames(id: Int) : [Games]

        "Supprime une donnée dans la table Stock"
        deleteStock(id: Int) : [Stock]

        "Supprime une donnée dans la table Stores"
        deleteStores(id: Int) : [Stores]

        "Update une donnée dans la table Games"
        updateGames(id: Int, value: GamesInput): [Games]
    }
`);

const resolvers = {
    /**
     * Read - Lecture
     */
    getGames: async () => {
        return await prisma.games.findMany({
            include: {
                editors: true,
                stock: true
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
        return await prisma.stores.findMany({})
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
    addGames: async ({ value }) => {
        const { idEditors } = await prisma.editors.findUnique({
            where: {
                idEditors: value.idEditors
            },
            select: {
                idEditors: true
            }
        });

        if (idEditors) { await prisma.games.create({ data: value }); }

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
    addStock: async ({ value }) => {
        const { idGames } = await prisma.games.findUnique({
            where: {
                idGames: value.idGames
            },
            select: {
                idGames: true
            }
        });

        const { idStores } = await prisma.stores.findUnique({
            where: {
                idStores: value.idStores
            },
            select: {
                idStores: true
            }
        });

        if (idGames && idStores) {
            await prisma.stock.create({
                data: value
            })
        }

        return await prisma.stock.findMany({
            include: {
                games: true,
                stores: false
            }
        })
    },
    addStores: async ({ value }) => {
        await prisma.stores.create({
            data: value
        })

        return await prisma.stores.findMany()
    },

    /**
     * Update - Modification 
     */
    updateGames: async ({ id, value }) => {
        let gameUpdate;
        const { idEditors } = await prisma.editors.findUnique({
            where: {
                idEditors: value.idEditors
            },
            select: {
                idEditors: true
            }
        });

        if (idEditors) {
            gameUpdate = await prisma.games.update({
                where: {
                    idGames: id
                },
                data: value
            })
        }

        return gameUpdate
    },

    /**
     * Delete - Suppression
     */
    deleteGames: async ({ id }) => {
        const deleteGames = await prisma.games.delete({
            where: {
                idGames: id
            }
        })

        return await prisma.games.findMany({
            include: {
                editors: true,
                stock: true
            }
        })
    },
    deleteEditor: async ({ id }) => {
        const deleteEditor = await prisma.editors.delete({
            where: {
                idEditors: id
            }
        })
        return await prisma.editors.findMany({})
    },
    deleteStock: async ({ id }) => {
        const deleteStock = await prisma.stock.delete({
            where: {
                idStock: id
            }
        })

        return await prisma.stock.findMany({})
    },
    deleteStores: async ({ id }) => {
        const deleteStores = await prisma.stores.delete({
            where: {
                idStores: id
            }
        })

        return await prisma.stores.findMany({})
    }
}

var app = express()
app.use(
    "/graphql",
    graphqlHTTP({
        schema: schema,
        rootValue: resolvers,
        graphiql: true,
    })
)

app.listen(4000, () => {
    console.log("Running a GraphQL API server at http://localhost:4000/graphql")
})

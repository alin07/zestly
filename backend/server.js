import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./types";
import { resolvers } from "./resolvers";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== "production",
});

async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
      // TODO: Add authentication context here
      // For now, return empty context
      return {
        user: null, // TODO: Add authentication context here
      };
    },
  });

  console.log(`🚀 Server ready at: ${url}`);
  console.log(`📊 GraphQL Playground available in development mode`);
}

startServer().catch((error) => {
  console.error("Error starting server:", error);
});

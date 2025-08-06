import React from "react";
import { ApolloProvider } from "@apollo/client";
import client from "./lib/apollo-client";
import HomePage from "./components/HomePage";
import "./App.css";

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <HomePage />
      </div>
    </ApolloProvider>
  );
}

export default App;

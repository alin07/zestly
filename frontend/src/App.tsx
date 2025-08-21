import React from "react";
import { ApolloProvider } from "@apollo/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import client from "./lib/apollo-client";
import HomePage from "./components/HomePage";
import ListingsPage from "./components/ListingsPage";
import ListingDetailPage from "./components/ListingDetailPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import AgentLoginPage from "./components/AgentLoginPage";
import AgentRegisterPage from "./components/AgentRegisterPage";
import Dashboard from "./components/Dashboard";
import CreateListingPage from "./components/CreateListingPage";
import EditListingPage from "./components/EditListingPage";
import Layout from "./components/Layout";
import AuthProvider from "./contexts/AuthContext";
import "./App.css";

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/listings" element={<ListingsPage />} />
              <Route path="/listing/:id" element={<ListingDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/agent/login" element={<AgentLoginPage />} />
              <Route path="/agent/register" element={<AgentRegisterPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/listings/create" element={<CreateListingPage />} />
              <Route path="/listings/edit/:id" element={<EditListingPage />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;

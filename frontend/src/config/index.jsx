//for creating instance

// Example: create an axios instance (customize as needed)
const { default: axios} = require("axios")

export const BASE_URL = "http://localhost:9000"

export const clientServer = axios.create({
  baseURL: "http://localhost:9000", // replace with your API base URL
});

// Server-side client for SSR (getServerSideProps) inside Docker
// Falls back to localhost:9000 for local dev without Docker
export const serverClient = axios.create({
  baseURL: process.env.INTERNAL_API_URL || "http://localhost:9000",
});
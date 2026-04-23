const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

async function connectNeo4j() {
  try {
    await driver.verifyConnectivity();
    console.log("Neo4j conectado");
  } catch (error) {
    console.error("Error conectando Neo4j:", error.message);
  }
}

module.exports = { driver, connectNeo4j };
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(process.env.NEO4J_USERNAME || 'neo4j', process.env.NEO4J_PASSWORD || 'test1234')
);

async function connectNeo4j() {
  try {
    await driver.verifyConnectivity();
    console.log('Neo4j conectado');
    return true;
  } catch (error) {
    console.error('Error conectando Neo4j:', error.message);
    return false;
  }
}

async function closeNeo4j() {
  try {
    await driver.close();
    console.log('Neo4j desconectado');
  } catch (error) {
    console.error('Error cerrando Neo4j:', error.message);
  }
}

module.exports = {
  driver,
  connectNeo4j,
  closeNeo4j,
};
const { DocumentStore } = require("ravendb");

const store = new DocumentStore(
  process.env.RAVEN_URL,
  process.env.RAVEN_DATABASE
);

function connectRaven() {
  try {
    store.initialize();
    console.log("RavenDB conectado");
  } catch (error) {
    console.error("Error conectando RavenDB:", error.message);
  }
}

module.exports = { store, connectRaven };
const { DocumentStore } = require('ravendb');

let store = null;

function connectRaven() {
  try {
    store = new DocumentStore(
      process.env.RAVEN_URL,
      process.env.RAVEN_DATABASE
    );

    store.conventions.findCollectionNameForObjectLiteral = (entity) =>
      entity?.collection || null;

    store.initialize();
    console.log('RavenDB conectado');
    return true;
  } catch (error) {
    console.error('Error conectando RavenDB:', error.message);
    return false;
  }
}

function getStore() {
  if (!store) {
    throw new Error('RavenDB no ha sido inicializado');
  }
  return store;
}

module.exports = {
  connectRaven,
  getStore,
};

let ioInstance = null;

function initSocket(io) {
  ioInstance = io;
}

function getSocket() {
  return ioInstance;
}

module.exports = {
  initSocket,
  getSocket,
};

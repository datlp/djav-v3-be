const { deleteFileUpdateVideo } = require('../services/file.service');

const getLinkUseSocket = (socket) => {
  socket.on('fshare get link message', (msg) => {
    console.log('🚀 ~ socket.on ~ msg:', msg);
    // Redis cache code đã get, expire 24h
    // key    IP:fshare:XXCDĐFV
    // value  "{url:"https://..."}"
    if (typeof msg === 'object') {
      const { code, url, error } = msg;
      if (!url) {
        console.log('🚀 ~ socket.on ~ error:', error);
        deleteFileUpdateVideo({
          file_code: code,
          file_deleteReason: msg,
        });
      }
    }
    _io.emit('fshare get link message', msg);
  });
};

module.exports = {
  getLinkUseSocket,
};

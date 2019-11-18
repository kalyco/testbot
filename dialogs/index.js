const addBotDialog = require('./addBot');
const addToolDialog = require('./addTool');
const remove = require('./remove');
const transfer = require('./transfer');
const ReserveDialog = require('./reserve');
const displayStatus = require('./status');
const release = require('./release');

module.exports = {
  addBotDialog,
  addToolDialog,
  remove,
  transfer,
  ReserveDialog,
  displayStatus,
  release
};

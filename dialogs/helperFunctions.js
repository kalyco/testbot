const fs = require('graceful-fs');

function writeData (filepath, jdata) {
  fs.writeFile(filepath, JSON.stringify(jdata, null, 4), 'utf-8', function (err) {
    if (err) throw err;
  });
}

function setBuildingForItem (building, jdata, tool) {
  console.log('setting ths building');
  const newdata = getItem(building, tool);
  jdata.push(newdata);
  writeData('../data/object.json', jdata);
  return `${tool} added to ${jdata.find((items) => items.name === tool).building}`;
}

function getItem (building, tool) {
  return {
    name: tool,
    status: 'open',
    resname: null,
    restime: null,
    reslimit: null,
    holdtime: null,
    testTool: 'yes',
    comment: null,
    building
  };
}

function getBotStats (mfpInfo) {
  const attachmentsStats = {
    text: `${mfpInfo.name} info`,
    attachments: [
      {
        title: 'MAC Address: ' + JSON.stringify(mfpInfo.id).replace('g', ''),
        color: '#A9A9A9'
      },
      {
        title: 'Site: ' + JSON.stringify(mfpInfo.site.name).replace('g', ''),
        color: '#A9A9A9'
      },
      {
        title: 'Wlan0: ' + JSON.stringify(mfpInfo.systemInfo.network.wlan0[0].address).replace('g', ''),
        color: '#A9A9A9'
      },
      {
        title: 'Zt: ' + JSON.stringify(mfpInfo.systemInfo.network.ztppiql5x5[0].address).replace('g', ''),
        color: '#A9A9A9'
      },
      {
        title: 'CLI: ' + JSON.stringify(mfpInfo.systemInfo.swVersions.mfp_cli).replace('g', ''),
        color: '#A9A9A9'
      },
      {
        title: 'Config Client: ' + JSON.stringify(mfpInfo.systemInfo.swVersions.mfp_config_client).replace('g', ''),
        color: '#A9A9A9'
      },
      {
        title: 'Executive: ' + JSON.stringify(mfpInfo.systemInfo.swVersions.mfp_executive).replace('g', ''),
        color: '#A9A9A9'
      },
      {
        title: 'GUI: ' + JSON.stringify(mfpInfo.systemInfo.swVersions.mfp_gui).replace('g', ''),
        color: '#A9A9A9'
      },
      {
        title: 'ROS: ' + JSON.stringify(mfpInfo.systemInfo.swVersions.mfp_ros).replace('g', ''),
        color: '#A9A9A9'
      },
      {
        title: 'Workflow Manager: ' + JSON.stringify(mfpInfo.systemInfo.swVersions.workflow_manager).replace('g', ''),
        color: '#A9A9A9'
      }
    ]
  };
  return attachmentsStats;
}

function setBotStatusOpen (jdata, jdataBot) {
  jdataBot.status = 'open';
  jdataBot.resname = null;
  jdataBot.restime = null;
  jdataBot.reslimit = null;
  jdataBot.holdtime = null;
  jdataBot.comment = null;
  writeData('../data/object.json', jdata);
}

module.exports = {
  writeData,
  setBuildingForItem,
  getItem,
  getBotStats,
  setBotStatusOpen
};

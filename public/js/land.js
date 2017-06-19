const electron = require('electron');
let ipcRenderer;
let sky;
let cloud;

/* DOM要素が読み込まれてから */
document.addEventListener('DOMContentLoaded', (e) => {
  /* 雲を表示するskyの生成 */
  ipcRenderer = electron.ipcRenderer;
  sky = new MickrSky();
  // 確認用
  // sky.addCloud({text: "もくもく"});
  ipcRenderer.on('clip', (e, data) => {
   
    //var cloud = new Cloud({text:"abc",around:true,rotation:true,swing:true})
    //sky.appendCloud(cloud)
   	data.rotation = data.rotation == undefined ? true : data.rotation
   	data.swing = data.swing == undefined ? true : data.swing
   	data.around = data.around == undefined ? true : data.around

   	sky.addCloud(data)
  })



});

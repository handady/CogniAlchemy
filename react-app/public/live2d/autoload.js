// live2d_path 参数建议使用绝对路径
// const live2d_path = "https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/";
const live2d_path = "/live2d/";

// 封装异步加载资源的方法
function loadExternalResource(url, type) {
  return new Promise((resolve, reject) => {
    let tag;

    if (type === "css") {
      tag = document.createElement("link");
      tag.rel = "stylesheet";
      tag.href = url;
    } else if (type === "js") {
      tag = document.createElement("script");
      tag.src = url;
    }
    if (tag) {
      tag.onload = () => resolve(url);
      tag.onerror = () => reject(url);
      document.head.appendChild(tag);
    }
  });
}

// 加载 waifu.css live2d.min.js waifu-tips.js
if (screen.width >= 768) {
  const app = new PIXI.Application({
    view: document.getElementById("live2d"),
    autoStart: true,
    antialias: true, // 抗锯齿，减少锯齿感
    transparent: true,
    resolution: window.devicePixelRatio || 1, // 适配高分辨率屏幕
    powerPreference: "high-performance", // 提高 GPU 性能
  });

  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;
  PIXI.settings.RESOLUTION = window.devicePixelRatio;

  app.ticker.maxFPS = 60;
  app.ticker.minFPS = 30;

  Promise.all([
    loadExternalResource(live2d_path + "waifu.css", "css"),
    loadExternalResource(live2d_path + "live2d.min.js", "js"),
    loadExternalResource(live2d_path + "waifu-tips.js", "js"),
  ]).then(() => {
    // 配置选项的具体用法见 README.md
    initWidget({
      waifuPath: live2d_path + "waifu-tips.json",
      //apiPath: "https://live2d.fghrsh.net/api/",
      cdnPath: live2d_path,
      app: app,
      models: [
        {
          name: "Tia",
          path: "Tia/index.json",
        },
        {
          name: "Tia",
          path: "Tia/index1.json",
        },
        {
          name: "Tia",
          path: "Tia/index2.json",
        },
        {
          name: "Tia",
          path: "Tia/index3.json",
        },
        {
          name: "Tia",
          path: "Tia/index4.json",
        },
        {
          name: "Tia",
          path: "Tia/index5.json",
        },
        {
          name: "Tia",
          path: "Tia/model.json",
        },
      ],
      tools: [
        "hitokoto",
        "asteroids",
        "switch-model",
        "switch-texture",
        "photo",
        "info",
        "quit",
      ],
    });
  });
}

console.log(`
  く__,.ヘヽ.        /  ,ー､ 〉
           ＼ ', !-─‐-i  /  /´
           ／｀ｰ'       L/／｀ヽ､
         /   ／,   /|   ,   ,       ',
       ｲ   / /-‐/  ｉ  L_ ﾊ ヽ!   i
        ﾚ ﾍ 7ｲ｀ﾄ   ﾚ'ｧ-ﾄ､!ハ|   |
          !,/7 '0'     ´0iソ|    |
          |.从"    _     ,,,, / |./    |
          ﾚ'| i＞.､,,__  _,.イ /   .i   |
            ﾚ'| | / k_７_/ﾚ'ヽ,  ﾊ.  |
              | |/i 〈|/   i  ,.ﾍ |  i  |
             .|/ /  ｉ：    ﾍ!    ＼  |
              kヽ>､ﾊ    _,.ﾍ､    /､!
              !'〈//｀Ｔ´', ＼ ｀'7'ｰr'
              ﾚ'ヽL__|___i,___,ンﾚ|ノ
                  ﾄ-,/  |___./
                  'ｰ'    !_,.:
`);

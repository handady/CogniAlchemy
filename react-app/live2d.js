// import { Live2DModel } from "pixi-live2d-display";

(async function () {
  const canvasWidth = 300;
  const canvasHeight = 300;
  const app = new PIXI.Application({
    view: document.getElementById("live2d"),
    width: canvasWidth,
    height: canvasHeight,
    autoStart: true,
    transparent: true,
  });

  const model = await PIXI.live2d.Live2DModel.from(
    "/live2d/models/Tia/index.json"
  );

  app.stage.addChild(model);

  // transforms
  model.x = canvasWidth / 2;
  model.y = canvasHeight / 2;
  model.rotation = Math.PI;
  model.skew.x = Math.PI;
  model.scale.set(0.5);
  model.anchor.set(0.5, 0.5);

  // interaction
  model.on("hit", (hitAreas) => {
    if (hitAreas.includes("body")) {
      model.motion("tap_body");
    }
  });
})();

import path from "path";
import { app } from "electron";

export function getAssetPath(): string {
  //process.env.MY_ENV_VAR === 'production'
  const _AssetPath = app.isPackaged
    ? path.join(process.resourcesPath, "app", ".webpack", "renderer", "assets")
    : path.join(app.getAppPath(), ".webpack", "renderer", "assets");

  return _AssetPath;
}



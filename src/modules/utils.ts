import path from "path";
import { app } from "electron";

export function getAssetPath(): string {
  //process.env.MY_ENV_VAR === 'production'
  const _AssetPath = app.isPackaged
    ? path.join(process.resourcesPath, "app", ".webpack", "renderer", "assets")
    : path.join(app.getAppPath(), ".webpack", "renderer", "assets");

  return _AssetPath;
}

// export function getCharacterClass(
//   DefaultClassData: IAppClasses[],
//   characterClass: string
// ): string {
//   const _character = DefaultClassData.find((e) => {
//     if (e.classe === characterClass || e.ascendancy.includes(characterClass))
//       // console.log("e.classe = " + e.classe)
//       // console.log("e.ascen.. = " + e.ascendancy.includes(characterClass))
//       // console.log("characterClass = " + characterClass)
//       return true;
//   });
//   return _character.classe;
// }

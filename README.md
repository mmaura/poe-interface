# Poe Interface
Companion to POE
![alt](https://raw.githubusercontent.com/mmaura/poe-interface/main/docs/screen_1.png)

## Building
### Developement

```sh
git clone
yarn 
yarn start
```
#### install react extension
https://www.electronjs.org/docs/latest/tutorial/devtools-extension

### Make package directory
```sh
yarn package --platform linux --arch x64
#or
yarn package --platform darwin --arch x64
#or 
yarn package --platform win32 --arch x64
```
The file are output to the **out** directory and can be run directly from.

### Make package distribution
#### Zip
**Must Work for all os** but only tested on linux
```sh
yarn make --platform linux --arch x64 --targets @electron-forge/maker-zip
#or
yarn make --platform darwin --arch x64 --targets @electron-forge/maker-zip
#or 
yarn make --platform win32 --arch x64 --targets @electron-forge/maker-zip
```
#### Flatpak

**not working at this time**

```sh
pacman -S flatpak-builder

yarn make --platform linux --arch x64 --targets @electron-forge/maker-flatpak
```

## Thanks to
https://github.com/electron-userland/electron-forge/

https://www.electronjs.org/

https://reactjs.org/

https://github.com/klayveR/poe-log-monitor

https://github.com/klayveR/poe-api-wrappers

https://github.com/karakasis/Path-of-Leveling/tree/master/json

https://github.com/brather1ng/RePoE

https://github.com/brather1ng/PyPoE

https://github.com/Templarian/MaterialDesign-React
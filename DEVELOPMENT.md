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

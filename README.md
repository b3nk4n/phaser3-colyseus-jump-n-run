# Jump 'n' Run game using Phaser 3, TypeScript, Parcel and Colyseus

![phaser3-parceljs-template](https://user-images.githubusercontent.com/2236153/71606463-37a0da80-2b2e-11ea-9b5f-5d26ccc84f91.png)

![colyseus](https://raw.githubusercontent.com/colyseus/colyseus/HEAD/media/header.png?raw=true)

![License](https://img.shields.io/badge/license-MIT-green)

This basic jump 'n' run game is based on the TypeScript specific fork [phaser3-typescript-parcel-template](https://github.com/ourcade/phaser3-typescript-parcel-template)
and started with the tutorial series of [ourcade](https://www.youtube.com/channel/UCJyrgLkI9LcwzUhZXxrwpyA).

## Prerequisites

You'll need [Node.js](https://nodejs.org/en/), [npm](https://www.npmjs.com/), and [Parcel](https://parceljs.org/) installed.

It is highly recommended to use [Node Version Manager](https://github.com/nvm-sh/nvm) (nvm) to install Node.js and npm.

For Windows users there is [Node Version Manager for Windows](https://github.com/coreybutler/nvm-windows).

Install Node.js and `npm` with `nvm`:

```bash
nvm install node
nvm use node
```

Replace 'node' with 'latest' for `nvm-windows`.

Then install Parcel:

```bash
npm install -g parcel-bundler
```

## Getting started

Clone this repository to your local machine:

```bash
git clone https://github.com/b3nk4n/phaser3-colyseus-jump-n-run.git
```

Then go into your new project folder and install dependencies:

```bash
cd phaser3-colyseus-jump-n-run
npm install
```

Start development server:

```bash
npm run server
```

And finally the clients:

```bash
npm run client
```

## Deployment

To create a production build:

```bash
npm run build
```

Production files will be placed in the `dist` folder. Then upload those files to a web server.

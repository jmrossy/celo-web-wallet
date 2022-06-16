# Celo Wallet For Web and Desktop

A lightweight, self-sovereign wallet for the Celo network. Manage small accounts [on the web](https://celowallet.app) or large ones [on your desktop.](https://github.com/celo-tools/celo-web-wallet/releases) Fully compatible with Ledger hardware.

## Desktop Downloads

The desktop downloads for Mac, Windows, and Linux are hosted here in the [releases page](https://github.com/celo-tools/celo-web-wallet/releases).

## Frequently Asked Questions

See the [FAQ](FAQ.md) for more details about common questions.

## Bundle integrity hashes

This wallet uses [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity). Current bundle hashes:

* Main bundle: `bundle.js -> sha256-mKlBK5sVilEAlbFWUFdhTsCB8Gn833r/J7y+kERB368=`
* Optional Ledger bundle: `bundle-ledger.js -> sha256-TIQHOQhHK0Nlw5+LcUVxb8jBwGmoCHFkPfihIy42d9Y=`
* Optional WalletConnect v1 bundle: `bundle-walletconnectv1.js -> sha256-drWkNcYufDCGAFcjfOsETtWH8H1ODgV4fEcd1ktfA2o=`
* Optional WalletConnect v2 bundle: `bundle-walletconnectv2.js -> sha256-FijbSmdr+Dyizc5+HDlB8vI6tLPxyYhiHI36dCYmOCI=`

Advanced users can verify the source integrity by comparing the hashes in their page source to these values.

## Building and running locally

First install dependencies:

```sh
yarn install 
```

### Running in a browser

To create and run a development build in a browser (recommended for development):

```sh
yarn dev
```

### Running in Electron

To build for electron and run in a desktop app:

```sh
yarn electron:dev
```

## Contributing

For small contributions such as bug fixes or style tweaks, please open a Pull Request.
For new features, please create an issue to start a discussion on [Discord](https://discord.gg/ht885KmG5A).

## License

This project is [MIT Licensed](LICENSE).

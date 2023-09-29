# Celo Wallet For Web and Desktop

A lightweight, self-sovereign wallet for the Celo network. Manage small accounts [on the web](https://celowallet.app) or large ones [on your desktop.](https://github.com/celo-tools/celo-web-wallet/releases) Fully compatible with Ledger hardware.

## Desktop Downloads

The desktop downloads for Mac, Windows, and Linux are hosted here in the [releases page](https://github.com/celo-tools/celo-web-wallet/releases).

## Frequently Asked Questions

See the [FAQ](FAQ.md) for more details about common questions.

## Bundle integrity hashes

This wallet uses [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity). Current bundle hashes:

* Main bundle: `bundle.js -> sha256-aNO58boFLuvf0BCEh5m8njVr4OxI9R7Djy/hLazMPjQ=`
* Optional Ledger bundle: `bundle-ledger.js -> sha256-j/vU1rJduVEaZ025hrnmD1eVuD2NZanPuEDGGoeI7L8=`

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

## License

This project is [MIT Licensed](LICENSE).

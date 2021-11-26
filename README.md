# Celo Wallet For Web and Desktop

A lightweight, self-sovereign wallet for the Celo network. Manage small accounts [on the web](https://celowallet.app) or large ones [on your desktop.](https://github.com/celo-tools/celo-web-wallet/releases) Fully compatible with Ledger hardware.

## Desktop Downloads

The desktop downloads for Mac, Windows, and Linux are hosted here in the [releases page](https://github.com/celo-tools/celo-web-wallet/releases).

## Frequently Asked Questions

See the [FAQ](FAQ.md) for more details about common questions.

## Bundle integrity hashes

This wallet uses [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity). Current bundle hashes:

* Main bundle: `bundle.js -> sha256-x9oGHUxFMH+grTV/yqpWYsWnVdmD00PPolTahdB4sUE=`
* Optional Ledger bundle: `bundle-ledger.js -> sha256-ahGOG1h2KTAtylviHC6GYqCX9Pa2NUleoytU5knhB6E=`
* Optional WalletConnect bundle: `bundle-walletconnect.js -> sha256-eGLzdWvYcl/9NmhqTvc7j8/jhWAwauOnaGL4wNMs44w=`

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

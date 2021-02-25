# Celo Web Wallet

A browser-based, mobile-friendly, self-sovereign wallet for the Celo network.

Ideal for managing small 'hot' wallets or Celo wallets on Ledger hardware.

## Frequently Asked Questions

See the [FAQ](FAQ.md) for more details about common questions.

## Bundle integrity hashes

This wallet uses [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity). Current bundle hashes:

* Main bundle: `bundle.js -> sha256-EyT/DzNF33LQ6Fi5IiYh2KazJajS/d8/TsqfXNhwMko=`
* Optional Ledger bundle: `bundle-ledger.js -> sha256-rRHGJrxM/zOW9RojK1F/oFaxgYPgHIQaJ3lH97OtOi8=`

Advanced users can verify the source integrity by comparing the hashes in their page source to these values.

## Building and running locally

First install dependencies:

```sh
yarn install 
```

To create and run a development build:

```sh
yarn dev
```

To create a production build:

```sh
yarn build:prod
```

## Contributing

For small contributions such as bug fixes or style tweaks, please open a Pull Request.
For new features, please create an issue to start a discussion on [Discord](https://discord.com/channels/600834479145353243/783806028629934110).

## License

This project is [MIT Licensed](LICENSE).

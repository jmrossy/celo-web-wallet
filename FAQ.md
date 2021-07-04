# Frequently Asked Questions

[Where can the app be used?](#where-can-the-app-be-used)

[Does it work on phones?](#does-it-work-on-phones)

[Will it work with Valora wallets?](#will-it-work-with-valora-wallets)

[How is it different than Valora?](#how-is-it-different-than-valora)

[Is the web version safe?](#is-the-web-version-safe)

[Where are my keys stored?](#where-are-my-keys-stored)

[Is Ledger supported?](#is-ledger-supported)

[Can feature X be added?](#can-feature-x-be-added)

## Where can the app be used?

The Celo Wallet can run in a modern browser (Chrome is recommended) or on your desktop (Mac, Windows, and Linux).
The desktop version has stricter security guarantees and is strongly recommended for large accounts.

## Does it work on phones?

Yes, the web version was designed from the ground-up to be lightweight and mobile-friendly.

## Will it work with Valora wallets?

Yes, you can use your Account Key (seed phrase) to import your account into the Celo Wallet, back into Valora, or use both at the same time.

## How is it different than Valora?

The most obvious difference is platform: Valora runs on iOS and Android, whereas Celo Wallet runs in browsers and on desktop. More abstractly though, Valora is a social payments application whereas the Celo Wallet is just a tool. That's why Valora includes extra features around importing contacts, verifying phone numbers, finding friends, etc. In contrast, one of this wallet's design principles is to be minimal, meaning no analytics, no plugins, and no device permissions (except for Ledger access).

## Is the web version safe?

Short answer: It's safe enough for small 'hot' wallets or Ledger-backed wallets. For anything larger or more important, the desktop version is strongly recommended.

Long answer: The web version does what it can to protect your funds but web apps have certain inherent limitations. Protections includes: encrypting your wallet at rest, minimal use of 3rd party code, pinning dependencies, using single-origin code sourcing, publishing bundle hashes, and other modern web development best practices. That said, the web is, by design, an open and extensible platform. That unfortunately means all web apps are vulnerable to certain risks, like malicious browser extensions. For this reason, the recommendation is to use the web version for small amounts only. For larger amounts, use the desktop version, Valora or a Ledger hardware wallet.

## Where are my keys stored?

Your seed phrases, from which you keys are derived, are encrypted using your password and stored either in browser local storage for web or on disk for desktop. Your keys never leave your device. In other words, this wallet is a self-sovereign (non-custodial) wallet.

- Mac: `~/Library/Application Support/celo-web-wallet/accounts.json`
- Linux: `~/.config/celo-web-wallet or $XDG_CONFIG_HOME/celo-web-wallet/accounts.json`
- Windows: `C:\Users\{USERNAME}\AppData\Roaming\celo-web-wallet\accounts.json`

## Is Ledger supported?

Yes, Ledger hardware is supported on both the web and desktop versions. Due to browser limitations, Ledger has been found to work best in Chrome.

Note though that currently not all transactions can be parsed by the Celo Ledger app. Simple payments (like CELO or cUSD transfers) will show transaction details on the Ledger itself but transfers with comments or token exchanges will not yet show details.

## Can feature X be added?

Maybe, let's chat about it! Please see the [wallet Discord channel](https://discord.com/channels/600834479145353243/783806028629934110) for open discussion.

# Frequently Asked Questions

[What can I do with the web wallet?](#what-can-i-do-with-the-web-wallet)

[Does it work on phones?](#does-it-work-on-phones)

[Will it work with Valora wallets?](#will-it-work-with-valora-wallets)

[How is it different than Valora?](#how-is-it-different-than-valora)

[Is the web wallet safe?](#is-the-web-wallet-safe)

[Where are my keys stored?](#where-are-my-keys-stored)

[Can I download the wallet and run it offline?](#can-i-download-the-wallet-and-run-it-offline)

[Can feature X be added?](#can-feature-x-be-added)

## What can I do with the web wallet? 

The web wallet is great at conveniently creating small wallets for day-to-day transactions. You can send payments, make currency exchanges, and see your transaction history.

## Does it work on phones?

Yes, the wallet was designed from the ground-up to be lightweight and mobile-friendly.

## Will it work with Valora wallets?

Yes, you can use your Account Key (mnemonic phrase) to import your account into the web wallet, back into Valora, or use both at the same time!

## How is it different than Valora?

The most obvious difference is platform: Valora runs on iOS and Android, the web wallet runs in any modern browser. More abstractly though, Valora is a social payments application whereas the web wallet is just a tool. That's why Valora includes extra features around importing contacts, verifying phone numbers, finding friends, etc. In contrast, one of this wallet's design principles is to be minimal, meaning no analytics, no plugins, and no device permissions (except for Ledger access).

## Is the web wallet safe?

Short answer: Yes, but use is only recommended for small 'hot' wallets or Ledger-backed wallets.

Long answer: The core developers try their best to keep the all wallets safe. This includes encrypting your wallet at rest, minimal use of 3rd party code, pinning dependencies, using single-origin code sourcing, publishing bundle hashes, and other modern web development best practices. That said, the web is, by design, an open and extensible platform. That unfortunately means even the best web apps are vulnerable to certain risks, like malicious browser extensions. For this reason, the recommendation is to use the web wallet for small amounts only. For larger amounts, use Valora or a Ledger hardware wallet.

## Where are my keys stored?

Your mnemonic, from which you keys are derived, is encrypted using your pin and stored in browser local storage. Your keys never leave your device. In other words, the web wallet is a self-sovereign (non-custodial) wallet.

## Can I download the wallet and run it offline?

Soon! The wallet has some limited Progress Web App (PWA) support for app pinning.

## Can feature X be added?

Maybe, let's chat about it! Please see the [wallet Discord channel](https://discord.com/channels/600834479145353243/783806028629934110) for open discussion.

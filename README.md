# YDKtoDecklist
This little app converts a .ydk file into a decklist you can paste on sites like [cardmarket](https://www.cardmarket.com), Deck Builder's Toolkit](http://dbtoolkit.com/loaddeck.php), etc.

## Features

current:
* transform into decklist to copy

planned:
* show prices for cards
  * set sources for prices
  * link to the pages
* convert into Konami's decklist file

## Troubleshooting

### I get a "'name' is undefined" error when building my decklist
Cause: That's a problem caused by some apps having multiple [passcodes](https://yugipedia.com/wiki/Password) for the same card that is only used by the app in question.
For example "Foolish Burial" in YGOPro2, where the censored and uncensored version have different passcodes (for whatever reason). 

Solution: Unfortunetaly there is no automated solution to identify these codes/cards.
But you can submit the (wrong) passcode for the card so it get's automatically converted into the right passcode.

### There is a card in the decklist I did not put in the deck (while another is missing)
Cause: That's a thing that's most likely caused by the same thing as the aforementioned issue but the app just used a passcode that's now used for another card.
Solution: Make sure the app you used is up to date with the TCG/OCG 

## Build it yourself

### Requirements
* NodeJS (> 8)
* yarn

### Install the dependencies
>yarn

### start application in debug mode
>yarn start

### Package app
>yarn package


## Built with
* [Electron](https://www.electronjs.org/)
* [electron-builder](https://github.com/electron-userland/electron-builder)
* [axios](https://github.com/axios/axios)
* [electron-store](https://github.com/sindresorhus/electron-store)
* [NodeJS](https://nodejs.org/en/)
* [YGOProDeck DB](https://db.ygoprodeck.com)


## Contributing

You are welcome to fork and/or make pull requests

## Author(s)
* [Robin Meischke](https://www.nierhain.de) - Developer

## License
This project is licensed under the MIT License - see the [License file](https://github.com/Nierhain/YDKtoDecklist/blob/master/LICENSE.md) for further details.
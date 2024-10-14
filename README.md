# yomato-backend
This repository contains the code for **[Yomato](https://yomato.in)**'s APIs - find out what you can order and eat from Zomato based on how much you have on **[Yomato](https://yomato.in)**.

# Running Locally
Clone this repository to your local machine, and then install dependencies by running:
```bash
yarn install
```

After that, you may spin up the backend by running:
```bash
yarn start
```

# APIs
## GET `/menu`
Requires a `url` query parameter of the restaurant that should adhere to the following regex: `/^https:\/\/www\.zomato\.com\/([a-zA-Z]+)\/([a-zA-Z0-9\-]+)(?:\/[a-zA-Z0-9\-]+)?$/`

Responds with the menu for that restaurant.

# License
MIT
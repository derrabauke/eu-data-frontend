# eu-data-frontend

This is the frontend part of my data-analysis project. It consists of this very frontend which consumes the data from a graph database based on Neo4j. Check out the [data scraping and modelling here.](https://github.com/derrabauke/eu-data-workflow). The graph rendering is based on [Sigma.js](https://github.com/jacomyal/sigma.js/) and [Graphology](https://github.com/graphology/graphology). Behind the scenes [EmberJS](https://github.com/emberjs/ember.js) is utilized for rigging the app.

## Access

You have to enter credentials for a Neo4j AuraDB instance. Write me an email to `${["falk","neumann"].join(".")}@${["adfinis","com"].join(".")}` and we can talk about sharing the credentials. The whole authentification setup is not production ready at all! Remember to clear your cookies or use the `logout` button after you are done with your session!

## Prerequisites

You will need the following things properly installed on your computer.

- [Git](https://git-scm.com/)
- [Node.js >= v16](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Ember CLI](https://cli.emberjs.com/release/)
- [Google Chrome](https://google.com/chrome/)

## Installation

- `git clone <repository-url>` this repository
- `cd eu-data-frontend`
- `pnpm install`

## Running / Development

- `ember serve`
- Visit your app at [http://localhost:4200](http://localhost:4200).
- Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Running Tests

- `ember test`
- `ember test --server`

### Linting

- `pnpm lint`
- `pnpm lint:fix`

### Building

- `ember build` (development)
- `ember build --environment production` (production)

## Further specialities

- tailwindCSS
- embroider

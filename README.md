<p align="center">
  <a href="http://munio.cloud/" target="blank"><img src="docs/munio-logo.svg" width="200" alt="Munio Logo" /></a>
</p>

<p align="center">a virtual assistant that helps users improve their conversation skills through voice practice sessions</p>

## Description

Munio is a virtual assistant that functions as a teacher of English to help users improve their conversation skills through voice practice sessions.

Using the Gemini, Munio generates phrases for a section based on the information provided by the user. After this, the user responds to tasks in the section via audio, where the Gemini performs analyses, identifying improvements in pronunciation and speech to help the user get better each time.

After completing the session, a final report is generated, highlighting areas where the user can improve their conversation skills.

In addition to the virtual assistant provided by the Gemini, we also have a system for uploading and authenticating users.

This is a public version of the back-end application and the front-end can be found here: [web-client](https://github.com/muniocloud/web-client).

## Installation

```bash
npm ci
```

## Running external services

```bash
docker compose up
```

## Installing migrations

```bash
npm run migration:up
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Application Structure Highlights

- Phrase Generator: **Google Gemini Flash**
- Audio recording analysis: **Google Gemini Flash**
- Session analysis: **Google Gemini Flash**
- Storage: **Google Cloud Storage**
- Infrastructure: **Google Cloud Platform: Cloud SQL and App Engine**
- Authentication: Passport
- Validations: Zod
- Query Builder: Knex
- Database: MySQL
- Framework: NestJS

## Stay in touch

- Author - [Gabriel Sena](https://gabrielsena.dev)
- Website - [https://munio.cloud](https://munio.cloud/)

## License

[MIT licensed](LICENSE).

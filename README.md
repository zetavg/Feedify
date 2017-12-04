# Feedify: Full-text RSS feeds

![Dependencies](https://david-dm.org/zetavg/Feedify.svg)

Get full-text RSS feeds from a given data source. Built with [Serverless Framework](https://serverless.com/) and can be deployed to AWS with a single command.


## Setup

1. Run `npm install`.
2. Edit `config.yml`.


## Run

To start the local development server, run:

```bash
$ npm start
```


## Deploy

Before the deploy, you'll need to have [Serverless Framework with AWS](https://serverless.com/framework/docs/providers/aws/guide/credentials/) setup, and make sure the configurations in `config.yml` are what you want.

To deploy to AWS, just run:

```bash
$ npm run deploy
```

And to remove the deployment, use:

```bash
$ npm run remove
```

Check out the [Serverless AWS Lambda CLI Reference](https://serverless.com/framework/docs/providers/aws/cli-reference/) for more information.

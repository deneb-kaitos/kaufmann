# Token Server

 1. [what is the Token Server](#what-is-the-token-server)
 2. [tokens](#tokens)

## What is the Token Server

The Token Server is responsible for supporting the Kaufmann Network with authentication functionality. Think of it as of an implementation of an OAuth server.

## Tokens

A token is a cryptographically sane message/file in the format of Google Macaroons. Google Flatbuffers can also be used.
Each type of [authenticated workflow](#types-of-authenticated-workflows) has to deal with a separate type of a token.

### Why not JWT

1. Kaufmann Network will never interoperate with any external services for authentication
2. JWT et al. is a bunch of `crappy` and `bloated` standards I personally don't want to mess with

## Types of authenticated workflows

1. [Account Creation](#account-creation-workflow) workflow
2. `Regain Access` workflow
3. `Delete Own Account` workflow


## Authenticated workflows

### Account Creation Workflow

This workflow takes place whenever a new counterparty (a Sales Person, a Supplier, or a Consumer) is willing to join the Kaufmann Network.

A counterparty joins the Kaufman Network only by invitation. Hence there are two counterparties that participate in this workflow: the inviting subject, and the one that is being invited.

E.g.: an existing counterparty ( the `Supplier GmbH` ) would like to invite a new one ( the `Consumer GmbH` ) to the Kaufmann Network:

1. the `Consumer GmbH` opens a special web application ( the `Consumer App` ) when they are ready to join the network;
2. the `Consumer GmbH` give a phone call to the `Supplier GmbH` and the `Supplier GmbH` send the `Supplier GmbH` a special PIN;
3. 
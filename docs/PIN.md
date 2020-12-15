# PIN

Questions being addressed:

  - [What is PIN](#what-is-pin)
  - [What types of PINs exist](#what-types-of-pins-exist)

## What is PIN

A `PIN` is a cryptographically sane context/file. A `PIN` is a statement that its issuer confirms the `PIN` receiver is enabled to do what this `PIN` allows to do.

## What types of PINs exist

  - [Onboarding PIN](#onboarding-pin)
  - [Access Regain PIN](#access-regain-pin)

### Onboarding PIN

This type of a PIN can only be used to create a new account in the Kaufmann Network.

Nothing other than creation of a new account could be achieved with this type of a `PIN`.

Normally, a [Sales Person](KaufmannNetwork.md#a-sales-person) would generate this type of a `PIN`, handle it over to, say, a [Supplier](KaufmannNetwork.md#a-supplier).

The `Supplier` then will be able to enter the Kaufmann Network and create their account ( of type `Supplier` ).

### Access Regain PIN

Whenever a counterparty loses their access to the Kaufmann Network ( a counterparty has lost their access token ), a number of `Access Regain PIN`s should be provided to the counterparty.

The number of `PIN`s depend on the number of counterparties who work directly with the counterparty who has lost their access to the Kaufmann Network. This number cannot be less than 75% of all of the subject's relations.

The counterparty who has lost their access to the Kaufmann Network communicates with their own counterparties directly and obtain the said number of this type of the `PIN`s from them.

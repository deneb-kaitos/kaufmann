# WebRTCExchangeServer

## The context

An `Anonymous` user is being invited to the `Kaufmann Network` by a `Supplier`.

## The problem

The `Anonymous` has to receive a `token` from the `Token Server`, but the `Anonymous` will fail to establish a connection to the `Token Server` without a valid `token`.

## Proposed solution

The `Supplier` establishes a websocket connection to the `WebRTCExchange Server`, and requests a `PIN` that uniquely identifies the websocket.

The `Supplier` transmits the `PIN` to the `Anonymous` via any media external to the `Kaufmann Network`, e.g. `SMS`.

The `Anonymous` provides the `PIN` to their `App`.

The `App` connects to the `WebRTCExchange Server` supplying the `PIN` in `X-PIN` header.

The `WebRTCExchange Server` reads the `PIN` from the `X-PIN` header, finds the `PIN` in the local database, and allows the connection to be established. The `WebRTCExchange Server` wires up the two sockets - the websocket that belongs to the `Supplier`, and the websocket that belongs to the `Anonymous`.

The `Supplier` and the `Anonymous` use their websocket connections to the `WebRTCExchange Server` to exchange the data that is required to establish a WebRTC connection between their devices. As soon as such connection is established both parties terminate their websocket connections to the `WebRTCExchange Server` and further communication takes place via the WebRTC connection.

The `Supplier` send a `token` to the `Anonymous`. The `token` can only be used for establishing a connection to the `Token Server` and requesting the `CreateAccountToken` token from it. No actions besides the aforementioned ones can be executed with the token.

Upon receiving the `token` the `Anonymous` terminates the WebRTC connection to the `Supplier` and establishes a websocket connection to the `Token Server` supplying the provided `token` in the `X-TOKEN` header.

The `Token Server` examines the `token`, validates it, returns a `CreateAccountToken` token to the `Anonymous`, and immediately terminates the websocket connection.

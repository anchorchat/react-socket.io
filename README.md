# react-socket.io
react socket.io provider Higher Order Component, passing the socket to children

## Usage

Install from npm

[![NPM](https://nodei.co/npm/react-socket.io.png)](https://nodei.co/npm/react-socket.io/)

### Documentation

#### Basic Usage
```javascript
import SocketProvider from 'react-socket.io';

const socketOptions = {
  url: <redisUrl>,
  ioOptions: <redisOptions>,
  initialSocketEvents: [],
  onConnectEvents: [],
  onDisconnectEvents: [],
  loadingComponent: <CustomLoadingComponent>
};

ReactDOM.render(
    <Router history={browserHistory}>
      <Route path="/" component={SocketProvider(App, socketOptions))} />
      <Route path="/login" component={unauthComponent} />
    </Router>,
  document.getElementById('root')
);
```

In App the following props are now exposed:
```javascript
socket
addSocketEvent,
emitSocketEvent,
removeSocketEvents
```

#### initialSocketEvents
You can give the socket provider default socket events that needs to be run directly after the socket connection is made. The on event callback returns the socket. These socket events must have the following format:

```javascript
{
  type: 'on',
  name: 'connect',
  callback: socket => store.dispatch(socketConnected(socket))
},
// emit has the options property instead of callback.
{
  type: 'emit',
  name: 'client:init',
  options: {}
}
```

#### onConnectEvents
Specify what functions should be run when a socket connection is made.
```javascript
onConnectEvents: [
  socket => store.dispatch(socketConnected(socket))
]
```

#### onDisconnectEvents
Specify what functions should be run when a socket connection is made.
```javascript
onDisconnectEvents: [
  store.dispatch(userLogoutClient()),
  store.dispatch(socketRemove())
]
```

#### loadingComponent
A Custom loading component that can be used to show the user the socket is reconnecting.
This component gets a prop isConnecting injected. This can be used to show a difference between reconnecting and offline.
 ```javascript
 // The prop is injected by default.
<loadingComponent isConnecting={isConnecting} />;
 ```

## Installation

### src

Install `node_modules` used in `./src`:

```bash
$ npm i
```

Compile `./src` with Babel:

```bash
$ npm run compile
```

## Development

### src

To watch for changes in `./src` run:

```bash
$ npm run watch
```

Babel will compile `./src` on changes.

### examples

To start the webpack server run:

```bash
$ cd examples && npm run start
```

Webpack wil compile on changes in `./examples/src`.

## License

This project is licensed under the terms of the [MIT license](https://github.com/anchorchat/react-socket.io/blob/master/LICENSE).

import React, { Component } from 'react';
import io from 'socket.io-client';
import _ from 'underscore';

export default function socketProvider(ChildComponent, options) {
  // options argument with the following arguments:
  // url: <socketUrl>
  // ioOptions: ObjectOf(<socketOptions>)
  // initialSocketEvents: ArrayOf(<events>)
  //   events: {
  //     type: on/emit/off
  //     name: <eventName>
  //     callback: <function>,
  //     options: <Object>
  //   }
  // onConnectEvents: ArrayOf(<events>)
  // onDisconnectEvents: ArrayOf(<events>)
  // loadingComponent: Node
  return class ComponentWithSocket extends Component {
    static runCustomEvents(events) {
      if (events && events.length > 0) {
        _.each(events, (event) => {
          if (_.isFunction(event)) {
            event();
          }
        });
      }
    }

    constructor() {
      super();

      // Required options
      this.url = options.url || '/';
      this.ioOptions = options.ioOptions || {};

      this.state = {
        connected: false,
        connecting: false
      };

      // State doesnt work with this array somehow.
      this.events = {};
      this.initialEvents = {};
      this.socket = false;

      // TODO add remove single socket event
      this.emitSocketEvent = this.emitSocketEvent.bind(this);
      this.addSocketEvent = this.addSocketEvent.bind(this);
      this.removeSocketEvents = this.removeSocketEvents.bind(this);
      this.renderLoadingComponent = this.renderLoadingComponent.bind(this);
    }

    componentWillMount() {
      this.checkSocketConnection();
    }

    componentDidMount() {
      this.initialiseSocketEvents();
    }

    componentWillUnmount() {
      this.disconnect();
    }

    initialiseSocketEvents() {
      if (!this.socket) {
        return false;
      }

      const socket = this.socket;

      // Connect captures the initial connection and all reconnections
      socket.on('connect', () => {
        if (!this.state.connecting && !this.state.connected) {
          this.setState({ connected: true });
        }
      });

      socket.on('ping', () => {
        const isOnline = navigator.onLine;
        if (!isOnline) {
          this.setState({ connecting: true });
        } else if (!this.socket.connected) {
          this.setState({ connecting: false });
        }
      });

      socket.on('reconnect', () => {
        this.setState({ connected: true });
      });
      socket.on('disconnect', () => this.setState({ connected: false }));

      // TODO add checks for each event if it is the right format.
      if (options && options.initialSocketEvents && options.initialSocketEvents.length > 0) {
        _.each(options.initialSocketEvents, (event) => {
          switch (event.type) {
            case 'on':
              return this.addSocketEvent(event.name, () => event.callback(socket), true);
            case 'off':
              return this.removeSocketEvent(event.name, event.callback);
            case 'emit':
              return this.emitSocketEvent(event.name, event.options);
            default:
              return false;
          }
        });
      }

      return false;
    }

    checkSocketConnection() {
      const isConnected = this.state.connected;
      const isReconnecting = this.state.connecting;

      if (!isConnected && !isReconnecting) {
        this.connect();
      }

      if (isConnected && !isReconnecting) {
        this.disconnect();
      }
    }

    connect() {
      if (this.socket) {
        return false;
      }

      const socket = io.connect(this.url, this.options);

      this.socket = socket;

      const socketIsConnected = Boolean(socket && socket.connected);

      if (socketIsConnected) {
        this.setState({ connected: true });
        ComponentWithSocket.runCustomEvents(options.onConnectEvents);
      }

      return false;
    }

    disconnect() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = false;

        ComponentWithSocket.runCustomEvents(options.onDisconnectEvents);
      }
    }

    emitSocketEvent(event, callback) {
      this.socket.emit(event, callback);
    }

    addSocketEvent(event, callback, initial) {
      if (!_.has(this.events, event)) {
        this.socket.on(event, callback);

        const newEvent = { [event]: callback };
        if (initial && !_.has(this.initialEvents, event)) {
          this.initialEvents = _.extend(this.initialEvents, newEvent);
        } else {
          this.events = _.extend(this.events, newEvent);
        }
      }
    }

    removeSocketEvents() {
      if (this.socket) {
        _.each(this.events, (callback, event) => {
          this.socket.off(event, callback);
        });
      }

      this.events = {};
    }

    renderLoadingComponent() {
      // TODO check if loadingComponent is a component
      if (options && options.loadingComponent) {
        return <options.loadingComponent isConnecting={this.state.connecting} />;
      }

      return <p> Loading ... </p>;
    }

    render() {
      const isConnecting = this.state.connecting;
      const isConnected = this.state.connected;

      return (
        isConnecting || !isConnected
        ? this.renderLoadingComponent()
        : <ChildComponent
          {...this.props}
          socket={this.socket}
          addSocketEvent={this.addSocketEvent}
          removeSocketEvents={this.removeSocketEvents}
          emitSocketEvent={this.emitSocketEvent}
        />
      );
    }
  };
}

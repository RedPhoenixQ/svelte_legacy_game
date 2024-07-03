- [ ] Create a serverside game instance
  - This should probably work similar to the client side with subscribers
    - Getting all needed value for every action will be to expensive
    - Maybe use writable stores here to make game class client and server side
- [x] Structure game class with Character classes and make game responsible for updating class data on the correct class

  - ~~a Character can have their own effects, actions and position (related to token)~~
  - a Character can get their effects, actions and position from the other stores

- [ ] Handle changes of activeBoard and similar cases
  - unsubscribe from old board
  - replace and subscribe to new board

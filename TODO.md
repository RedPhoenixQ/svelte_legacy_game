- [ ] Get inputs for taking an action

  - Position of one or more targeting-shapes on the board
  - Selected targets for an attack
    - Selecting should be limited to a cicular range from token
  - [ ] ?Make choices for an attack
    - An attack could ask for:
      - number of repeats
      - at what level to cast
      - what resource to use (ammunition or mana/other)

- [ ] Add GameStores method to get results of taking an action

  - Show any potential errors
  - Modifiers to apply
  - Damage to deal
    - Transform to modifier for display
  - ?Movement to apply
  - [ ] Show temporary number next to all stats
    - [ ] Add detailed view for stats that show all modifiers that apply

- [ ] Make ServerGame apply results of actions

  - Handle potential errors with pocketbase

- [x] Create a serverside game instance
  - This should probably work similar to the client side with subscribers
    - Getting all needed value for every action will be to expensive
    - Maybe use writable stores here to make game class client and server side
- [x] Structure game class with Character classes and make game responsible for updating class data on the correct class

  - ~~a Character can have their own effects, actions and position (related to token)~~
  - a Character can get their effects, actions and position from the other stores

- [x] Handle changes of activeBoard and similar cases
  - unsubscribe from old board
  - replace and subscribe to new board

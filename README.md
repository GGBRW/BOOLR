# BOOLR
A digital logic simulator - [UPDATED]

#### Running in development

The most useful tools to dev is yarn, install yarn with npm 

```bash
# Install Yarn
npm install -g yarn

# Fetch dependencies
yarn

# Run in development
yarn start
```

### Build the app

before build the app you'll have to make some changes so that your built application will work easily with saves functiunnality
before build do this : 

- In index.html change line 94 : /../saves to /../../saves
- In saves.js change line 2 : /../saves to /../../saves
- In savedCustomComponents.js line 13 : /../data to /../../data
- In savedCustomComponents.js line 21 : /../data to /../../data

```bash
yarn dist (it will take data from data forder for custom components and saves folder for saved board).
```

After a build, don't forget to make the path clean (reverse the action of above) again to make saves functiunnality work again in development.

GL
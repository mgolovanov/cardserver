set NODE_OPTIONS=--experimental-modules --no-warnings
set NODE_PATH=%CD%;%NODE_PATH%;.
set PATH=%PATH%;%CD%\node_modules\.bin
node ./app.mjs

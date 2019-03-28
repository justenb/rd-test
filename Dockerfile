# base image
FROM node:5

# set default port app listens on
ENV APP_PORT=8080

# create app directory
RUN ["mkdir", "/app"]

# copy source code to image
COPY . /app

# expose default port for inter-container communication
EXPOSE $APP_PORT

# set working directory and default run command
WORKDIR /app
CMD ["node", "app.js"]

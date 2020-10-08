# pull official base image
FROM node:latest

# set working directory
WORKDIR /app

# install app dependencies
COPY package*.json /app/
RUN npm install

# add app
COPY . /app/

# start app
CMD ["npm", "start"]   
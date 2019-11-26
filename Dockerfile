ARG NODE_VERSION=11.14

# First stage: build the executable.
FROM node:${NODE_VERSION} AS builder

# set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json
RUN npm install --no-optional
RUN npm install copyfiles -g

# add app
COPY . /usr/src/app

# run tests
RUN npm run test

# run build
RUN npm run build

##################
### production ###
##################

# base image
FROM node:${NODE_VERSION}-alpine 

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# copy artifact build from the 'build environment'
COPY --from=builder /usr/src/app/dist /usr/src/app
COPY --from=builder /usr/src/app/node_modules/heapdump /usr/src/app/node_modules/heapdump

RUN npm install --only=prod --no-optional
EXPOSE 3000

# run nginx
CMD ["npm", "start"]
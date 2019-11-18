FROM node:10
CMD ["/usr/local/bin/dumb-init", "--", "node", "index.js"]
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 &&\ 
    chmod +x /usr/local/bin/dumb-init

COPY package*.json /app/

WORKDIR /app

RUN npm install 

COPY . /app/ 

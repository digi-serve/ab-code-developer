##
## digiserve/ab-code-developer:master
##
## This is a collection of our github projects for a developer install.
## We use this upon install to copy over our repositories.
##
## Docker Commands:
## ---------------
## $ docker build -t digiserve/ab-code-developer:master .
## $ docker push digiserve/ab-code-developer:master
##

ARG BRANCH=master

FROM digiserve/service-cli:${BRANCH}

RUN apt-get update \
    && apt-get install -y \
        bzip2

COPY . /app

# RUN rm /app/package-lock.json
# RUN rm -Rf /app/node_modules

WORKDIR /app

RUN npm i -f

RUN node buildContainer.js

RUN tar -cjf developer.tar.bz2 developer 

RUN rm -Rf developer

CMD [ "cp", "developer.tar.bz2", "/app/dest/." ]

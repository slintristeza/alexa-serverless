FROM lambci/lambda:build-nodejs12.x

ENV LANG C.UTF-8

RUN mkdir /root/.aws
ADD .aws.credentials /root/.aws/credentials

RUN npm install -g serverless@2.29.0

RUN mkdir /garbage-skill
WORKDIR /garbage-skill

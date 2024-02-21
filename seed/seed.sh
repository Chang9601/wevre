#! /bin/bash

MONGO_HOST="db"
MONGO_DATABASE="wevre"
MONGO_USERNAME="csup"
MONGO_PASSWORD="csup"

mongorestore -h $MONGO_HOST -u $MONGO_USERNAME -p $MONGO_PASSWORD -d $MONGO_DATABASE -c users /opt/bson/users.bson
mongorestore -h $MONGO_HOST -u $MONGO_USERNAME -p $MONGO_PASSWORD -d $MONGO_DATABASE -c materials /opt/bson/materials.bson
mongorestore -h $MONGO_HOST -u $MONGO_USERNAME -p $MONGO_PASSWORD -d $MONGO_DATABASE -c categories /opt/bson/categories.bson
mongorestore -h $MONGO_HOST -u $MONGO_USERNAME -p $MONGO_PASSWORD -d $MONGO_DATABASE -c items /opt/bson/items.bson
mongorestore -h $MONGO_HOST -u $MONGO_USERNAME -p $MONGO_PASSWORD -d $MONGO_DATABASE -c rooms /opt/bson/rooms.bson

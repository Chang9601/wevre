#! /bin/bash

MONGO_HOST="db"
MONGO_DATABASE="wevre"
MONGO_USERNAME="csup"
MONGO_PASSWORD="csup"

mongorestore --host $MONGO_HOST -u $MONGO_USERNAME -p $MONGO_PASSWORD -d $MONGO_DATABASE -c users /opt/bson/users.bson
mongorestore --host $MONGO_HOST -u $MONGO_USERNAME -p $MONGO_PASSWORD -d $MONGO_DATABASE -c materials /opt/bson/materials.bson
mongorestore --host $MONGO_HOST -u $MONGO_USERNAME -p $MONGO_PASSWORD -d $MONGO_DATABASE -c categories /opt/bson/categories.bson
mongorestore --host $MONGO_HOST -u $MONGO_USERNAME -p $MONGO_PASSWORD -d $MONGO_DATABASE -c items /opt/bson/items.bson
mongorestore --host $MONGO_HOST -u $MONGO_USERNAME -p $MONGO_PASSWORD -d $MONGO_DATABASE -c rooms /opt/bson/rooms.bson
mongorestore --host $MONGO_HOST -u $MONGO_USERNAME -p $MONGO_PASSWORD -d $MONGO_DATABASE -c bids /opt/bson/bids.bson
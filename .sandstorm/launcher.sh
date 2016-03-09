#!/bin/bash

# Create a bunch of folders under the clean /var that php, nginx expect to exist
mkdir -p /var/lib/nginx
mkdir -p /var/lib/php5/sessions
mkdir -p /var/lib/mongodb
mkdir -p /var/log
mkdir -p /var/log/nginx
mkdir -p /var/log/mongodb
# Wipe /var/run, since pidfiles and socket files from previous launches should go away
# TODO someday: I'd prefer a tmpfs for these.
rm -rf /var/run
mkdir -p /var/run

mkdir -p /var/kyou/public/bookfiles/thumbnails/
mkdir -p /tmp/kyou/{template_{cached,compiled},}

if [ -f /var/lib/mongodb/mongod.lock ]; then
	rm /var/lib/mongodb/mongod.lock
	/usr/bin/mongod --repair -f /opt/app/.sandstorm/service-config/mongodb.conf
fi

# Spawn php
/usr/sbin/php5-fpm --nodaemonize --fpm-config /etc/php5/fpm/php-fpm.conf &
/usr/bin/mongod -f /opt/app/.sandstorm/service-config/mongodb.conf &
# Wait until php have bound their sockets, indicating readiness
while [ ! -e /var/run/php5-fpm.sock ] ; do
    echo "waiting for php5-fpm to be available at /var/run/php5-fpm.sock"
    sleep .2
done
while [ ! -e /var/run/mongodb-27017.sock ] ; do
    echo "waiting for mongod to be available at /var/run/mongodb-27017.sock"
    sleep .2
done

# Start nginx.
/usr/sbin/nginx -c /opt/app/.sandstorm/service-config/nginx.conf -g "daemon off;"

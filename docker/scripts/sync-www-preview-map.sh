#!/bin/bash

NGINX_CONF_FILE=70_www_preview.map.conf
NGINX_CONF_D=/etc/nginx/conf.d
APP_PATH=/var/lib/pihole-domains
CONF_FILE1=$APP_PATH/www-preview-map-ssr.conf
CONF_FILE2=$APP_PATH/www-preview-map-api.conf
CONF_NGINX=$APP_PATH/${NGINX_CONF_FILE}

echo "map \$http_host \$www_preview_ssr_port {" > $CONF_FILE1
echo "default 443;" >> $CONF_FILE1
docker ps -a --format "table {{.Names}} {{.Ports}}" --filter "name=webservice" | grep "webservice-www" | grep "/tcp" | sed -E "s/webservice-www-([0-9a-f]{8})[^:]*:([0-9]+)-.*/\1-www.omega2k.de \2;/g" >> $CONF_FILE1
echo "}" >> $CONF_FILE1

echo "map \$http_host \$www_preview_api_port {" > $CONF_FILE2
echo "default 443;" >> $CONF_FILE2
docker ps -a --format "table {{.Names}} {{.Ports}}" --filter "name=webservice" | grep "webservice-api" | grep "/tcp" | sed -E "s/webservice-api-([0-9a-f]{8})[^:]*:([0-9]+)-.*/\1-api.omega2k.de \2;/g" >> $CONF_FILE2
echo "}" >> $CONF_FILE2

cat ${CONF_FILE1} ${CONF_FILE2} > ${CONF_NGINX}
cp ${NGINX_CONF_D}/${NGINX_CONF_FILE} ${APP_PATH}/${NGINX_CONF_FILE}.backup
cp ${CONF_NGINX} ${NGINX_CONF_D}/${NGINX_CONF_FILE}

cat ${CONF_NGINX}

if nginx -t 2>/dev/null; then
  systemctl reload nginx.service
else
  cp ${APP_PATH}/${NGINX_CONF_FILE}.backup ${NGINX_CONF_D}/${NGINX_CONF_FILE}
  echo "error: rollback"
fi

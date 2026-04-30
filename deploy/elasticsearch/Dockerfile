FROM docker.elastic.co/elasticsearch/elasticsearch:8.15.3
ENV discovery.type=single-node \
    bootstrap.memory_lock=false \
    xpack.ml.enabled=false \
    ingest.geoip.downloader.enabled=false \
    ES_JAVA_OPTS="-Xms256m -Xmx256m" \
    ES_SETTING_XPACK_SECURITY_ENABLED=false
EXPOSE 9200

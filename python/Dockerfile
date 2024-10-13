FROM google/cloud-sdk:496.0.0-alpine

ARG WORKDIR=/opt/setup
ARG VENV_DIR=/opt/venv
ENV CRC32C_PURE_PYTHON=1

WORKDIR $WORKDIR
COPY ./python/requirements.txt $WORKDIR

RUN apk add --no-cache python3 python3-dev py3-pip build-base geos-dev geos crc32c && \
    python3 -m venv $VENV_DIR && \
    source $VENV_DIR/bin/activate && \
    pip3 install --upgrade pip && \
    pip3 install -r requirements.txt

ENTRYPOINT ["sh", "-c"]
CMD ["while true ; do sleep 60 ; done"]

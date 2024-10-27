FROM python:3.9.20-alpine3.19

WORKDIR /opt/app

COPY . .
RUN apk add --no-cache gcc libc-dev geos-dev geos &&\
    pip3 install gunicorn &&\
    ls -la &&\
    pip3 install -r requirements.txt

CMD ["gunicorn", "--bind", ":8080", "--workers", "1", "--threads", "4", "app:app"]

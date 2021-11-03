FROM alpine

ARG KUBECTL_VERSION=1.22.2

WORKDIR /root/

RUN apk add --no-cache curl

RUN curl -sLO https://storage.googleapis.com/kubernetes-release/release/v${KUBECTL_VERSION}/bin/linux/amd64/kubectl && \
    mv kubectl /usr/bin/kubectl && \
    chmod +x /usr/bin/kubectl

RUN apk add aws-cli

COPY ./entrypoint.sh .

RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["/root/entrypoint.sh"]

CMD ["--help"]

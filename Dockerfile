#########
# TOOLS #
#########

# Use node as the base image
FROM node:26.11.1-trixie as tools

# Install golang
COPY --from=golang:1.27.2-trixie /usr/local/go /usr/local/go
ENV PATH="/usr/local/go/bin:${PATH}"

# Install vdl
COPY --from=varavel/vdl:0.5.0 /usr/local/bin/vdl /usr/local/bin/vdl

# Install veta
COPY --from=varavel/veta:0.1.1 /usr/local/bin/veta /usr/local/bin/veta

# Install dprint
COPY --from=ghcr.io/varavelio/container-tools/dprint:0.63.0 /usr/local/bin/dprint /usr/local/bin/dprint

# Environment variables
ENV \
  PIP_BREAK_SYSTEM_PACKAGES=1 \
  CGO_ENABLED=0

# Build time variables
ARG DEBIAN_FRONTEND=noninteractive

RUN set -e && \
    # Update and install system dependencies
    apt-get update -qq && \
    apt-get install -yqq --no-install-recommends \
        git wget curl zip unzip p7zip-full tree ripgrep \
        python3 python3-pip && \
    rm -rf /var/lib/apt/lists/* && \
    # Git config
    git config --system --add safe.directory '*'

WORKDIR /workspaces/vdl-plugin-sdk

################
# DEVCONTAINER #
################

FROM tools AS devcontainer

CMD ["sleep", "infinity"]

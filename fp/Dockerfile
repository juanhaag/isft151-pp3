FROM postgis/postgis:16-3.4

# Install build dependencies, git, postgres development headers, and clang/llvm
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    postgresql-server-dev-16 \
    clang-13 \
    llvm-13 \
    && rm -rf /var/lib/apt/lists/*

# Clone, compile, and install pgvector
RUN git clone --branch v0.7.2 https://github.com/pgvector/pgvector.git /tmp/pgvector \
    && cd /tmp/pgvector \
    && make \
    && make install \
    && rm -rf /tmp/pgvector

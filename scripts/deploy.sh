#!/bin/sh
# execute with REACT_APP_BLOCKNATIVE_KEY and REACT_APP_INFURA_TOKEN env variables

yarn build-mainnet
aws s3 sync ./build_webpack s3://safe.leapdao.org/app  --acl public-read
aws s3 cp ./build_webpack/index.html s3://safe.leapdao.org  --acl public-read
aws s3 cp ./build_webpack/leap-safe-32x32.png s3://safe.leapdao.org  --acl public-read
aws s3 cp ./build_webpack/leap-safe-196x196.png s3://safe.leapdao.org  --acl public-read
aws cloudfront create-invalidation --distribution-id EFJWIP910NMBK --paths '/*'
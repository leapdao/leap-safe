#!/bin/sh
# execute with REACT_APP_BLOCKNATIVE_KEY and REACT_APP_INFURA_TOKEN env variables

REACT_APP_GNOSIS_APPS_URL=https://apps.gnosis-safe.io yarn build-mainnet
aws s3 sync ./build s3://safe.leapdao.org/  --acl public-read
aws cloudfront create-invalidation --distribution-id EFJWIP910NMBK --paths '/*'
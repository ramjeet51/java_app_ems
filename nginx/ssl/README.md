# SSL Certificates

This directory must contain `fullchain.pem` and `privkey.pem` before `nginx`
can start (see `../nginx.conf`).

## Local development

Run the helper script to generate a self-signed pair:

```bash
./generate-self-signed.sh
```

This creates `fullchain.pem` and `privkey.pem` valid for 365 days against
CN=localhost. Browsers will show a certificate warning — that's expected for
self-signed certs and fine for local development.

## Production

Replace both files with certificates issued by a real Certificate Authority,
for example via [certbot](https://certbot.eff.org/) (Let's Encrypt) or your
organization's internal CA. Keep `privkey.pem` out of version control.

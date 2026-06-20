# Local PWA HTTPS On A Phone

This guide runs the storefront on your local network with a trusted HTTPS certificate for:

```text
https://192.168.209.236:3000
```

The PWA install prompt requires a secure origin. A self-signed certificate works only after the phone trusts the local CA that signed it.

## 1. Get Your Computer IP

On Linux:

```sh
ip -4 addr show | grep -oP '(?<=inet\s)(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))[0-9.]+'
```

Your current IP is:

```text
192.168.209.236
```

If this IP changes, regenerate the certificate and pass the new IP to `pnpm dev:https`.

## 2. Install mkcert On Your Computer

Install `mkcert` with your system package manager. On Arch-based systems:

```sh
sudo pacman -S mkcert nss
```

On Debian/Ubuntu:

```sh
sudo apt install libnss3-tools
```

Then install `mkcert` from your package manager, Homebrew, or the mkcert releases page.

Initialize the local CA:

```sh
mkcert -install
```

This creates the local root CA at:

```text
~/.local/share/mkcert/rootCA.pem
```

## 3. Generate The IP Certificate

From `apps/front-end`:

```sh
mkdir -p certificates
mkcert \
  -key-file certificates/192.168.209.236-key.pem \
  -cert-file certificates/192.168.209.236.pem \
  192.168.209.236
```

The generated files are ignored by git:

```text
apps/front-end/certificates/192.168.209.236-key.pem
apps/front-end/certificates/192.168.209.236.pem
```

## 4. Export The CA For Your Phone

From any directory:

```sh
cp ~/.local/share/mkcert/rootCA.pem ~/Downloads/erva-mate-local-rootCA.crt
```

Send `~/Downloads/erva-mate-local-rootCA.crt` to the phone by USB, email, cloud storage, or another file transfer method.

## 5. Install The CA On Android

Menu names vary by vendor, but the path is usually:

1. Open `Settings`.
2. Go to `Security & privacy`.
3. Open `More security settings`.
4. Open `Encryption & credentials`.
5. Tap `Install a certificate`.
6. Choose `CA certificate`.
7. Select `erva-mate-local-rootCA.crt`.
8. Confirm the warning.
9. Restart Chrome.

Also verify:

1. Open `Settings`.
2. Search for `Private DNS`.
3. Set `Private DNS` to `Off` or `Automatic`.

## 6. Install The CA On iPhone

Send `erva-mate-local-rootCA.crt` to the iPhone, then:

1. Open the certificate file.
2. Tap `Allow` to download the profile.
3. Open `Settings`.
4. Tap `Profile Downloaded`.
5. Tap `Install`.
6. Enter the device passcode.
7. Tap `Install` again.

Then enable full trust:

1. Open `Settings`.
2. Go to `General`.
3. Go to `About`.
4. Open `Certificate Trust Settings`.
5. Enable full trust for the mkcert root CA.
6. Confirm.

Restart Safari or Chrome after trusting the CA.

## 7. Run The Storefront

From `apps/front-end`:

```sh
pnpm dev:https --192.168.209.236
```

These forms also work:

```sh
pnpm dev:https 192.168.209.236
pnpm dev:https -- --ip=192.168.209.236
```

Open this URL on the phone:

```text
https://192.168.209.236:3000
```

If the browser still shows a certificate warning, the phone either does not trust the mkcert CA yet, or the IP changed and the certificate no longer matches the URL.

## 8. Install The PWA

Android Chrome:

1. Open `https://192.168.209.236:3000`.
2. Wait for the page to finish loading.
3. Open the three-dot menu.
4. Tap `Install app` or `Add to Home screen`.

iPhone Safari:

1. Open `https://192.168.209.236:3000`.
2. Tap the share button.
3. Tap `Add to Home Screen`.

## Troubleshooting

Check certificate match:

```sh
openssl x509 -in certificates/192.168.209.236.pem -noout -text | grep -A2 "Subject Alternative Name"
```

It must include:

```text
IP Address:192.168.209.236
```

Reset generated Next files if the dev server reports lockfile permission errors:

```sh
sudo rm -rf .next
```

Then run again:

```sh
pnpm dev:https --192.168.209.236
```

Clear old service workers on Android Chrome:

1. Open `chrome://serviceworker-internals` if available, or clear site data for `192.168.209.236`.
2. Reload `https://192.168.209.236:3000`.

For installability, the page must load without a certificate warning. The PWA will not install from an untrusted HTTPS page.

# gemz.lk

Static website project for gemz.lk.

The homepage hero video is served from the public Vercel Blob store `gemz-hero-media` in Singapore (`sin1`). Its URL is set directly in `index.html`, so the static site does not need a Blob SDK or runtime token.

The local `assets/hero.mp4` copy is ignored to keep it out of future deployments. To replace the video, upload a new file with a unique URL:

```sh
vercel blob put ./path/to/new-hero.mp4 --access public --pathname hero.mp4 --add-random-suffix --content-type video/mp4 --cache-control-max-age 31536000
```

Then update the hero `<source>` URL in `index.html` with the URL returned by the command.

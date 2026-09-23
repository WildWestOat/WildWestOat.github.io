# WildWestOat.github.io

A plain HTML + CSS personal site. No Jekyll, no build step — `.nojekyll` tells
GitHub Pages to serve the files exactly as they are. Blog posts are Markdown
files rendered in the browser.

## Layout

```
index.html          home page, lists posts
post.html           renders one post: post.html?p=<slug>
about.html          about page
css/style.css       all the styling
js/site.js          front matter parsing + post list rendering
blogs/              your posts live here
  posts.json        list of post filenames
  hello-world.md    example post
tools/index-posts.sh  regenerates blogs/posts.json
.nojekyll           keeps GitHub Pages from running Jekyll
```

## Writing a post

Create `blogs/my-post.md`:

```markdown
---
title: My post
date: 2026-10-01
summary: Shown under the title on the home page.
tags: [notes]
---

Body goes here.
```

Then update the index and push:

```sh
tools/index-posts.sh
git add -A && git commit -m "post: my post" && git push
```

It will be live at `/post.html?p=my-post`. Posts are sorted newest first by the
`date` field, so use `YYYY-MM-DD`.

## Previewing locally

`fetch()` needs a real server, so opening `index.html` from disk won't work:

```sh
python3 -m http.server 8000
# http://localhost:8000
```

## Notes

- Markdown is rendered client-side with [marked](https://marked.js.org/) from a
  CDN. Raw HTML inside a post is passed through, which is fine because you are
  the only author — don't paste in Markdown from untrusted sources.
- Images: put them anywhere (e.g. `images/`) and reference them relative to the
  site root, `![alt](images/thing.png)`.

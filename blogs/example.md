---
title: Hello, world
date: 2026-09-23
summary: How this site works, and how to add a post to it.
tags: [meta, notes]
---

This site is plain HTML and CSS — no Jekyll, no build step, no gems. Posts are
Markdown files living in `blogs/`, rendered in the browser by
[marked](https://marked.js.org/).

## Adding a post

1. Create `blogs/my-new-post.md`.
2. Start it with a front matter block:

```markdown
---
title: My new post
date: 2026-10-01
summary: One line that shows up on the home page.
tags: [rust, notes]
---

Write the body here.
```

3. Add the filename to `blogs/posts.json`, or just run `tools/index-posts.sh`
   to regenerate that list from whatever is in the folder.
4. Commit and push. GitHub Pages serves it within a minute or so.

## What Markdown gives you

Everything GitHub-flavoured Markdown supports: **bold**, *italics*, `inline
code`, lists, tables, and fenced code blocks.

```python
def greet(name: str) -> str:
    return f"howdy, {name}"
```

| Thing        | Supported |
| ------------ | --------- |
| Tables       | yes       |
| Code blocks  | yes       |
| Images       | yes       |

> Blockquotes work too.

That's the whole system.

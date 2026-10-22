# Maintaining your site

Live URL: https://sreevishnu0506-cyber.github.io/Sree-Vishnu-Blog/

## Add a blog post

Create a file in `_posts` named `YYYY-MM-DD-your-title.md`. Paste this header, then write your post below it:

```markdown
---
title: Your post title
description: One sentence describing your post.
---

Write your post here using Markdown.
```

Commit the file to `main`. GitHub Pages rebuilds automatically. Posts dated in the future do not appear until their date is reached and a build runs.

## Update your portfolio

- Edit `about.md` to add your bio.
- Edit `projects.html` to add project entries, and `index.html` for featured projects.
- Edit `style.css` for colors and typography.
- `_layouts/default.html` controls the shared header and footer.
- `_config.yml` controls the site name and URL. Keep `baseurl` aligned with the repository name.

The launch post is starter copy; edit or remove it whenever you’re ready.

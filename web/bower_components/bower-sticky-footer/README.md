# bower-sticky-footer
A bower component for the bootstrap "sticky footer" template with some customization

## How to use this package

1. Add it as a bower dependency to your project with `bower install --save`.
2. Copy the sample file in `/bower_components/sticky-footer/example/index.html` into your project
3. Wire the dependencies with `wiredep --src index.html`

## How this package was registered with `bower.io`

1. `bower register sticky-footer git@github.com:SoftEng-HEIGVD/bower-sticky-footer.git`

```
Package sticky-footer registered successfully!
All valid semver tags on git://github.com/SoftEng-HEIGVD/bower-sticky-footer.git will be available as versions.
To publish a new version, just release a valid semver tag.

Run bower info sticky-footer to list the available versions.
```

## How to create a new version

1. Implement the feature / fix the bug
2. Edit the version in `bower.json`
3. Commit the changes with `git`
4. Tag the version with `git tag -a x.x.x -m 'message'`
5. Push the tag with `git push origin x.x.x`

